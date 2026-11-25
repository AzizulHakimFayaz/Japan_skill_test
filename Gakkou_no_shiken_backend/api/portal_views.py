"""
Student Portal & Sensei Course/Video Studio APIs.

Student Portal:
  GET  /api/student/portal/                                 -> Full portal payload (works for enrolled & unenrolled students)
  POST /api/student/portal/lessons/<int:lesson_id>/progress/ -> Toggle lesson completion / watch time
  GET/POST /api/student/portal/courses/<int:course_id>/discussions/ -> Course Q&A thread

Sensei Course & Schedule Studio:
  GET  /api/partners/<slug:slug>/studio/                    -> All courses, modules, lessons, discussions, schedule
  POST /api/partners/<slug:slug>/studio/action/             -> Create/edit/delete courses, modules, video lessons (URL or MP4 upload), schedule
"""

import datetime
import re
from typing import Any

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import (
    PartnerAssignedExam,
    PartnerCourse,
    PartnerCourseDiscussion,
    PartnerCourseLesson,
    PartnerCourseModule,
    PartnerNotification,
    PartnerScheduleEvent,
    PartnerSchool,
    PartnerStudyNote,
    StudentLessonProgress,
    UserProfile,
)
from tests.models import Attempt, JLPTAttempt
from .serializers import get_absolute_media_url

MAX_VIDEO_UPLOAD_BYTES = 150 * 1024 * 1024  # 150 MB safety cap for shared hosting


def _authorize_sensei(request, school: PartnerSchool) -> bool:
    key = (
        request.query_params.get('key')
        or request.headers.get('X-Sensei-Key')
        or (request.data.get('key') if isinstance(request.data, dict) else '')
        or ''
    ).strip()
    if key and school.access_token and key == school.access_token:
        return True
    user = getattr(request, 'user', None)
    if user and user.is_authenticated:
        if user.is_staff or user.is_superuser:
            return True
        if school.owner_id and school.owner_id == user.id:
            return True
    return False


def _resolve_video_payload(lesson: PartnerCourseLesson, request) -> dict[str, Any]:
    """Resolves either an uploaded MP4/WebM file or a YouTube/Vimeo/Drive/MP4 URL into a playable descriptor."""
    if lesson.video_file:
        return {
            'video_type': 'file',
            'embed_url': get_absolute_media_url(lesson.video_file, request),
            'raw_video_url': get_absolute_media_url(lesson.video_file, request),
            'has_uploaded_file': True,
        }

    raw_url = (lesson.video_url or '').strip()
    if not raw_url:
        return {
            'video_type': 'none',
            'embed_url': '',
            'raw_video_url': '',
            'has_uploaded_file': False,
        }

    # YouTube
    yt_match = re.search(
        r'(?:youtube\.com/(?:watch\?v=|embed/|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})',
        raw_url,
    )
    if yt_match:
        vid_id = yt_match.group(1)
        return {
            'video_type': 'youtube',
            'embed_url': f'https://www.youtube.com/embed/{vid_id}?rel=0',
            'raw_video_url': raw_url,
            'has_uploaded_file': False,
        }

    # Vimeo
    vimeo_match = re.search(r'vimeo\.com/(?:video/)?(\d+)', raw_url)
    if vimeo_match:
        return {
            'video_type': 'vimeo',
            'embed_url': f'https://player.vimeo.com/video/{vimeo_match.group(1)}',
            'raw_video_url': raw_url,
            'has_uploaded_file': False,
        }

    # Google Drive
    drive_match = re.search(r'drive\.google\.com/file/d/([A-Za-z0-9_-]+)', raw_url)
    if drive_match:
        return {
            'video_type': 'iframe',
            'embed_url': f'https://drive.google.com/file/d/{drive_match.group(1)}/preview',
            'raw_video_url': raw_url,
            'has_uploaded_file': False,
        }

    # Direct MP4/WebM/OGG
    if re.search(r'\.(mp4|webm|ogg|mov)(\?.*)?$', raw_url, re.IGNORECASE):
        return {
            'video_type': 'file',
            'embed_url': raw_url,
            'raw_video_url': raw_url,
            'has_uploaded_file': False,
        }

    return {
        'video_type': 'external',
        'embed_url': raw_url,
        'raw_video_url': raw_url,
        'has_uploaded_file': False,
    }


def _serialize_course(
    course: PartnerCourse,
    request,
    completed_lesson_ids: set[int] | None = None,
    include_unpublished: bool = False,
) -> dict[str, Any]:
    completed_ids = completed_lesson_ids or set()
    modules_data = []
    total_lessons = 0
    completed_count = 0
    total_duration = 0

    for mod in course.modules.all().order_by('order_index', 'id'):
        lessons_data = []
        mod_duration = 0
        mod_completed = 0
        for les in mod.lessons.all().order_by('order_index', 'id'):
            if not include_unpublished and not les.is_published:
                continue
            total_lessons += 1
            dur = int(les.duration_minutes or 0)
            total_duration += dur
            mod_duration += dur
            is_done = les.id in completed_ids
            if is_done:
                completed_count += 1
                mod_completed += 1
            vid = _resolve_video_payload(les, request)
            lessons_data.append(
                {
                    'id': les.id,
                    'module_id': mod.id,
                    'title': les.title,
                    'description': les.description,
                    'duration_minutes': dur,
                    'order_index': les.order_index,
                    'resource_url': les.resource_url,
                    'is_published': les.is_published,
                    'is_completed': is_done,
                    **vid,
                }
            )
        modules_data.append(
            {
                'id': mod.id,
                'title': mod.title,
                'description': mod.description,
                'order_index': mod.order_index,
                'lesson_count': len(lessons_data),
                'completed_count': mod_completed,
                'duration_minutes': mod_duration,
                'lessons': lessons_data,
            }
        )

    progress_pct = round((completed_count / total_lessons) * 100) if total_lessons > 0 else 0
    outcomes = [line.strip() for line in (course.outcomes_text or '').splitlines() if line.strip()]

    return {
        'id': course.id,
        'title': course.title,
        'category': course.category,
        'category_label': course.get_category_display(),
        'level_badge': course.level_badge,
        'instructor_name': course.instructor_name or course.school.contact_person or course.school.name,
        'description': course.description,
        'outcomes': outcomes,
        'outcomes_text': course.outcomes_text,
        'audience_text': course.audience_text,
        'target_batch': course.target_batch,
        'order_index': course.order_index,
        'is_published': course.is_published,
        'module_count': len(modules_data),
        'lesson_count': total_lessons,
        'completed_count': completed_count,
        'total_duration_minutes': total_duration,
        'progress_pct': progress_pct,
        'status': 'completed' if (total_lessons > 0 and completed_count >= total_lessons) else ('ongoing' if completed_count > 0 else 'not_started'),
        'modules': modules_data,
        'created_at': course.created_at.isoformat(),
    }


def _batch_filter_q(batch: str) -> Q:
    if not batch:
        return Q(target_batch='') | Q(target_batch__isnull=True)
    return Q(target_batch='') | Q(target_batch__isnull=True) | Q(target_batch__iexact=batch)


class StudentPortalOverviewAPIView(APIView):
    """
    GET /api/student/portal/
    Returns the complete Student Portal dataset.
    Works seamlessly for BOTH enrolled academy students AND independent/unenrolled students!
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response(
                {
                    'authenticated': False,
                    'is_enrolled': False,
                    'detail': 'Sign in to access your personalized Gakkou Student Portal.',
                },
                status=status.HTTP_200_OK,
            )

        profile, _ = UserProfile.objects.select_related('partner_school').get_or_create(user=user)
        school = profile.partner_school if (profile.partner_school and profile.partner_school.is_active) else None
        is_enrolled = bool(school and profile.partner_status == UserProfile.PartnerStatus.APPROVED)

        # Student real exam activity (works for ALL students, enrolled or not!)
        jft_attempts = list(
            Attempt.objects.filter(user=user, completed_at__isnull=False)
            .select_related('test')
            .order_by('-completed_at')[:30]
        )
        jlpt_attempts = list(
            JLPTAttempt.objects.filter(user=user)
            .select_related('jlpt_set')
            .order_by('-completed_at')[:30]
        )

        # Build 7-day weekly activity chart (real completions + test attempts)
        today = timezone.localdate()
        completed_qs = StudentLessonProgress.objects.filter(user=user, is_completed=True)
        completed_ids = set(completed_qs.values_list('lesson_id', flat=True))

        day_counts: dict[datetime.date, int] = {today - datetime.timedelta(days=i): 0 for i in range(6, -1, -1)}
        for a in jft_attempts:
            if a.completed_at:
                d = timezone.localdate(a.completed_at)
                if d in day_counts:
                    day_counts[d] += 1
        for ja in jlpt_attempts:
            if ja.completed_at:
                d = timezone.localdate(ja.completed_at)
                if d in day_counts:
                    day_counts[d] += 1
        for prog in completed_qs.filter(updated_at__date__gte=today - datetime.timedelta(days=6)):
            d = timezone.localdate(prog.updated_at)
            if d in day_counts:
                day_counts[d] += 1

        weekly_activity = [
            {
                'date': d.isoformat(),
                'day': d.strftime('%a'),
                'tasks': cnt,
            }
            for d, cnt in day_counts.items()
        ]

        # Recent exam history (replaces Payment History in dashboard)
        recent_exams = []
        for a in jft_attempts[:5]:
            pct = round((a.score / a.total_questions) * 100) if a.total_questions else 0
            recent_exams.append(
                {
                    'id': f'jft-{a.id}',
                    'title': a.test.title if a.test else 'Mock Test',
                    'score_label': f'{a.score}/{a.total_questions} ({pct}%)',
                    'percentage': pct,
                    'date': a.completed_at.isoformat() if a.completed_at else '',
                    'href': f'/attempt/{a.id}',
                }
            )
        for ja in jlpt_attempts[:5]:
            pct = round((ja.score / ja.total_questions) * 100) if ja.total_questions else 0
            recent_exams.append(
                {
                    'id': f'jlpt-{ja.id}',
                    'title': ja.jlpt_set.title if ja.jlpt_set else 'JLPT Set',
                    'score_label': f'{ja.score}/{ja.total_questions} ({pct}%)',
                    'percentage': pct,
                    'date': ja.completed_at.isoformat() if ja.completed_at else '',
                    'href': '/jlpt',
                }
            )
        recent_exams.sort(key=lambda x: x['date'], reverse=True)
        recent_exams = recent_exams[:6]

        # Academy-specific content (only when enrolled & approved)
        courses_payload = []
        resources_payload = []
        schedule_payload = []
        notices_payload = []
        assigned_exams_payload = []
        school_payload = None

        if school:
            school_payload = {
                'id': school.id,
                'name': school.name,
                'slug': school.slug,
                'city': school.city,
                'country': school.country,
                'contact_person': school.contact_person,
                'contact_whatsapp_or_email': school.contact_whatsapp_or_email,
                'welcome_message': school.welcome_message,
            }

        if is_enrolled and school:
            batch = (profile.partner_batch or '').strip()
            bq = _batch_filter_q(batch)

            courses_qs = (
                PartnerCourse.objects.filter(school=school, is_published=True)
                .filter(bq)
                .prefetch_related('modules__lessons')
                .order_by('order_index', '-created_at')
            )
            courses_payload = [_serialize_course(c, request, completed_ids) for c in courses_qs]

            notes_qs = PartnerStudyNote.objects.filter(school=school).filter(bq).order_by('-is_pinned', '-created_at')[:60]
            resources_payload = [
                {
                    'id': n.id,
                    'title': n.title,
                    'category': n.category,
                    'category_label': n.get_category_display(),
                    'content': n.content,
                    'external_url': n.external_url,
                    'is_pinned': n.is_pinned,
                    'created_at': n.created_at.isoformat(),
                }
                for n in notes_qs
            ]

            events_qs = PartnerScheduleEvent.objects.filter(school=school).filter(bq).order_by('event_date', 'start_time_label')[:60]
            schedule_payload = [
                {
                    'id': ev.id,
                    'title': ev.title,
                    'event_type': ev.event_type,
                    'event_type_label': ev.get_event_type_display(),
                    'event_date': ev.event_date.isoformat(),
                    'start_time_label': ev.start_time_label,
                    'end_time_label': ev.end_time_label,
                    'meeting_url': ev.meeting_url,
                    'notes': ev.notes,
                }
                for ev in events_qs
            ]

            notices_qs = PartnerNotification.objects.filter(school=school, is_active=True).filter(bq).order_by('-created_at')[:30]
            notices_payload = [
                {
                    'id': nt.id,
                    'title': nt.title,
                    'message': nt.message,
                    'priority': nt.priority,
                    'created_at': nt.created_at.isoformat(),
                }
                for nt in notices_qs
            ]

            exams_qs = PartnerAssignedExam.objects.filter(school=school, is_active=True).filter(bq).select_related('test')[:20]
            assigned_exams_payload = [
                {
                    'id': ex.id,
                    'test_id': ex.test_id,
                    'title': ex.title or (ex.test.title if ex.test else 'Assigned Exam'),
                    'scheduled_date_label': ex.scheduled_date_label,
                    'instructions': ex.instructions,
                    'require_pin': ex.require_pin,
                }
                for ex in exams_qs
            ]

        total_lessons = sum(c['lesson_count'] for c in courses_payload)
        completed_lessons = sum(c['completed_count'] for c in courses_payload)
        courses_completed = sum(1 for c in courses_payload if c['status'] == 'completed')
        courses_in_progress = sum(1 for c in courses_payload if c['status'] != 'completed')

        video_mins = completed_lessons * 15
        mock_mins = (len(jft_attempts) + len(jlpt_attempts)) * 18
        vocab_mins = min(180, int((profile.game_words_mastered or 0) * 1.5))
        total_mins = video_mins + mock_mins + vocab_mins

        all_pcts = [e['percentage'] for e in recent_exams]
        avg_score_pct = round(sum(all_pcts) / len(all_pcts)) if all_pcts else 0

        full_name = f'{user.first_name} {user.last_name}'.strip() or user.username

        return Response(
            {
                'authenticated': True,
                'is_enrolled': is_enrolled,
                'partner_status': profile.partner_status if school else 'none',
                'school': school_payload,
                'student': {
                    'id': user.id,
                    'username': user.username,
                    'full_name': full_name,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'bio': profile.bio,
                    'target_exam': profile.target_exam,
                    'japanese_level': profile.japanese_level,
                    'location': profile.location,
                    'country': profile.country or '',
                    'partner_batch': profile.partner_batch,
                    'student_roll_or_id': profile.student_roll_or_id,
                    'game_xp': profile.game_xp,
                    'game_level': profile.game_level,
                    'game_streak': profile.game_streak,
                    'game_words_mastered': profile.game_words_mastered,
                },
                'stats': {
                    'total_courses': len(courses_payload),
                    'courses_in_progress': courses_in_progress,
                    'courses_completed': courses_completed,
                    'total_lessons': total_lessons,
                    'completed_lessons': completed_lessons,
                    'total_attempts': len(jft_attempts) + len(jlpt_attempts),
                    'avg_score_pct': avg_score_pct,
                    'learning_time_minutes': total_mins,
                    'time_breakdown': {
                        'video': video_mins,
                        'mock_tests': mock_mins,
                        'vocab': vocab_mins,
                    },
                    'weekly_activity': weekly_activity,
                },
                'courses': courses_payload,
                'resources': resources_payload,
                'schedule': schedule_payload,
                'notices': notices_payload,
                'assigned_exams': assigned_exams_payload,
                'recent_exams': recent_exams,
            }
        )


class StudentLessonProgressAPIView(APIView):
    """POST /api/student/portal/lessons/<int:lesson_id>/progress/ — Mark video lesson complete/incomplete."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_id):
        lesson = get_object_or_404(PartnerCourseLesson.objects.select_related('module__course__school'), pk=lesson_id)
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        school = lesson.module.course.school
        is_allowed = (
            (profile.partner_school_id == school.id and profile.partner_status == UserProfile.PartnerStatus.APPROVED)
            or school.owner_id == request.user.id
            or request.user.is_staff
        )
        if not is_allowed:
            return Response({'detail': 'You are not enrolled in this academy.'}, status=status.HTTP_403_FORBIDDEN)

        is_completed = request.data.get('is_completed', True)
        if isinstance(is_completed, str):
            is_completed = is_completed.lower() in ('true', '1', 'yes')
        watched_seconds = int(request.data.get('watched_seconds') or 0)

        prog, _ = StudentLessonProgress.objects.update_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'is_completed': bool(is_completed), 'watched_seconds': max(0, watched_seconds)},
        )
        return Response(
            {
                'lesson_id': lesson.id,
                'is_completed': prog.is_completed,
                'watched_seconds': prog.watched_seconds,
            }
        )


class StudentCourseDiscussionAPIView(APIView):
    """GET/POST /api/student/portal/courses/<int:course_id>/discussions/ — Course Q&A thread."""

    permission_classes = [permissions.IsAuthenticated]

    def _check_access(self, request, course: PartnerCourse):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        school = course.school
        if school.owner_id == request.user.id or request.user.is_staff:
            return True, PartnerCourseDiscussion.AuthorRole.SENSEI
        if profile.partner_school_id == school.id and profile.partner_status == UserProfile.PartnerStatus.APPROVED:
            return True, PartnerCourseDiscussion.AuthorRole.STUDENT
        return False, None

    def get(self, request, course_id):
        course = get_object_or_404(PartnerCourse.objects.select_related('school'), pk=course_id)
        ok, _ = self._check_access(request, course)
        if not ok:
            return Response({'detail': 'Not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)

        msgs = PartnerCourseDiscussion.objects.filter(course=course).select_related('lesson')[:60]
        return Response(
            {
                'discussions': [
                    {
                        'id': m.id,
                        'author_name': m.author_name or (m.user.username if m.user else 'Student'),
                        'author_role': m.author_role,
                        'lesson_title': m.lesson.title if m.lesson else '',
                        'message': m.message,
                        'created_at': m.created_at.isoformat(),
                    }
                    for m in msgs
                ]
            }
        )

    def post(self, request, course_id):
        course = get_object_or_404(PartnerCourse.objects.select_related('school'), pk=course_id)
        ok, role = self._check_access(request, course)
        if not ok:
            return Response({'detail': 'Not enrolled in this course.'}, status=status.HTTP_403_FORBIDDEN)

        body = (request.data.get('message') or '').strip()
        if not body:
            return Response({'detail': 'Message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        lesson_id = request.data.get('lesson_id')
        lesson = None
        if lesson_id:
            lesson = PartnerCourseLesson.objects.filter(pk=lesson_id, module__course=course).first()

        author_name = f'{request.user.first_name} {request.user.last_name}'.strip() or request.user.username
        msg = PartnerCourseDiscussion.objects.create(
            course=course,
            lesson=lesson,
            user=request.user,
            author_name=author_name,
            author_role=role or PartnerCourseDiscussion.AuthorRole.STUDENT,
            message=body[:1500],
        )
        return Response(
            {
                'id': msg.id,
                'author_name': msg.author_name,
                'author_role': msg.author_role,
                'lesson_title': lesson.title if lesson else '',
                'message': msg.message,
                'created_at': msg.created_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )


class SenseiStudioAPIView(APIView):
    """GET /api/partners/<slug:slug>/studio/ — Full Course, Video & Schedule Studio payload for Senseis."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        school = get_object_or_404(PartnerSchool, slug=slug)
        if not _authorize_sensei(request, school):
            return Response({'detail': 'Sensei authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        courses = (
            PartnerCourse.objects.filter(school=school)
            .prefetch_related('modules__lessons')
            .order_by('order_index', '-created_at')
        )
        events = PartnerScheduleEvent.objects.filter(school=school).order_by('event_date', 'start_time_label')[:80]
        discussions = (
            PartnerCourseDiscussion.objects.filter(course__school=school)
            .select_related('course', 'lesson')
            .order_by('-created_at')[:40]
        )

        return Response(
            {
                'school': {
                    'id': school.id,
                    'name': school.name,
                    'slug': school.slug,
                },
                'courses': [_serialize_course(c, request, include_unpublished=True) for c in courses],
                'schedule': [
                    {
                        'id': ev.id,
                        'title': ev.title,
                        'event_type': ev.event_type,
                        'event_type_label': ev.get_event_type_display(),
                        'event_date': ev.event_date.isoformat(),
                        'start_time_label': ev.start_time_label,
                        'end_time_label': ev.end_time_label,
                        'meeting_url': ev.meeting_url,
                        'target_batch': ev.target_batch,
                        'notes': ev.notes,
                    }
                    for ev in events
                ],
                'discussions': [
                    {
                        'id': d.id,
                        'course_id': d.course_id,
                        'course_title': d.course.title,
                        'lesson_title': d.lesson.title if d.lesson else '',
                        'author_name': d.author_name,
                        'author_role': d.author_role,
                        'message': d.message,
                        'created_at': d.created_at.isoformat(),
                    }
                    for d in discussions
                ],
            }
        )


class SenseiStudioActionAPIView(APIView):
    """POST /api/partners/<slug:slug>/studio/action/ — Manage courses, modules, video lessons (URL or MP4 upload), schedule."""

    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, slug):
        school = get_object_or_404(PartnerSchool, slug=slug)
        if not _authorize_sensei(request, school):
            return Response({'detail': 'Sensei authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        action = (request.data.get('action') or '').strip()

        if action == 'create_course':
            title = (request.data.get('title') or '').strip()
            if not title:
                return Response({'detail': 'Course title is required.'}, status=status.HTTP_400_BAD_REQUEST)
            course = PartnerCourse.objects.create(
                school=school,
                title=title[:220],
                category=(request.data.get('category') or PartnerCourse.Category.JFT_BASIC).strip(),
                level_badge=(request.data.get('level_badge') or 'N5 • A2').strip()[:32],
                instructor_name=(request.data.get('instructor_name') or school.contact_person or school.name).strip()[:150],
                description=(request.data.get('description') or '').strip(),
                outcomes_text=(request.data.get('outcomes_text') or '').strip(),
                audience_text=(request.data.get('audience_text') or '').strip(),
                target_batch=(request.data.get('target_batch') or '').strip()[:64],
                order_index=PartnerCourse.objects.filter(school=school).count() + 1,
            )
            return Response({'detail': 'Course created.', 'course': _serialize_course(course, request, include_unpublished=True)}, status=status.HTTP_201_CREATED)

        if action == 'delete_course':
            cid = request.data.get('course_id')
            deleted, _ = PartnerCourse.objects.filter(pk=cid, school=school).delete()
            if not deleted:
                return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'detail': 'Course deleted.'})

        if action == 'create_module':
            course = get_object_or_404(PartnerCourse, pk=request.data.get('course_id'), school=school)
            title = (request.data.get('title') or '').strip()
            if not title:
                return Response({'detail': 'Module title is required.'}, status=status.HTTP_400_BAD_REQUEST)
            mod = PartnerCourseModule.objects.create(
                course=course,
                title=title[:220],
                description=(request.data.get('description') or '').strip()[:400],
                order_index=course.modules.count() + 1,
            )
            return Response({'detail': 'Module added.', 'module_id': mod.id}, status=status.HTTP_201_CREATED)

        if action == 'delete_module':
            mid = request.data.get('module_id')
            deleted, _ = PartnerCourseModule.objects.filter(pk=mid, course__school=school).delete()
            if not deleted:
                return Response({'detail': 'Module not found.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'detail': 'Module deleted.'})

        if action == 'create_lesson':
            mod = get_object_or_404(PartnerCourseModule, pk=request.data.get('module_id'), course__school=school)
            title = (request.data.get('title') or '').strip()
            if not title:
                return Response({'detail': 'Lesson title is required.'}, status=status.HTTP_400_BAD_REQUEST)

            video_file = request.FILES.get('video_file')
            if video_file and video_file.size > MAX_VIDEO_UPLOAD_BYTES:
                return Response(
                    {'detail': 'Video file exceeds 150 MB limit. For larger videos, upload to YouTube (Unlisted) or Google Drive and paste the link.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                duration = max(1, int(request.data.get('duration_minutes') or 15))
            except (TypeError, ValueError):
                duration = 15

            lesson = PartnerCourseLesson.objects.create(
                module=mod,
                title=title[:220],
                description=(request.data.get('description') or '').strip(),
                video_url=(request.data.get('video_url') or '').strip()[:600],
                video_file=video_file,
                resource_url=(request.data.get('resource_url') or '').strip()[:600],
                duration_minutes=duration,
                order_index=mod.lessons.count() + 1,
            )
            return Response({'detail': 'Video lesson added.', 'lesson_id': lesson.id}, status=status.HTTP_201_CREATED)

        if action == 'delete_lesson':
            lid = request.data.get('lesson_id')
            deleted, _ = PartnerCourseLesson.objects.filter(pk=lid, module__course__school=school).delete()
            if not deleted:
                return Response({'detail': 'Lesson not found.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'detail': 'Lesson deleted.'})

        if action == 'create_schedule':
            title = (request.data.get('title') or '').strip()
            raw_date = (request.data.get('event_date') or '').strip()
            if not title or not raw_date:
                return Response({'detail': 'Title and date (YYYY-MM-DD) are required.'}, status=status.HTTP_400_BAD_REQUEST)
            try:
                ev_date = datetime.date.fromisoformat(raw_date)
            except ValueError:
                return Response({'detail': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

            ev = PartnerScheduleEvent.objects.create(
                school=school,
                title=title[:200],
                event_type=(request.data.get('event_type') or PartnerScheduleEvent.EventType.LIVE_CLASS).strip(),
                event_date=ev_date,
                start_time_label=(request.data.get('start_time_label') or '08:00 PM').strip()[:32],
                end_time_label=(request.data.get('end_time_label') or '').strip()[:32],
                meeting_url=(request.data.get('meeting_url') or '').strip()[:500],
                target_batch=(request.data.get('target_batch') or '').strip()[:64],
                notes=(request.data.get('notes') or '').strip()[:400],
            )
            return Response({'detail': 'Schedule event added.', 'event_id': ev.id}, status=status.HTTP_201_CREATED)

        if action == 'delete_schedule':
            eid = request.data.get('event_id')
            deleted, _ = PartnerScheduleEvent.objects.filter(pk=eid, school=school).delete()
            if not deleted:
                return Response({'detail': 'Schedule event not found.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'detail': 'Schedule event removed.'})

        if action == 'reply_discussion':
            course = get_object_or_404(PartnerCourse, pk=request.data.get('course_id'), school=school)
            body = (request.data.get('message') or '').strip()
            if not body:
                return Response({'detail': 'Reply message cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
            PartnerCourseDiscussion.objects.create(
                course=course,
                user=request.user if (request.user and request.user.is_authenticated) else None,
                author_name=school.contact_person or f'{school.name} Sensei',
                author_role=PartnerCourseDiscussion.AuthorRole.SENSEI,
                message=body[:1500],
            )
            return Response({'detail': 'Sensei reply posted.'}, status=status.HTTP_201_CREATED)

        return Response({'detail': f"Unknown studio action '{action}'."}, status=status.HTTP_400_BAD_REQUEST)

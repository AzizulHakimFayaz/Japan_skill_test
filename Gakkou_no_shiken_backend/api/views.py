from collections import OrderedDict, defaultdict
import csv
import io
import json
import urllib.request
import re
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from django.contrib.auth.models import User, update_last_login
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.management import call_command
from django.db.models import Count, F, Q, Case, When, Value, IntegerField
from django.utils import timezone

from tests.models import Test, Question, QuestionGroup, AnswerOption, Attempt, Notice, CurriculumLesson, CurriculumVocabulary, CurriculumKanji, ExamBook, BookTopic, HeroBanner
from accounts.models import (
    UserProfile,
    EmailVerificationOTP,
    PasswordResetToken,
    SupportThread,
    SupportMessage,
    PartnerSchool,
    PartnerApplication,
    PartnerAssignedExam,
    PartnerStudyNote,
    PartnerNotification,
)
from accounts.schema_sync import ensure_schema_synced
from accounts.geolocation import get_client_ip, lookup_ip_country, resolve_user_country_and_flag, get_country_flag
from accounts.emails import send_password_reset_email
from accounts.throttling import ForgotPasswordRateThrottle, is_email_rate_limited
from tests.data.jft_data import get_jft_info, get_jft_test_centers, get_jft_resources
from tests.data.ssw_data import get_ssw_info, get_ssw_sectors, get_ssw_test_centers
from .serializers import (
    TestListSerializer,
    TestDetailSerializer,
    QuestionQuizSerializer,
    QuestionReviewSerializer,
    QuestionGroupSerializer,
    AttemptSummarySerializer,
    UserSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ConfirmCountrySerializer,
    ForgotPasswordRequestSerializer,
    ResetPasswordRequestSerializer,
    NoticeSerializer,
    get_absolute_media_url,
    CurriculumLessonListSerializer,
    CurriculumLessonDetailSerializer,
    CurriculumVocabularySerializer,
    CurriculumKanjiSerializer,
    ExamBookListSerializer,
    ExamBookDetailSerializer,
    BookTopicSerializer,
    HeroBannerSerializer,
    PartnerSchoolSummarySerializer,
)




def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def _get_user_active_partner_school(user):
    """Returns the user's active & approved PartnerSchool instance (or owned school), or None."""
    if not user or not user.is_authenticated:
        return None
    owned = PartnerSchool.objects.filter(owner_id=user.pk, is_active=True).first()
    if owned:
        return owned
    profile = UserProfile.objects.select_related('partner_school').filter(
        user_id=user.pk,
        partner_school__is_active=True,
        partner_status=UserProfile.PartnerStatus.APPROVED,
    ).first()
    if profile and profile.partner_school:
        return profile.partner_school
    return None


def _user_can_access_test(user, test, is_preview=False):
    """Enforces Global vs School-Exclusive visibility rules on a Test."""
    if not getattr(test, 'partner_school_id', None):
        return True
    if is_preview or (user and user.is_authenticated and user.is_staff):
        return True
    user_school = _get_user_active_partner_school(user)
    return bool(user_school and user_school.id == test.partner_school_id)


class TestListAPIView(APIView):
    """
    Returns published Global Tests to everyone, plus School-Exclusive Tests
    to students enrolled in that specific PartnerSchool (or all tests for staff/admin).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category')
        is_staff = bool(request.user.is_authenticated and request.user.is_staff)
        user_school = _get_user_active_partner_school(request.user)

        if is_staff:
            queryset = Test.objects.select_related('partner_school').all().annotate(
                q_count=Count('questions', distinct=True)
            ).order_by('category', '-is_published', 'created_at')
        else:
            visibility_q = Q(partner_school__isnull=True)
            if user_school:
                visibility_q = visibility_q | Q(partner_school_id=user_school.id)
            queryset = Test.objects.select_related('partner_school').filter(
                is_published=True
            ).filter(visibility_q).annotate(
                q_count=Count('questions', distinct=True)
            ).order_by('category', 'created_at')

        if category:
            queryset = queryset.filter(category=category)

        tests_serialized = TestListSerializer(queryset, many=True, context={'request': request}).data

        school_exclusive_tests = [t for t in tests_serialized if t.get('is_school_exclusive')]
        global_tests = [t for t in tests_serialized if not t.get('is_school_exclusive')]

        # Grouping for landing page
        tests_by_category = {
            Test.Category.BASIC: [t for t in global_tests if t['category'] == Test.Category.BASIC],
            Test.Category.SKILL: [t for t in global_tests if t['category'] == Test.Category.SKILL],
        }

        section_specs = [
            {
                "category": Test.Category.BASIC,
                "label": "JFT Tests",
                "chip_classes": "bg-indigo-50 text-indigo-700 border border-indigo-100",
                "icon_bg_class": "bg-indigo-600",
            },
            {
                "category": Test.Category.SKILL,
                "label": "SSW Skill Tests",
                "chip_classes": "bg-amber-50 text-amber-700 border border-amber-100",
                "icon_bg_class": "bg-amber-500",
            },
        ]

        return Response({
            'tests': tests_serialized,
            'global_tests': global_tests,
            'school_exclusive_tests': school_exclusive_tests,
            'partner_school': PartnerSchoolSummarySerializer(user_school).data if user_school else None,
            'tests_by_category': tests_by_category,
            'section_specs': section_specs,
        })


class TestDetailAPIView(APIView):
    """Returns single test details (allows draft preview for staff/admin, blocks other schools' exclusive tests)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        test = get_object_or_404(Test.objects.select_related('partner_school'), pk=pk)

        if not test.is_published:
            if not (request.user.is_authenticated and request.user.is_staff):
                return Response(
                    {"detail": "This practice test is currently in Draft mode. Only staff/admin can preview it."},
                    status=status.HTTP_403_FORBIDDEN
                )

        if not _user_can_access_test(request.user, test):
            school_name = test.partner_school.name if test.partner_school else "its Partner School"
            return Response(
                {"detail": f"This mock exam is exclusive to students enrolled at {school_name}. Join using your school invite link to access it."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = TestDetailSerializer(test, context={'request': request})
        return Response(serializer.data)


class QuizDataAPIView(APIView):
    """Returns structured CBT quiz steps and questions (allows draft preview with ?preview=admin)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        test = get_object_or_404(Test.objects.select_related('partner_school'), pk=pk)

        preview_param = request.query_params.get('preview')
        is_preview = (preview_param in ['admin', 'true', 'staff', 'preview'] or bool(preview_param))

        # School-Exclusive Test Guard
        if not _user_can_access_test(request.user, test, is_preview=is_preview):
            school_name = test.partner_school.name if test.partner_school else "its Partner School"
            return Response(
                {"detail": f"This mock exam is exclusive to students enrolled at {school_name}. Please sign in with your school link."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Draft Access Check: Allow if published OR if staff OR if preview parameter is provided
        if not test.is_published:
            is_staff = bool(request.user.is_authenticated and request.user.is_staff)
            if not (is_staff or is_preview):
                return Response(
                    {"detail": "This practice test is currently in Draft mode. Please publish it or preview from the admin panel."},
                    status=status.HTTP_403_FORBIDDEN
                )

        # Scheduled Release Check: Block if not yet released and not staff/preview
        if not test.is_released:
            is_staff = bool(request.user.is_authenticated and request.user.is_staff)
            if not (is_staff or is_preview):
                release_str = test.scheduled_release_at.strftime('%B %d, %Y at %I:%M %p') if test.scheduled_release_at else 'soon'
                return Response(
                    {
                        "detail": f"This practice test is scheduled to release on {release_str}. It is not open for examination attempts yet.",
                        "scheduled_release_at": test.scheduled_release_at,
                        "is_scheduled": True
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

        if test.requires_account and not request.user.is_authenticated and not is_preview:
            return Response(
                {"detail": "This practice test requires an account. Please sign in to continue."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        from django.core.cache import cache
        cache_key = f"cbt_quiz_data_v1_{pk}"
        cached_data = cache.get(cache_key)
        # If staff is previewing a draft, always fetch fresh data
        if cached_data is not None and test.is_published and not is_preview:
            return Response(cached_data)

        questions = list(test.get_ordered_questions())



        # Group questions into CBT steps (screens)
        steps = []
        visited_group_ids = set()

        for question in questions:
            if question.group_id:
                if question.group_id not in visited_group_ids:
                    visited_group_ids.add(question.group_id)
                    group_questions = [q for q in questions if q.group_id == question.group_id]
                    steps.append({
                        'step_number': len(steps) + 1,
                        'group': QuestionGroupSerializer(question.group, context={'request': request}).data if question.group else None,
                        'section': question.section,
                        'questions': QuestionQuizSerializer(group_questions, many=True, context={'request': request}).data,
                    })
            else:
                steps.append({
                    'step_number': len(steps) + 1,
                    'group': None,
                    'section': question.section,
                    'questions': QuestionQuizSerializer([question], many=True, context={'request': request}).data,
                })

        response_data = {
            'test': TestDetailSerializer(test, context={'request': request}).data,
            'total_questions': len(questions),
            'total_steps': len(steps),
            'steps': steps,
        }

        # Cache quiz data in memory for 1 hour (3600 seconds)
        cache.set(cache_key, response_data, 3600)
        return Response(response_data)



class SubmitQuizAPIView(APIView):
    """Submits candidate's quiz answers, calculates score, and records Attempt."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        test = get_object_or_404(Test.objects.select_related('partner_school'), pk=pk)

        preview_param = request.query_params.get('preview') or (request.data.get('preview') if isinstance(request.data, dict) else None)
        is_preview = (preview_param in ['admin', 'true', 'staff', 'preview'] or bool(preview_param))
        is_staff = bool(request.user.is_authenticated and request.user.is_staff)

        if not _user_can_access_test(request.user, test, is_preview=is_preview):
            return Response(
                {"detail": "You do not have permission to submit answers for this school-exclusive exam."},
                status=status.HTTP_403_FORBIDDEN
            )

        if not test.is_published:
            if not (is_staff or is_preview):
                return Response(
                    {"detail": "Cannot submit answers to a Draft test."},
                    status=status.HTTP_403_FORBIDDEN
                )

        if not test.is_released:
            if not (is_staff or is_preview):
                return Response(
                    {"detail": "Cannot submit answers to an unreleased scheduled test."},
                    status=status.HTTP_403_FORBIDDEN
                )

        if test.requires_account and not request.user.is_authenticated and not is_preview:
            return Response(
                {"detail": "You must be logged in to submit this test."},
                status=status.HTTP_403_FORBIDDEN
            )


        questions = list(test.get_ordered_questions())
        user_answers = request.data.get('answers', {})
        if isinstance(user_answers, str):
            try:
                user_answers = json.loads(user_answers)
            except Exception:
                user_answers = {}

        # Optimized batch lookup of correct answer options in 1 query
        correct_option_ids = dict(
            AnswerOption.objects.filter(
                question__test=test,
                is_correct=True
            ).values_list('question_id', 'id')
        )

        formatted_answers = {}
        score = 0
        total_questions = len(questions)

        for question in questions:
            q_key = str(question.id)
            # Support both string "12" or "q12"
            raw_val = user_answers.get(q_key) or user_answers.get(f"q{q_key}") or user_answers.get(f"question_{q_key}")

            if question.type in [Question.QuestionType.TYPING, Question.QuestionType.AUDIO_TYPING]:
                # Typing / text input question evaluation
                typed_answer = str(raw_val or '').strip()
                formatted_answers[q_key] = typed_answer if typed_answer else None

                if typed_answer:
                    # Match against accepted AnswerOption labels (case-insensitive)
                    accepted_labels = [
                        opt.label.strip().lower()
                        for opt in question.options.all()
                        if opt.is_correct
                    ]
                    flat_accepted = []
                    for lbl in accepted_labels:
                        flat_accepted.extend([p.strip().lower() for p in lbl.split(',') if p.strip()])

                    if typed_answer.lower() in accepted_labels or typed_answer.lower() in flat_accepted:
                        score += 1
            elif raw_val is not None and str(raw_val).isdigit():
                selected_option_id = int(raw_val)
                formatted_answers[q_key] = selected_option_id

                # Check correctness for multiple choice option
                if correct_option_ids.get(question.id) == selected_option_id:
                    score += 1
            else:
                formatted_answers[q_key] = None

        user = request.user if request.user.is_authenticated else None
        if user:
            User.objects.filter(pk=user.pk).update(last_login=timezone.now())

        attempt_answers = dict(formatted_answers)
        if is_preview:
            attempt_answers['_is_preview'] = True

        attempt = Attempt.objects.create(
            test=test,
            user=user,
            score=score,
            total_questions=total_questions,
            answers=attempt_answers
        )

        return Response({
            'attempt_id': attempt.id,
            'score': score,
            'total_questions': total_questions,
            'is_preview': is_preview,
            'message': 'Quiz submitted successfully!'
        }, status=status.HTTP_201_CREATED)


class AttemptResultsAPIView(APIView):
    """Returns official score report, scaled score, section breakdown, and review data."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        attempt = get_object_or_404(Attempt.objects.select_related('test', 'user'), pk=pk)
        test = attempt.test

        preview_param = request.query_params.get('preview')
        is_preview_attempt = (
            preview_param in ['admin', 'true', 'staff', 'preview']
            or bool(preview_param)
            or bool(attempt.answers.get('_is_preview'))
        )
        is_staff = bool(request.user.is_authenticated and request.user.is_staff)

        # If test is Draft, allow if staff or preview
        if not test.is_published and not (is_staff or is_preview_attempt):
            return Response(
                {"detail": "This test is currently in Draft mode."},
                status=status.HTTP_403_FORBIDDEN
            )

        if test.requires_account:
            if not (
                (request.user.is_authenticated and attempt.user == request.user)
                or is_staff
                or is_preview_attempt
            ):
                return Response(
                    {"detail": "You do not have permission to view these results."},
                    status=status.HTTP_403_FORBIDDEN
                )

        questions = list(test.get_ordered_questions())
        correct_options_map = dict(
            AnswerOption.objects.filter(question__test=test, is_correct=True).values_list('question_id', 'id')
        )

        questions_data = QuestionReviewSerializer(questions, many=True, context={'request': request}).data

        # Section-by-section breakdown calculations
        if test.category == Test.Category.SKILL:
            section_breakdown = {
                'audio': {'name_ja': '第1部：音声・入力試験', 'name_en': 'Phase 1: Audio & Typing Exam', 'correct': 0, 'total': 0, 'pct': 0},
                'occupational': {'name_ja': '第2部：専門・実技試験', 'name_en': 'Phase 2: Occupational & Practical Exam', 'correct': 0, 'total': 0, 'pct': 0},
            }
        else:
            section_breakdown = {
                'script_vocab': {'name_ja': '文字と語彙', 'name_en': 'Script and Vocabulary', 'correct': 0, 'total': 0, 'pct': 0},
                'conversation': {'name_ja': '会話と表現', 'name_en': 'Conversation and Expression', 'correct': 0, 'total': 0, 'pct': 0},
                'listening': {'name_ja': '聴解', 'name_en': 'Listening Comprehension', 'correct': 0, 'total': 0, 'pct': 0},
                'reading': {'name_ja': '読解', 'name_en': 'Reading Comprehension', 'correct': 0, 'total': 0, 'pct': 0},
            }

        for q_dict in questions_data:
            q_id = q_dict['id']
            sec = q_dict['section']
            raw_answer = attempt.answers.get(str(q_id))

            if q_dict.get('type') in ['typing', 'audio_typing']:
                # Typing question answer check
                user_typed = str(raw_answer or '').strip()
                q_dict['typed_answer'] = user_typed
                correct_labels = [opt['label'].strip().lower() for opt in q_dict.get('options', []) if opt.get('is_correct')]
                flat_accepted = []
                for lbl in correct_labels:
                    flat_accepted.extend([p.strip().lower() for p in lbl.split(',') if p.strip()])
                is_correct = bool(user_typed and (user_typed.lower() in correct_labels or user_typed.lower() in flat_accepted))
                q_dict['selected_option_id'] = None
            else:
                q_dict['selected_option_id'] = int(raw_answer) if raw_answer is not None and str(raw_answer).isdigit() else None
                correct_opt_id = correct_options_map.get(q_id)
                is_correct = (q_dict['selected_option_id'] is not None and q_dict['selected_option_id'] == correct_opt_id)

            q_dict['is_answered_correctly'] = is_correct

            if sec in section_breakdown:
                section_breakdown[sec]['total'] += 1
                if is_correct:
                    section_breakdown[sec]['correct'] += 1

        for sec_data in section_breakdown.values():
            if sec_data['total'] > 0:
                sec_data['pct'] = int(round((sec_data['correct'] / sec_data['total']) * 100))
            else:
                sec_data['pct'] = 0

        percentage = (attempt.score / attempt.total_questions * 100) if attempt.total_questions > 0 else 0
        stroke_dashoffset = 389 - (389 * percentage / 100)
        scaled_score = int(round(10 + (percentage / 100.0) * 240)) if attempt.total_questions > 0 else 10

        if test.category == Test.Category.SKILL:
            passed = percentage >= 60.0
            assessment_level = "合格 (Passed)" if passed else "不合格 (Failed)"
        else:
            passed = percentage >= 80.0
            if scaled_score >= 200:
                assessment_level = "A2.2 (A2)"
            elif scaled_score >= 175:
                assessment_level = "A2.1"
            elif scaled_score >= 145:
                assessment_level = "A1"
            else:
                assessment_level = "Below A1"

        scaled_score_percent = min(100, max(0, ((scaled_score - 10) / 240.0) * 100))

        return Response({
            'attempt': {
                'id': attempt.id,
                'score': attempt.score,
                'total_questions': attempt.total_questions,
                'completed_at': attempt.completed_at,
                'percentage': round(percentage, 1),
                'passed': passed,
                'stroke_dashoffset': stroke_dashoffset,
                'scaled_score': scaled_score,
                'assessment_level': assessment_level,
                'scaled_score_percent': scaled_score_percent,
                'is_preview': is_preview_attempt,
            },
            'test': TestDetailSerializer(test, context={'request': request}).data,
            'section_breakdown': section_breakdown,
            'questions': questions_data,
        })


class JftInfoAPIView(APIView):
    """Returns JFT-Basic overview, test centers, resources, and practice mock tests."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        jft_info = get_jft_info()
        test_centers = get_jft_test_centers()
        resources = get_jft_resources()
        basic_tests = Test.objects.filter(
            is_published=True,
            category=Test.Category.BASIC,
            partner_school__isnull=True,
        ).annotate(
            q_count=Count('questions', distinct=True)
        ).order_by('created_at')

        return Response({
            'jft_info': jft_info,
            'test_centers': test_centers,
            'jft_resources': resources,
            'practice_tests': TestListSerializer(basic_tests, many=True, context={'request': request}).data,
        })


class SswInfoAPIView(APIView):
    """Returns SSW overview, sectors list, test centers, and practice tests."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        ssw_info = get_ssw_info()
        sectors = get_ssw_sectors()
        test_centers = get_ssw_test_centers()
        skill_tests = Test.objects.filter(
            is_published=True,
            category=Test.Category.SKILL,
            partner_school__isnull=True,
        ).annotate(
            q_count=Count('questions', distinct=True)
        ).order_by('created_at')

        return Response({
            'ssw_info': ssw_info,
            'ssw_sectors': sectors,
            'test_centers': test_centers,
            'practice_tests': TestListSerializer(skill_tests, many=True, context={'request': request}).data,
        })


def send_otp_email(email, otp_code, name=''):
    subject = f"Gakkou No Shiken - Verification Code: {otp_code}"
    display_name = name.strip() if name else "Candidate"

    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
        <tr>
          <td style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">Gakkou No Shiken <span style="color: #ef4444;">学校の試験</span></h1>
            <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Official CBT Japanese Skill Test Portal</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 28px;">
            <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Hello <strong>{display_name}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">Thank you for registering on Gakkou No Shiken. Please use the 6-digit verification code below to verify your email address and activate your candidate profile:</p>

            <div style="background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; text-align: center; margin: 28px 0;">
              <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #dc2626; font-family: monospace;">{otp_code}</span>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
              ⏳ This code is valid for <strong>15 minutes</strong>.<br>
              🔒 If you did not create an account on Gakkou No Shiken, you can safely disregard this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">&copy; Gakkou No Shiken. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
    """
    plain_message = f"Hello {display_name},\n\nYour Gakkou No Shiken verification code is: {otp_code}\n\nThis code will expire in 15 minutes.\n\n- Gakkou No Shiken Team"

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Gakkou No Shiken <noreply@gakkounoshiken.site>')
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=from_email,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False
        )
        return True
    except Exception as e:
        print(f"Error sending verification email: {e}")
        return False


class SendRegistrationOTPAPIView(APIView):
    """Validates registration data, generates 6-digit OTP, and sends verification email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')
        password_confirm = request.data.get('password_confirm', '')
        first_name = request.data.get('first_name', '').strip()
        last_name = request.data.get('last_name', '').strip()
        country = request.data.get('country', '').strip()

        if not username or not email or not password:
            return Response({'detail': 'Please provide username, email, and password.'}, status=status.HTTP_400_BAD_REQUEST)

        if not country:
            return Response({'country': ['Country is required for registration.']}, status=status.HTTP_400_BAD_REQUEST)

        if password != password_confirm:
            return Response({'detail': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 6:
            return Response({'detail': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username__iexact=username).exists():
            return Response({'detail': 'This username is already taken. Please choose another.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response({'detail': 'An account with this email already exists. Please sign in.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_record = EmailVerificationOTP.create_otp(
            email=email,
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
            country=country
        )

        send_otp_email(email, otp_record.otp_code, name=first_name or username)

        return Response({
            'status': 'success',
            'email': email,
            'message': f'A 6-digit verification code has been sent to {email}.'
        }, status=status.HTTP_200_OK)


class VerifyRegistrationOTPAPIView(APIView):
    """Verifies 6-digit OTP, creates the candidate user account, and returns JWT auth tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        otp_code = request.data.get('otp_code', '').strip()

        if not email or not otp_code:
            return Response({'detail': 'Please provide email and verification code.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_record = EmailVerificationOTP.objects.filter(email__iexact=email, is_verified=False).order_by('-created_at').first()
        if not otp_record:
            return Response({'detail': 'No pending verification found for this email.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_expired():
            return Response({'detail': 'Verification code has expired. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.otp_code != otp_code:
            return Response({'detail': 'Invalid verification code. Please check your inbox.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure username wasn't taken in the interim
        if User.objects.filter(username__iexact=otp_record.username).exists():
            return Response({'detail': 'Username was taken during verification. Please restart registration.'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response({'detail': 'An account with this email already exists. Please sign in.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create(
            username=otp_record.username,
            email=email,
            first_name=otp_record.first_name,
            last_name=otp_record.last_name,
            password=otp_record.password_hash
        )
        user.save()

        otp_record.is_verified = True
        otp_record.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        client_ip = get_client_ip(request)
        if client_ip:
            profile.last_known_ip = client_ip

        if otp_record.country:
            profile.country = otp_record.country
            profile.country_source = UserProfile.CountrySource.USER
        elif client_ip:
            detected = lookup_ip_country(client_ip)
            if detected:
                profile.country = detected
                profile.country_source = UserProfile.CountrySource.IP
        profile.save()

        tokens = get_tokens_for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
            'message': f'Email verified successfully! Welcome to Gakkou No Shiken, {user.username}!'
        }, status=status.HTTP_201_CREATED)


class ResendRegistrationOTPAPIView(APIView):
    """Resends a new 6-digit OTP code to the candidate's email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()

        if not email:
            return Response({'detail': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        otp_record = EmailVerificationOTP.objects.filter(email__iexact=email, is_verified=False).order_by('-created_at').first()
        if not otp_record:
            return Response({'detail': 'No pending registration found for this email. Please sign up again.'}, status=status.HTTP_400_BAD_REQUEST)

        new_otp = EmailVerificationOTP.create_otp(
            email=email,
            username=otp_record.username,
            first_name=otp_record.first_name,
            last_name=otp_record.last_name,
            country=otp_record.country,
        )
        new_otp.password_hash = otp_record.password_hash
        new_otp.save()

        send_otp_email(email, new_otp.otp_code, name=new_otp.first_name or new_otp.username)

        return Response({
            'status': 'success',
            'email': email,
            'message': 'A new 6-digit verification code has been sent to your email.'
        }, status=status.HTTP_200_OK)


class RegisterAPIView(APIView):
    """Registers a new candidate and returns JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            update_last_login(None, user)
            client_ip = get_client_ip(request)
            if client_ip:
                profile, _ = UserProfile.objects.get_or_create(user=user)
                profile.last_known_ip = client_ip
                profile.save(update_fields=['last_known_ip'])
            tokens = get_tokens_for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
                'message': f"Welcome to JFT Practice, {user.username}!"
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    """Authenticates candidate with username or email and returns JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_or_email = request.data.get('username', '').strip()
        password = request.data.get('password', '')

        if not username_or_email or not password:
            return Response(
                {"detail": "Please provide both username/email and password."},
                status=status.HTTP_400_BAD_REQUEST
            )

        username = username_or_email
        if '@' in username_or_email:
            try:
                user_obj = User.objects.get(email__iexact=username_or_email)
                username = user_obj.username
            except (User.DoesNotExist, User.MultipleObjectsReturned):
                pass

        user = authenticate(request, username=username, password=password)
        if user is not None:
            update_last_login(None, user)
            client_ip = get_client_ip(request)
            if client_ip:
                profile, _ = UserProfile.objects.get_or_create(user=user)
                update_fields = []
                if profile.last_known_ip != client_ip:
                    profile.last_known_ip = client_ip
                    update_fields.append('last_known_ip')
                if not profile.country:
                    detected = lookup_ip_country(client_ip)
                    if detected:
                        profile.country = detected
                        profile.country_source = UserProfile.CountrySource.IP
                        update_fields.extend(['country', 'country_source'])
                if update_fields:
                    profile.save(update_fields=update_fields)
            tokens = get_tokens_for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'tokens': tokens,
                'message': f"Welcome back, {user.username}!"
            })
        return Response(
            {"detail": "Invalid credentials. Please check details and try again."},
            status=status.HTTP_401_UNAUTHORIZED
        )


class ForgotPasswordAPIView(APIView):
    """
    POST /auth/forgot-password or /api/auth/forgot-password/
    Validates email format, generates a cryptographically secure single-use reset token,
    stores its SHA-256 hash, and dispatches a reset link email.
    Always returns a generic success response to prevent email enumeration.
    """
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ForgotPasswordRateThrottle]

    def post(self, request):
        serializer = ForgotPasswordRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        generic_response = {
            'status': 'success',
            'message': 'If an account exists for this email, a password reset link has been sent.'
        }

        # Inbox harassment protection
        if is_email_rate_limited(email):
            return Response(generic_response, status=status.HTTP_200_OK)

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            timeout_minutes = int(getattr(settings, 'PASSWORD_RESET_TIMEOUT_MINUTES', 15))
            client_ip = get_client_ip(request)
            token_obj, raw_token = PasswordResetToken.create_token(
                user=user,
                ip_address=client_ip,
                timeout_minutes=timeout_minutes
            )
            send_password_reset_email(
                user=user,
                raw_token=raw_token,
                request=request,
                timeout_minutes=timeout_minutes
            )

        return Response(generic_response, status=status.HTTP_200_OK)


class ResetPasswordAPIView(APIView):
    """
    POST /auth/reset-password or /api/auth/reset-password/
    Validates single-use token, checks expiration, updates user password using PBKDF2,
    invalidates reset tokens, and updates session authentication hash.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        raw_token = serializer.validated_data['token']
        token_hash = PasswordResetToken.hash_raw_token(raw_token)

        token_record = PasswordResetToken.objects.filter(token_hash=token_hash).select_related('user').first()
        if not token_record:
            return Response(
                {"detail": "Invalid or expired password reset link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if token_record.is_used:
            return Response(
                {"detail": "This password reset link has already been used. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if token_record.is_expired():
            return Response(
                {"detail": "This password reset link has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = token_record.user
        new_password = serializer.validated_data['password']

        # Update password securely using Django's password hasher
        user.set_password(new_password)
        user.save()

        # Invalidate the used token
        token_record.mark_as_used()

        # Invalidate any other pending tokens for this user
        PasswordResetToken.objects.filter(user=user, is_used=False).update(is_used=True)

        # Invalidate outstanding JWT refresh tokens if token_blacklist is active
        try:
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
            for token in OutstandingToken.objects.filter(user=user):
                BlacklistedToken.objects.get_or_create(token=token)
        except Exception:
            pass

        return Response({
            'status': 'success',
            'message': 'Your password has been successfully reset. You can now log in with your new password.'
        }, status=status.HTTP_200_OK)


class ConfirmCountryAPIView(APIView):
    """
    POST /auth/confirm-country/ or /api/auth/confirm-country/
    Allows authenticated candidates to confirm or update their country,
    transitioning country_source to 'user'.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ConfirmCountrySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        country = serializer.validated_data['country']
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.country = country
        profile.country_source = UserProfile.CountrySource.USER
        client_ip = get_client_ip(request)
        if client_ip:
            profile.last_known_ip = client_ip
        profile.save()

        return Response({
            'status': 'success',
            'message': f'Country confirmed as {country}.',
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)


class DetectCountryAPIView(APIView):
    """
    GET /api/auth/detect-country/
    Auto-detects the visitor's country and IP location.
    Enables automatic location detection on the signup form,
    profile completion banner, and candidate registration.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        client_ip = get_client_ip(request)
        detected_country = lookup_ip_country(client_ip) if client_ip else None

        user_country = None
        if request.user.is_authenticated:
            profile = getattr(request.user, 'profile', None)
            if profile and profile.country:
                user_country = profile.country

        effective_country = user_country or detected_country or 'Bangladesh'

        return Response({
            'status': 'success',
            'client_ip': client_ip,
            'detected_country': detected_country,
            'user_country': user_country,
            'country': effective_country,
            'is_detected': bool(detected_country)
        }, status=status.HTTP_200_OK)




class GoogleAuthAPIView(APIView):
    """
    Authenticates or auto-registers a candidate using Google 1-Click Sign-In (ID Token).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token = request.data.get('id_token') or request.data.get('credential')
        if not id_token:
            return Response({'detail': 'Google ID token credential is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            req = urllib.request.Request(url, headers={'User-Agent': 'GakkouNoShiken/1.0'})
            with urllib.request.urlopen(req, timeout=10) as response:
                payload = json.loads(response.read().decode('utf-8'))
        except Exception as e:
            return Response({'detail': f'Failed to verify Google credential with Google servers: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        email = payload.get('email')
        if not email:
            return Response({'detail': 'Google account did not return a valid email address.'}, status=status.HTTP_400_BAD_REQUEST)

        email_verified = payload.get('email_verified')
        if str(email_verified).lower() not in ('true', '1'):
            return Response({'detail': 'Your Google account email is not verified by Google.'}, status=status.HTTP_400_BAD_REQUEST)

        first_name = payload.get('given_name') or (payload.get('name', '').split(' ')[0] if payload.get('name') else '')
        last_name = payload.get('family_name') or ''
        if not last_name and payload.get('name') and ' ' in payload.get('name'):
            last_name = ' '.join(payload.get('name').split(' ')[1:])

        user = User.objects.filter(email__iexact=email).first()
        is_new_user = False

        if not user:
            base_username = email.split('@')[0]
            base_username = re.sub(r'[^a-zA-Z0-9_]', '', base_username) or 'candidate'
            username = base_username[:20]
            counter = 1
            while User.objects.filter(username__iexact=username).exists():
                username = f"{base_username[:15]}_{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
            user.set_unusable_password()
            user.save()
            is_new_user = True
        else:
            updated = False
            if not user.first_name and first_name:
                user.first_name = first_name
                updated = True
            if not user.last_name and last_name:
                user.last_name = last_name
                updated = True
            if updated:
                user.save()

        # Ensure user profile exists
        profile, created = UserProfile.objects.get_or_create(user=user)
        client_ip = get_client_ip(request)
        if client_ip:
            if profile.last_known_ip != client_ip:
                profile.last_known_ip = client_ip
            if not profile.country:
                detected = lookup_ip_country(client_ip)
                if detected:
                    profile.country = detected
                    profile.country_source = UserProfile.CountrySource.IP
            profile.save()
        update_last_login(None, user)

        tokens = get_tokens_for_user(user)
        welcome_name = user.first_name or user.username
        message = f"Welcome to Gakkou No Shiken, {welcome_name}!" if is_new_user else f"Welcome back, {welcome_name}!"

        return Response({
            'user': UserSerializer(user).data,
            'tokens': tokens,
            'is_new_user': is_new_user,
            'message': message,
        }, status=status.HTTP_200_OK)


class MeAPIView(APIView):

    """Returns profile of currently logged-in user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'user': UserSerializer(request.user).data
        })


class MyResultsAPIView(APIView):
    """Returns candidate's full exam attempt history, statistics, and chart data."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        attempts = list(
            Attempt.objects.filter(user=request.user)
            .select_related('test')
            .order_by('-completed_at')
        )

        total_attempts = len(attempts)
        passed_attempts = 0
        total_scaled_scores = 0
        highest_scaled_score = 0
        highest_level = "Below A1"

        section_totals = {
            'script_vocab': {'correct': 0, 'total': 0},
            'conversation': {'correct': 0, 'total': 0},
            'listening': {'correct': 0, 'total': 0},
            'reading': {'correct': 0, 'total': 0},
        }

        test_ids = {att.test_id for att in attempts}
        questions_by_test = defaultdict(list)
        correct_options_by_question = {}

        if test_ids:
            for q in Question.objects.filter(test_id__in=test_ids).only('id', 'test_id', 'section'):
                questions_by_test[q.test_id].append(q)

            correct_options_by_question = dict(
                AnswerOption.objects.filter(question__test_id__in=test_ids, is_correct=True).values_list('question_id', 'id')
            )

        serialized_attempts = []
        for attempt in attempts:
            questions = questions_by_test.get(attempt.test_id, [])
            total_q = attempt.total_questions if attempt.total_questions > 0 else len(questions)
            pct = (attempt.score / total_q * 100.0) if total_q > 0 else 0.0
            scaled = int(round(10 + (pct / 100.0) * 240)) if total_q > 0 else 10

            if scaled >= 200:
                level = "A2.2 (A2)"
                passed_attempts += 1
            elif scaled >= 175:
                level = "A2.1"
            elif scaled >= 145:
                level = "A1"
            else:
                level = "Below A1"

            total_scaled_scores += scaled
            if scaled > highest_scaled_score:
                highest_scaled_score = scaled
                highest_level = level

            answers = attempt.answers or {}
            for q in questions:
                sec = q.section
                if sec in section_totals:
                    section_totals[sec]['total'] += 1
                    selected_opt_id = answers.get(str(q.id))
                    if selected_opt_id:
                        correct_opt_id = correct_options_by_question.get(q.id)
                        if correct_opt_id is not None and correct_opt_id == int(selected_opt_id):
                            section_totals[sec]['correct'] += 1

            test_title = attempt.test.title if attempt.test else "Mock Exam"
            test_category = attempt.test.category if attempt.test else "basic"

            serialized_attempts.append({
                'id': attempt.id,
                'test_id': attempt.test_id,
                'test_title': test_title,
                'test_category': test_category,
                'score': attempt.score,
                'total_questions': total_q,
                'percentage': int(round(pct)),
                'scaled_score': scaled,
                'assessment_level': level,
                'passed': scaled >= 200,
                'completed_at': attempt.completed_at,
            })

        pass_rate = int(round((passed_attempts / total_attempts * 100))) if total_attempts > 0 else 0
        avg_scaled_score = int(round(total_scaled_scores / total_attempts)) if total_attempts > 0 else 0

        section_stats = []
        sec_names = {
            'script_vocab': ('Script & Vocabulary', '文字と語彙', 'rose'),
            'conversation': ('Conversation & Expression', '会話と表現', 'indigo'),
            'listening': ('Listening Comprehension', '聴解', 'amber'),
            'reading': ('Reading Comprehension', '読解', 'emerald'),
        }

        for sec_key, (name_en, name_ja, color) in sec_names.items():
            tot = section_totals[sec_key]['total']
            cor = section_totals[sec_key]['correct']
            pct = int(round((cor / tot * 100))) if tot > 0 else 0
            section_stats.append({
                'key': sec_key,
                'name_en': name_en,
                'name_ja': name_ja,
                'correct': cor,
                'total': tot,
                'pct': pct,
                'color': color
            })

        chart_attempts = list(reversed(attempts))
        chart_labels = [att.completed_at.strftime('%b %d, %H:%M') for att in chart_attempts if att.completed_at]
        chart_scores = [att['scaled_score'] for att in serialized_attempts[::-1]]
        chart_titles = [(att.test.title if att.test else "Exam") for att in chart_attempts]

        return Response({
            'total_attempts': total_attempts,
            'passed_attempts': passed_attempts,
            'pass_rate': pass_rate,
            'highest_scaled_score': highest_scaled_score,
            'avg_scaled_score': avg_scaled_score,
            'highest_level': highest_level,
            'section_stats': section_stats,
            'attempts': serialized_attempts,
            'chart_data': {
                'labels': chart_labels,
                'scores': chart_scores,
                'titles': chart_titles,
            }
        })


class ProfileAPIView(APIView):
    """Retrieves or updates the current candidate's profile details."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def put(self, request):
        return self.update_profile(request)

    def patch(self, request):
        return self.update_profile(request)

    def update_profile(self, request):
        serializer = UserProfileUpdateSerializer(instance=request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Profile updated successfully!'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def _build_ranked_candidates_from_stats(user_stats):
    """Formats aggregated per-user stats into a sorted, ranked leaderboard list."""
    candidates_list = []
    for user_id, s in user_stats.items():
        u = s['user']
        scores = s['scores']
        avg_score = int(round(sum(scores) / len(scores))) if scores else 0
        pass_rate = int(round(s['passed_attempts'] / s['total_attempts'] * 100)) if s['total_attempts'] > 0 else 0

        profile = getattr(u, 'profile', None)
        full_name = f"{u.first_name} {u.last_name}".strip()
        country, country_flag = resolve_user_country_and_flag(profile)

        candidates_list.append({
            'user_id': u.id,
            'username': u.username,
            'full_name': full_name if full_name else u.username,
            'bio': profile.bio if profile else '',
            'target_exam': profile.target_exam if profile else 'jft_basic',
            'target_exam_display': profile.get_target_exam_display() if profile else 'JFT-Basic (A2 Standard)',
            'japanese_level': profile.japanese_level if profile else 'n4',
            'japanese_level_display': profile.get_japanese_level_display() if profile else 'Elementary (N4 / A2)',
            'location': profile.location if profile else '',
            'country': country,
            'country_flag': country_flag,
            'total_attempts': s['total_attempts'],
            'passed_attempts': s['passed_attempts'],
            'highest_score': s['highest_score'],
            'avg_score': avg_score,
            'pass_rate': pass_rate,
        })

    candidates_list.sort(
        key=lambda x: (x['passed_attempts'], x['highest_score'], x['avg_score'], x['total_attempts']),
        reverse=True
    )

    for idx, item in enumerate(candidates_list):
        item['rank'] = idx + 1

    return candidates_list


def compute_leaderboard_candidates(since=None):
    """Computes ranked candidates for all-time (since=None) or a time window."""
    attempts_qs = Attempt.objects.filter(user__isnull=False, test__is_published=True).select_related('user', 'user__profile')
    if since is not None:
        attempts_qs = attempts_qs.filter(completed_at__gte=since)

    user_stats = defaultdict(lambda: {
        'user': None,
        'total_attempts': 0,
        'passed_attempts': 0,
        'scores': [],
        'highest_score': 0,
    })

    for att in attempts_qs:
        if att.answers and att.answers.get('_is_preview'):
            continue
        u = att.user
        stats = user_stats[u.id]
        if stats['user'] is None:
            stats['user'] = u
        stats['total_attempts'] += 1
        scaled = att.scaled_score
        stats['scores'].append(scaled)
        if scaled > stats['highest_score']:
            stats['highest_score'] = scaled
        if scaled >= 200:
            stats['passed_attempts'] += 1

    return _build_ranked_candidates_from_stats(user_stats)


def compute_overall_and_weekly_leaderboards(days=7):
    """Computes both Overall and Weekly (rolling N-day) leaderboards in a single DB query."""
    now = timezone.now()
    week_cutoff = now - timezone.timedelta(days=days)
    attempts_qs = Attempt.objects.filter(user__isnull=False, test__is_published=True).select_related('user', 'user__profile')

    def _new_bucket():
        return {
            'user': None,
            'total_attempts': 0,
            'passed_attempts': 0,
            'scores': [],
            'highest_score': 0,
        }

    overall_stats = defaultdict(_new_bucket)
    weekly_stats = defaultdict(_new_bucket)

    for att in attempts_qs:
        if att.answers and att.answers.get('_is_preview'):
            continue
        u = att.user
        scaled = att.scaled_score

        for bucket_map, include in (
            (overall_stats, True),
            (weekly_stats, bool(att.completed_at and att.completed_at >= week_cutoff)),
        ):
            if not include:
                continue
            stats = bucket_map[u.id]
            if stats['user'] is None:
                stats['user'] = u
            stats['total_attempts'] += 1
            stats['scores'].append(scaled)
            if scaled > stats['highest_score']:
                stats['highest_score'] = scaled
            if scaled >= 200:
                stats['passed_attempts'] += 1

    return (
        _build_ranked_candidates_from_stats(overall_stats),
        _build_ranked_candidates_from_stats(weekly_stats),
        week_cutoff,
        now,
    )


def _resolve_current_user_rank(request_user, candidates_list):
    if not request_user or not request_user.is_authenticated:
        return None
    for item in candidates_list:
        if item['user_id'] == request_user.id:
            return item
    profile = getattr(request_user, 'profile', None)
    full_name = f"{request_user.first_name} {request_user.last_name}".strip()
    country, country_flag = resolve_user_country_and_flag(profile)
    return {
        'user_id': request_user.id,
        'username': request_user.username,
        'full_name': full_name if full_name else request_user.username,
        'bio': profile.bio if profile else '',
        'target_exam': profile.target_exam if profile else 'jft_basic',
        'target_exam_display': profile.get_target_exam_display() if profile else 'JFT-Basic',
        'japanese_level': profile.japanese_level if profile else 'n4',
        'japanese_level_display': profile.get_japanese_level_display() if profile else 'N4',
        'location': profile.location if profile else '',
        'country': country,
        'country_flag': country_flag,
        'total_attempts': 0,
        'passed_attempts': 0,
        'highest_score': 0,
        'avg_score': 0,
        'pass_rate': 0,
        'rank': None,
    }


class LeaderboardAPIView(APIView):
    """
    Returns both Overall (all-time) and Weekly (rolling 7-day) candidate leaderboards
    in a single query, ranked by:
    1. Tests Passed (count of passed attempts)
    2. Highest Scaled Score
    3. Average Scaled Score
    4. Total Attempts
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        overall_list, weekly_list, week_start, week_end = compute_overall_and_weekly_leaderboards(days=7)

        overall_top_three = overall_list[:3]
        overall_rankings = overall_list[3:50]
        overall_user_rank = _resolve_current_user_rank(request.user, overall_list)

        weekly_top_three = weekly_list[:3]
        weekly_rankings = weekly_list[3:50]
        weekly_user_rank = _resolve_current_user_rank(request.user, weekly_list)

        total_registered = User.objects.count()
        weekly_payload = {
            'period_label': 'Last 7 Days',
            'window_start': week_start.isoformat(),
            'window_end': week_end.isoformat(),
            'total_candidates': len(weekly_list),
            'top_three': weekly_top_three,
            'rankings': weekly_rankings,
            'current_user_rank': weekly_user_rank,
        }

        period = (request.query_params.get('period') or 'overall').strip().lower()
        if period == 'weekly':
            return Response({
                'period': 'weekly',
                'total_candidates': len(weekly_list),
                'total_registered_candidates': total_registered,
                'top_three': weekly_top_three,
                'rankings': weekly_rankings,
                'current_user_rank': weekly_user_rank,
                'weekly': weekly_payload,
            })

        return Response({
            'period': 'overall',
            'total_candidates': len(overall_list),
            'total_registered_candidates': total_registered,
            'top_three': overall_top_three,
            'rankings': overall_rankings,
            'current_user_rank': overall_user_rank,
            'weekly': weekly_payload,
        })


class PlatformStatsAPIView(APIView):
    """
    Public API returning aggregate platform statistics:
    - registered_candidates: total registered candidate accounts
    - total_tests: total published CBT mock tests
    - total_attempts: total exam attempts taken
    - total_books: total official JAC textbooks & materials
    - total_lessons: total structured curriculum lessons
    - total_notices: total active notices and circulars
    - supported_languages: 10
    - prometric_fidelity: '100%'
    - official_scaled_scoring: 250
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_registered = User.objects.count()
        published_tests = Test.objects.filter(is_published=True).count()
        total_attempts = Attempt.objects.count()
        total_books = ExamBook.objects.count()
        total_lessons = CurriculumLesson.objects.count()
        total_notices = Notice.objects.filter(is_active=True).count()

        candidate_count = total_registered
        candidate_display = f"{candidate_count}+" if candidate_count > 0 else "500+"

        return Response({
            'status': 'success',
            'registered_candidates': candidate_count,
            'registered_candidates_display': candidate_display,
            'total_tests': published_tests,
            'total_attempts': total_attempts,
            'total_books': total_books if total_books > 0 else 26,
            'total_lessons': total_lessons if total_lessons > 0 else 80,
            'total_notices': total_notices,
            'total_guides': 12,
            'supported_languages': 10,
            'prometric_fidelity': '100%',
            'official_scaled_scoring': 250,
        })


class CandidatePublicProfileAPIView(APIView):
    """Returns public candidate profile by username."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        target_user = get_object_or_404(User.objects.select_related('profile'), username__iexact=username)
        profile, _ = UserProfile.objects.get_or_create(user=target_user)

        attempts = list(Attempt.objects.filter(user=target_user).select_related('test').order_by('-completed_at'))
        total_attempts = len(attempts)
        passed_attempts = 0
        total_scaled = 0
        highest_scaled = 0
        highest_level = 'Below A1'
        serialized_recent = []

        for att in attempts:
            scaled = att.scaled_score
            total_scaled += scaled
            if scaled > highest_scaled:
                highest_scaled = scaled
            if scaled >= 200:
                passed_attempts += 1
                highest_level = 'A2 (Passed)'
            elif scaled >= 150 and highest_level != 'A2 (Passed)':
                highest_level = 'A1 (Elementary)'

            if len(serialized_recent) < 5:
                serialized_recent.append({
                    'id': att.id,
                    'test_id': att.test_id,
                    'test_title': att.test.title if att.test else 'Mock Exam',
                    'test_category': att.test.category if att.test else 'basic',
                    'score': att.score,
                    'total_questions': att.total_questions,
                    'percentage': int(round(att.percentage)),
                    'scaled_score': scaled,
                    'passed': att.is_passed,
                    'completed_at': att.completed_at,
                })

        pass_rate = int(round(passed_attempts / total_attempts * 100)) if total_attempts > 0 else 0
        avg_scaled = int(round(total_scaled / total_attempts)) if total_attempts > 0 else 0

        # Compute rank
        all_candidates = compute_leaderboard_candidates()
        candidate_rank = None
        for c in all_candidates:
            if c['user_id'] == target_user.id:
                candidate_rank = c['rank']
                break

        # Compute dynamic achievements
        achievements = [
            {
                'id': 'registered',
                'title': 'Registered Candidate',
                'description': 'Joined Gakkou No Shiken examination portal',
                'icon': '🌸',
                'unlocked': True,
                'tier': 'common'
            },
            {
                'id': 'first_test',
                'title': 'First CBT Challenge',
                'description': 'Completed at least 1 mock exam attempt',
                'icon': '📝',
                'unlocked': total_attempts >= 1,
                'tier': 'bronze'
            },
            {
                'id': 'first_pass',
                'title': 'JFT-Basic Qualified (A2)',
                'description': 'Achieved 200+ scaled passing score',
                'icon': '💮',
                'unlocked': passed_attempts >= 1,
                'tier': 'silver'
            },
            {
                'id': 'high_scorer',
                'title': 'High Scorer Elite',
                'description': 'Achieved 220+ scaled score on mock exam',
                'icon': '⚡',
                'unlocked': highest_scaled >= 220,
                'tier': 'gold'
            },
            {
                'id': 'exam_veteran',
                'title': 'Exam Veteran',
                'description': 'Completed 3 or more mock exams',
                'icon': '📜',
                'unlocked': total_attempts >= 3,
                'tier': 'silver'
            },
            {
                'id': 'top_3',
                'title': 'Podium Champion',
                'description': 'Ranked in the Top 3 on the global leaderboard',
                'icon': '👑',
                'unlocked': candidate_rank is not None and candidate_rank <= 3,
                'tier': 'gold'
            },
        ]

        full_name = f"{target_user.first_name} {target_user.last_name}".strip() or target_user.username
        country, country_flag = resolve_user_country_and_flag(profile)

        return Response({
            'id': target_user.id,
            'username': target_user.username,
            'first_name': target_user.first_name,
            'last_name': target_user.last_name,
            'full_name': full_name,
            'email': target_user.email if request.user == target_user or request.user.is_staff else '',
            'bio': profile.bio,
            'target_exam': profile.target_exam,
            'target_exam_display': profile.get_target_exam_display(),
            'japanese_level': profile.japanese_level,
            'japanese_level_display': profile.get_japanese_level_display(),
            'location': profile.location,
            'country': country,
            'country_flag': country_flag,
            'date_joined': target_user.date_joined.strftime('%B %Y'),
            'is_staff': target_user.is_staff,
            'rank': candidate_rank,
            'total_candidates': len(all_candidates),
            'stats': {
                'total_attempts': total_attempts,
                'passed_attempts': passed_attempts,
                'pass_rate': pass_rate,
                'highest_scaled_score': highest_scaled,
                'avg_scaled_score': avg_scaled,
                'highest_level': highest_level,
            },
            'achievements': achievements,
            'recent_attempts': serialized_recent,
        })


from django.core.management import call_command
from django.conf import settings
import os

class SetupDatabaseAPIView(APIView):
    """Super lightweight setup with full error diagnosis."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.GET.get('key') != 'fayaz2026':
            return Response({'error': 'Unauthorized key'}, status=status.HTTP_403_FORBIDDEN)
        
        import traceback
        logs = []
        
        # 0. Auto-Install edge-tts, pydub if missing
        try:
            import edge_tts
            logs.append('✅ edge-tts is already installed')
        except ImportError:
            import sys, subprocess
            proc = subprocess.run([sys.executable, "-m", "pip", "install", "edge-tts", "pydub"], capture_output=True, text=True)
            if proc.returncode == 0:
                logs.append('✅ edge-tts and pydub installed successfully!')
            else:
                logs.append(f'❌ Pip install error: {proc.stderr}')


        # 1. Fast Migrate & Ensure Tables & Columns
        try:
            from django.db import connection

            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS accounts_emailverificationotp (
                        id integer PRIMARY KEY AUTOINCREMENT,
                        email varchar(254) NOT NULL,
                        otp_code varchar(6) NOT NULL,
                        created_at datetime NOT NULL,
                        is_verified bool NOT NULL,
                        username varchar(150) NOT NULL,
                        first_name varchar(150) NOT NULL,
                        last_name varchar(150) NOT NULL,
                        password_hash varchar(255) NOT NULL
                    )
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS accounts_emailverificationotp_email 
                    ON accounts_emailverificationotp(email)
                """)
                try:
                    cursor.execute("ALTER TABLE tests_question ADD COLUMN audio_script text DEFAULT ''")
                except Exception:
                    pass
                try:
                    cursor.execute("ALTER TABLE tests_questiongroup ADD COLUMN audio_script text DEFAULT ''")
                except Exception:
                    pass
                try:
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS tests_notice (
                            id integer PRIMARY KEY AUTOINCREMENT,
                            title varchar(255) NOT NULL,
                            summary text NOT NULL,
                            content text NOT NULL,
                            notice_type varchar(32) NOT NULL,
                            target_audience varchar(32) NOT NULL,
                            image varchar(100),
                            pdf_file varchar(100),
                            file_size_text varchar(64) NOT NULL,
                            action_url varchar(500) NOT NULL,
                            action_button_text varchar(64) NOT NULL,
                            is_active bool NOT NULL,
                            is_pinned bool NOT NULL,
                            show_as_popup bool NOT NULL,
                            order_index integer unsigned NOT NULL,
                            views_count integer unsigned NOT NULL,
                            downloads_count integer unsigned NOT NULL,
                            created_at datetime NOT NULL,
                            updated_at datetime NOT NULL,
                            expires_at datetime,
                            related_test_id bigint REFERENCES tests_test (id) DEFERRABLE INITIALLY DEFERRED
                        )
                    """)
                except Exception:
                    pass
            logs.append('✅ Database Tables & Schema (OTP, Audio Scripts, Notices): SUCCESS')
        except Exception as e:
            logs.append(f'❌ Table/Column creation error: {e}')

        # 2. Run Migrations with auto-fake for pre-existing tables
        try:
            call_command('migrate', '--fake-initial', interactive=False)
            logs.append('✅ Database Migrations: SUCCESS')
        except Exception as e:
            try:
                call_command('migrate', 'accounts', fake=True, interactive=False)
                call_command('migrate', interactive=False)
                logs.append('✅ Database Migrations (Auto-Synced): SUCCESS')
            except Exception as e2:
                logs.append(f'ℹ️ Database schema up to date (Migration note: {e2})')




        # 2. Admin Account Verification
        try:
            admin_pwd = request.GET.get('pwd') or os.environ.get('DJANGO_SUPERUSER_PASSWORD')
            user, created = User.objects.get_or_create(username='admin')
            if admin_pwd:
                user.set_password(admin_pwd)
                logs.append('✅ Admin password updated as requested.')
            elif created:
                logs.append('⚠️ Admin user created without password. Pass &pwd=... to set.')
            else:
                logs.append('✅ Admin account verified (existing password preserved).')
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.save()
        except Exception as e:
            logs.append(f'❌ Admin setup error: {e}')

        return Response({
            'status': 'RESULT',
            'login_url': 'https://gakkounoshiken.site/admin/',
            'logs': logs
        })


class RunMigrationAPIView(APIView):
    """
    1-Click Web Endpoint to run database migrations and user country backfill directly in the browser.
    Visiting this URL executes `migrate` and `backfill_user_countries` without terminal access.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return self.execute_migration(request)

    def post(self, request):
        return self.execute_migration(request)

    def execute_migration(self, request=None):
        import io
        from contextlib import redirect_stdout, redirect_stderr
        from pathlib import Path

        logs = []

        # 0. Synchronize Schema & Migrations state (self-healing for cPanel SQLite)
        try:
            from accounts.schema_sync import ensure_schema_synced
            schema_logs = ensure_schema_synced()
            if schema_logs:
                logs.append(f"✅ Schema Sync: {'; '.join(schema_logs)}")
        except Exception as e:
            logs.append(f"⚠️ Schema Sync Note: {e}")

        # 1. Database Migrations
        try:
            out = io.StringIO()
            with redirect_stdout(out), redirect_stderr(out):
                call_command('migrate', interactive=False, fake_initial=True)
            logs.append(f"✅ Migrations Output:\n{out.getvalue().strip() or 'All migrations up to date.'}")
        except Exception as e:
            err_str = str(e)
            if "already exists" in err_str or "duplicate column" in err_str:
                try:
                    out = io.StringIO()
                    with redirect_stdout(out), redirect_stderr(out):
                        call_command('migrate', fake=True, interactive=False)
                    logs.append(f"✅ Migrations Output:\nResolved existing tables ({err_str}). All migrations synchronized.")
                except Exception as inner_e:
                    logs.append(f"❌ Migration Error: {inner_e}")
            else:
                logs.append(f"❌ Migration Error: {e}")

        # 2. Existing User Country Backfill
        try:
            out = io.StringIO()
            with redirect_stdout(out), redirect_stderr(out):
                call_command('backfill_user_countries')
            logs.append(f"✅ Country Backfill Output:\n{out.getvalue().strip()}")
        except Exception as e:
            logs.append(f"❌ Backfill Error: {e}")

        # 3. Country Migration Readiness Check
        try:
            out = io.StringIO()
            with redirect_stdout(out), redirect_stderr(out):
                try:
                    call_command('check_country_migration')
                except SystemExit:
                    pass
            logs.append(f"ℹ️ Migration Readiness Check:\n{out.getvalue().strip()}")
        except Exception as e:
            logs.append(f"❌ Status Check Error: {e}")

        # 4. Curriculum Database Auto-Seed
        try:
            from tests.models import CurriculumLesson
            if CurriculumLesson.objects.count() == 0:
                out = io.StringIO()
                with redirect_stdout(out), redirect_stderr(out):
                    call_command('import_curriculum')
                logs.append(f"✅ Curriculum Seed Output:\n{out.getvalue().strip()}")
            else:
                logs.append(f"✅ Curriculum Database: {CurriculumLesson.objects.count()} lessons present.")
        except Exception as e:
            logs.append(f"⚠️ Curriculum Seed Note: {e}")

        # 5. JAC Exam Books & Audio Topics Auto-Seed
        try:
            from tests.models import ExamBook
            if ExamBook.objects.count() == 0:
                out = io.StringIO()
                with redirect_stdout(out), redirect_stderr(out):
                    call_command('seed_jac_books', skip_audio=True)
                logs.append(f"✅ JAC Books Seed Output:\n{out.getvalue().strip()}")
            else:
                logs.append(f"✅ JAC Books Database: {ExamBook.objects.count()} books present.")
        except Exception as e:
            logs.append(f"⚠️ JAC Books Seed Note: {e}")

        # 6. Hero Banners Auto-Seed
        try:
            from tests.models import HeroBanner
            if HeroBanner.objects.count() == 0:
                out = io.StringIO()
                with redirect_stdout(out), redirect_stderr(out):
                    call_command('seed_hero_banners')
                logs.append(f"✅ Hero Banners Seed Output:\n{out.getvalue().strip()}")
            else:
                logs.append(f"✅ Hero Banners Database: {HeroBanner.objects.count()} banners active.")
        except Exception as e:
            logs.append(f"⚠️ Hero Banners Seed Note: {e}")


        # 5. Superuser verification (does not overwrite custom passwords unless ?admin_pwd= is passed)
        try:
            custom_pwd = None
            if request:
                custom_pwd = request.GET.get('admin_pwd') or request.GET.get('new_password')

            admin_user = User.objects.filter(username='admin').first()
            if not admin_user:
                initial_pwd = custom_pwd or os.environ.get('DJANGO_SUPERUSER_PASSWORD')
                if initial_pwd:
                    admin_user = User.objects.create_superuser('admin', 'admin@example.com', initial_pwd)
                    logs.append("✅ Created superuser 'admin'.")
                else:
                    logs.append("ℹ️ No superuser 'admin' exists. Provide ?admin_pwd=... to create one.")
            elif custom_pwd:
                admin_user.set_password(custom_pwd)
                admin_user.is_staff = True
                admin_user.is_superuser = True
                admin_user.is_active = True
                admin_user.save()
                logs.append("✅ Superuser 'admin' password updated successfully as requested.")
            else:
                # Ensure account is active and staff without touching password hash
                admin_user.is_staff = True
                admin_user.is_superuser = True
                admin_user.is_active = True
                admin_user.save(update_fields=['is_staff', 'is_superuser', 'is_active'])
                logs.append("✅ Superuser 'admin' verified (is_active=True, is_staff=True, custom password preserved).")
        except Exception as e:
            logs.append(f"⚠️ Admin status note: {e}")

        # 6. Touch tmp/restart.txt to reload Passenger
        try:
            base_dir = Path(__file__).resolve().parent.parent
            restart_dir = base_dir / "tmp"
            restart_dir.mkdir(exist_ok=True)
            (restart_dir / "restart.txt").touch()
            logs.append("✅ Application reload triggered (tmp/restart.txt updated)!")
        except Exception as e:
            logs.append(f"⚠️ Passenger reload note: {e}")

        return Response({
            'status': 'SUCCESS',
            'message': 'Database migrations synchronized successfully!',
            'admin_login_url': 'https://gakkounoshiken.site/admin/',
            'logs': logs
        })



class AdminAutoUploadAPIView(APIView):
    """
    Instant background AJAX file auto-upload for Django Admin questions, groups, and options.
    Saves the file immediately upon selection without requiring a full page save.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not request.FILES:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = next(iter(request.FILES.values()))
        model_name = request.data.get('model', 'question').lower()
        object_id = request.data.get('object_id')
        field_name = request.data.get('field', 'audio').lower()

        if not object_id:
            return Response({'error': 'Missing object_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if model_name == 'question':
                obj = Question.objects.get(pk=object_id)
                if field_name == 'audio':
                    obj.audio = uploaded_file
                    obj.save(update_fields=['audio'])
                    file_url = obj.audio.url
                elif field_name == 'image':
                    obj.image = uploaded_file
                    obj.save(update_fields=['image'])
                    file_url = obj.image.url
                else:
                    return Response({'error': 'Invalid field'}, status=status.HTTP_400_BAD_REQUEST)

            elif model_name == 'questiongroup':
                obj = QuestionGroup.objects.get(pk=object_id)
                if field_name == 'audio':
                    obj.audio = uploaded_file
                    obj.save(update_fields=['audio'])
                    file_url = obj.audio.url
                elif field_name == 'image':
                    obj.image = uploaded_file
                    obj.save(update_fields=['image'])
                    file_url = obj.image.url
                else:
                    return Response({'error': 'Invalid field'}, status=status.HTTP_400_BAD_REQUEST)

            elif model_name == 'answeroption':
                obj = AnswerOption.objects.get(pk=object_id)
                obj.image = uploaded_file
                obj.save(update_fields=['image'])
                file_url = obj.image.url

            else:
                return Response({'error': 'Unknown model'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({
                'status': 'success',
                'url': file_url,
                'object_id': object_id,
                'field': field_name,
                'message': f'✅ {field_name.capitalize()} uploaded and auto-saved successfully!'
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ─── Notice & Study Material API Views ─────────────────────────────────

class NoticeListAPIView(APIView):
    """
    Returns active notices, announcements, and PDF materials.
    
    Query Parameters:
      - type: 'material', 'exam_alert', 'general', 'update', 'event'
      - audience: 'all', 'jft', 'ssw', 'registered'
      - pinned: 'true' (returns pinned notices)
      - popup: 'true' (returns high-priority popup alert notices)
      - search: keyword search in title, summary, or content
      - limit: max items to return (default 50)
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        now = timezone.now()
        is_staff = bool(request.user.is_authenticated and request.user.is_staff)

        if is_staff:
            queryset = Notice.objects.all()
        else:
            # Active and not expired
            queryset = Notice.objects.filter(is_active=True).filter(
                Q(expires_at__isnull=True) | Q(expires_at__gt=now)
            )

        # Filters
        notice_type = request.query_params.get('type')
        if notice_type:
            queryset = queryset.filter(notice_type=notice_type)

        audience = request.query_params.get('audience')
        if audience:
            if audience == 'all':
                queryset = queryset.filter(target_audience=Notice.TargetAudience.ALL)
            else:
                queryset = queryset.filter(target_audience__in=[Notice.TargetAudience.ALL, audience])

        pinned = request.query_params.get('pinned')
        if pinned is not None:
            is_pinned = str(pinned).lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_pinned=is_pinned)

        popup = request.query_params.get('popup')
        if popup is not None:
            show_as_popup = str(popup).lower() in ['true', '1', 'yes']
            queryset = queryset.filter(show_as_popup=show_as_popup)

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(summary__icontains=search) |
                Q(content__icontains=search)
            )

        # Limit
        limit = request.query_params.get('limit')
        if limit and limit.isdigit():
            queryset = queryset[:int(limit)]
        else:
            queryset = queryset[:50]

        serializer = NoticeSerializer(queryset, many=True, context={'request': request})
        
        # Categorized counts summary for tabs
        counts = {
            'all': Notice.objects.filter(is_active=True).count(),
            'material': Notice.objects.filter(is_active=True, notice_type=Notice.NoticeType.MATERIAL).count(),
            'exam_alert': Notice.objects.filter(is_active=True, notice_type=Notice.NoticeType.EXAM_ALERT).count(),
            'general': Notice.objects.filter(is_active=True, notice_type=Notice.NoticeType.GENERAL).count(),
            'update': Notice.objects.filter(is_active=True, notice_type=Notice.NoticeType.UPDATE).count(),
            'pinned': Notice.objects.filter(is_active=True, is_pinned=True).count(),
        }

        return Response({
            'count': len(serializer.data),
            'categories_count': counts,
            'notices': serializer.data
        })


class NoticeDetailAPIView(APIView):
    """Returns single notice details and increments view counter."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            notice = Notice.objects.get(pk=pk)
            # Increment view counter
            Notice.objects.filter(pk=pk).update(views_count=F('views_count') + 1)
            notice.refresh_from_db(fields=['views_count'])
            serializer = NoticeSerializer(notice, context={'request': request})
            return Response(serializer.data)
        except Notice.DoesNotExist:
            return Response({'error': 'Notice not found'}, status=status.HTTP_404_NOT_FOUND)


class NoticeDownloadAPIView(APIView):
    """Increments the download counter for a PDF study material notice."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        try:
            notice = Notice.objects.get(pk=pk)
            if not notice.pdf_file:
                return Response({'error': 'No PDF file attached to this notice'}, status=status.HTTP_400_BAD_REQUEST)
            
            Notice.objects.filter(pk=pk).update(downloads_count=F('downloads_count') + 1)
            pdf_url = get_absolute_media_url(notice.pdf_file, request)
            return Response({
                'status': 'success',
                'download_url': pdf_url,
                'downloads_count': notice.downloads_count + 1
            })
        except Notice.DoesNotExist:
            return Response({'error': 'Notice not found'}, status=status.HTTP_404_NOT_FOUND)


class SampleSswCsvAPIView(APIView):
    """
    GET /api/tests/sample-ssw-csv/
    Downloads the official SSW Prometric CBT questions sample CSV template.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from tests.utils import generate_sample_ssw_csv_string
        csv_data = generate_sample_ssw_csv_string()
        response = HttpResponse(csv_data, content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="ssw_prometric_test_questions_template.csv"'
        return response


class SampleJftCsvAPIView(APIView):
    """
    GET /api/tests/sample-jft-csv/
    Downloads the official JFT-Basic 4-section questions sample CSV template.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from tests.utils import generate_sample_csv_string
        csv_data = generate_sample_csv_string()
        response = HttpResponse(csv_data, content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="jft_test_questions_template.csv"'
        return response


class TestExportQuestionsCsvAPIView(APIView):
    """
    GET /api/tests/<int:pk>/export-csv/
    Exports all questions and answer options for the specified test into a standardized CSV.
    Supports both JFT-Basic (4 sections) and SSW (2 phases, typing questions).
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        from tests.models import Test
        from tests.utils import export_test_questions_to_csv
        from django.utils.text import slugify

        test_obj = get_object_or_404(Test, pk=pk)

        # Ensure draft tests are only exportable by staff
        if not test_obj.is_published and not (request.user.is_authenticated and request.user.is_staff):
            return Response(
                {"detail": "Cannot export questions from an unpublished draft test."},
                status=status.HTTP_403_FORBIDDEN
            )

        csv_data = export_test_questions_to_csv(test_obj)
        safe_title = slugify(test_obj.title) or f"test_{pk}"
        filename = f"{safe_title}_questions.csv"
        response = HttpResponse(csv_data, content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class TestImportQuestionsCsvAPIView(APIView):
    """
    POST /api/tests/<int:pk>/import-csv/
    Bulk imports questions from an uploaded CSV file into the specified test.
    Requires staff/admin authorization.
    Optional params:
      - clear_existing: boolean (true/false)
      - auto_generate_audio: boolean (true/false, default: true)
    """
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        from tests.models import Test
        from tests.utils import import_questions_from_csv
        from tests.signals import invalidate_test_cache

        test_obj = get_object_or_404(Test, pk=pk)
        csv_file = request.FILES.get('csv_file') or request.FILES.get('file')

        if not csv_file:
            return Response(
                {"detail": "Please provide a 'csv_file' multipart upload."},
                status=status.HTTP_400_BAD_REQUEST
            )

        clear_existing = str(request.data.get('clear_existing', '')).lower() in ['true', '1', 'yes']
        auto_generate_audio = str(request.data.get('auto_generate_audio', 'true')).lower() in ['true', '1', 'yes']

        if clear_existing:
            test_obj.questions.all().delete()
            test_obj.question_groups.all().delete()

        try:
            created_count, errors = import_questions_from_csv(
                test_obj,
                csv_file,
                auto_generate_audio=auto_generate_audio
            )
            invalidate_test_cache(test_obj.id)
            return Response({
                'status': 'success',
                'test_id': test_obj.id,
                'test_title': test_obj.title,
                'created_count': created_count,
                'errors': errors
            }, status=status.HTTP_200_OK)
        except ValueError as val_err:
            return Response({"detail": str(val_err)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"Import failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GameProfileAPIView(APIView):
    """Retrieves current candidate's Game Zone XP, level, and stats."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'profile', None)
        if not profile:
            return Response({'xp': 0, 'level': 1, 'streak': 0, 'mastered': 0})
        return Response({
            'xp': profile.game_xp,
            'level': profile.game_level,
            'streak': profile.game_streak,
            'mastered': profile.game_words_mastered,
            'last_played': profile.game_last_played,
        })


class GameProgressSyncAPIView(APIView):
    """Receives and syncs client-side game XP, level, and streak."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        xp = request.data.get('xp')
        level = request.data.get('level')
        streak = request.data.get('streak')
        mastered = request.data.get('mastered')

        if xp is not None:
            profile.game_xp = max(profile.game_xp, int(xp))
        if level is not None:
            profile.game_level = max(profile.game_level, int(level))
        if streak is not None:
            profile.game_streak = max(profile.game_streak, int(streak))
        if mastered is not None:
            profile.game_words_mastered = max(profile.game_words_mastered, int(mastered))

        profile.game_last_played = timezone.now().date()
        profile.save()

        return Response({
            'status': 'synced',
            'xp': profile.game_xp,
            'level': profile.game_level,
            'streak': profile.game_streak,
            'mastered': profile.game_words_mastered,
        })


class GameLeaderboardAPIView(APIView):
    """Returns top ranked Game Zone players for public leaderboard & top 3 podium."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        top_profiles = UserProfile.objects.filter(game_xp__gt=0).select_related('user').order_by('-game_xp', '-game_streak')[:25]
        
        ranks = []
        for idx, p in enumerate(top_profiles, start=1):
            ranks.append({
                'rank': idx,
                'username': p.user.username,
                'full_name': f"{p.user.first_name} {p.user.last_name}".strip() or p.user.username,
                'country': p.country or 'Bangladesh',
                'country_flag': get_country_flag(p.country) if p.country else '🇧🇩',
                'level': p.game_level,
                'xp': p.game_xp,
                'streak': p.game_streak,
                'mastered': p.game_words_mastered,
            })

        if len(ranks) < 3:
            seed_players = [
                {'rank': 1, 'username': 'SakuraSenpai', 'full_name': 'Sakura Tanaka', 'country': 'Japan', 'country_flag': '🇯🇵', 'level': 18, 'xp': 2450, 'streak': 14, 'mastered': 520},
                {'rank': 2, 'username': 'FayazNinja', 'full_name': 'Azizul Hakim', 'country': 'Bangladesh', 'country_flag': '🇧🇩', 'level': 15, 'xp': 1850, 'streak': 9, 'mastered': 460},
                {'rank': 3, 'username': 'KenjiSpeed', 'full_name': 'Kenji Sato', 'country': 'Japan', 'country_flag': '🇯🇵', 'level': 12, 'xp': 1200, 'streak': 6, 'mastered': 380},
                {'rank': 4, 'username': 'RahimBD', 'full_name': 'Rahim Ahmed', 'country': 'Bangladesh', 'country_flag': '🇧🇩', 'level': 10, 'xp': 950, 'streak': 5, 'mastered': 310},
                {'rank': 5, 'username': 'AungMinMM', 'full_name': 'Aung Min', 'country': 'Myanmar', 'country_flag': '🇲🇲', 'level': 8, 'xp': 720, 'streak': 4, 'mastered': 240},
            ]
            for s in seed_players:
                if not any(r['username'].lower() == s['username'].lower() for r in ranks):
                    ranks.append(s)
                    if len(ranks) >= 5:
                        break

        for i, r in enumerate(ranks, start=1):
            r['rank'] = i

        return Response({
            'status': 'success',
            'top_3': ranks[:3],
            'leaderboard': ranks,
        })


# ─── Curriculum Lessons & Study Hub API ──────────────────────────────

class CurriculumLessonListAPIView(APIView):
    """Returns lesson-wise vocabulary and kanji lists with counts and filter options."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lesson_type = request.query_params.get('type')  # 'vocabulary' or 'kanji'
        level = request.query_params.get('level')        # 'N5' or 'N4'
        search = request.query_params.get('search', '').strip()

        qs = CurriculumLesson.objects.all()

        if lesson_type in ['vocabulary', 'kanji']:
            qs = qs.filter(lesson_type=lesson_type)

        if level in ['N5', 'N4']:
            qs = qs.filter(level=level)

        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(title_ja__icontains=search))

        qs = qs.annotate(
            level_order=Case(
                When(level='N5', then=Value(1)),
                When(level='N4', then=Value(2)),
                default=Value(3),
                output_field=IntegerField()
            ),
            type_order=Case(
                When(lesson_type='vocabulary', then=Value(1)),
                When(lesson_type='kanji', then=Value(2)),
                default=Value(3),
                output_field=IntegerField()
            )
        ).order_by('type_order', 'level_order', 'lesson_number')

        # Calculate counts
        stats = {
            'total_vocab_lessons': CurriculumLesson.objects.filter(lesson_type='vocabulary').count(),
            'total_kanji_lessons': CurriculumLesson.objects.filter(lesson_type='kanji').count(),
            'n5_vocab_lessons': CurriculumLesson.objects.filter(lesson_type='vocabulary', level='N5').count(),
            'n4_vocab_lessons': CurriculumLesson.objects.filter(lesson_type='vocabulary', level='N4').count(),
            'n5_kanji_lessons': CurriculumLesson.objects.filter(lesson_type='kanji', level='N5').count(),
            'n4_kanji_lessons': CurriculumLesson.objects.filter(lesson_type='kanji', level='N4').count(),
            'total_words': CurriculumVocabulary.objects.count(),
            'total_kanji': CurriculumKanji.objects.count(),
        }

        serializer = CurriculumLessonListSerializer(qs, many=True)
        return Response({
            'stats': stats,
            'lessons': serializer.data
        })


class CurriculumLessonDetailAPIView(APIView):
    """Returns detail for a specific lesson with all its vocabulary or kanji items."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        lesson = get_object_or_404(
            CurriculumLesson.objects.prefetch_related('vocabularies', 'kanjis'),
            pk=pk
        )
        serializer = CurriculumLessonDetailSerializer(lesson)
        return Response(serializer.data)


class CurriculumSearchAPIView(APIView):
    """Global instant search across vocabulary and kanji database."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response({
                'vocabularies': [],
                'kanjis': [],
                'query': query,
                'count': 0
            })

        vocab_matches = CurriculumVocabulary.objects.filter(
            Q(word__icontains=query) |
            Q(furigana__icontains=query) |
            Q(romaji__icontains=query) |
            Q(meaning_en__icontains=query) |
            Q(meaning_bn__icontains=query)
        ).select_related('lesson')[:50]

        kanji_matches = CurriculumKanji.objects.filter(
            Q(character__icontains=query) |
            Q(onyomi__icontains=query) |
            Q(kunyomi__icontains=query) |
            Q(romaji__icontains=query) |
            Q(meaning_en__icontains=query) |
            Q(meaning_bn__icontains=query)
        ).select_related('lesson')[:50]

        vocab_data = []
        for v in vocab_matches:
            vocab_data.append({
                'id': v.id,
                'lesson_id': v.lesson_id,
                'lesson_number': v.lesson.lesson_number,
                'level': v.lesson.level,
                'lesson_title': v.lesson.title,
                'word': v.word,
                'furigana': v.furigana,
                'romaji': v.romaji,
                'meaning_en': v.meaning_en,
                'meaning_bn': v.meaning_bn,
                'speech': v.speech,
            })

        kanji_data = []
        for k in kanji_matches:
            kanji_data.append({
                'id': k.id,
                'lesson_id': k.lesson_id,
                'lesson_number': k.lesson.lesson_number,
                'level': k.lesson.level,
                'lesson_title': k.lesson.title,
                'character': k.character,
                'onyomi': k.onyomi,
                'kunyomi': k.kunyomi,
                'romaji': k.romaji,
                'meaning_en': k.meaning_en,
                'meaning_bn': k.meaning_bn,
                'speech': k.speech,
            })

        return Response({
            'query': query,
            'vocab_count': len(vocab_data),
            'kanji_count': len(kanji_data),
            'vocabularies': vocab_data,
            'kanjis': kanji_data
        })


# ─── Exam Books & Interactive Reader API Views ────────────────────────
class ExamBookListAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = ExamBook.objects.filter(is_published=True)

        category = request.query_params.get('category')
        if category and category.lower() != 'all':
            qs = qs.filter(category=category.lower())

        language = request.query_params.get('language')
        if language and language.lower() != 'all':
            qs = qs.filter(language=language.lower())

        book_type = request.query_params.get('book_type')
        if book_type and book_type.lower() != 'all':
            qs = qs.filter(book_type=book_type.lower())

        q = request.query_params.get('q', '').strip()
        if q:
            qs = qs.filter(
                Q(title__icontains=q) |
                Q(title_ja__icontains=q) |
                Q(description__icontains=q)
            )

        serializer = ExamBookListSerializer(qs, many=True, context={'request': request})

        # Aggregated language options
        all_published = ExamBook.objects.filter(is_published=True)
        languages_dict = OrderedDict()
        for b in all_published.order_by('order', 'id'):
            if b.language not in languages_dict:
                languages_dict[b.language] = {
                    'code': b.language,
                    'name': b.language_name,
                    'flag': b.language_flag,
                    'count': 0
                }
            languages_dict[b.language]['count'] += 1

        categories_list = [
            {'code': 'all', 'label': 'All Categories', 'label_ja': 'すべて'},
            {'code': 'civil', 'label': 'Civil Engineering', 'label_ja': '土木'},
            {'code': 'architecture', 'label': 'Architecture', 'label_ja': '建築'},
            {'code': 'lifeline', 'label': 'Infrastructure & Lifeline', 'label_ja': 'ライフライン・設備'},
        ]

        return Response({
            'books': serializer.data,
            'total_count': len(serializer.data),
            'languages': list(languages_dict.values()),
            'categories': categories_list,
        })


class ExamBookDetailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        book = get_object_or_404(ExamBook, pk=pk, is_published=True)
        serializer = ExamBookDetailSerializer(book, context={'request': request})

        # Navigation: previous and next books in the same language or category
        prev_book = ExamBook.objects.filter(
            is_published=True,
            language=book.language,
            order__lt=book.order
        ).order_by('-order').first()

        next_book = ExamBook.objects.filter(
            is_published=True,
            language=book.language,
            order__gt=book.order
        ).order_by('order').first()

        data = serializer.data
        data['prev_book_id'] = prev_book.id if prev_book else None
        data['next_book_id'] = next_book.id if next_book else None
        return Response(data)


class ExamBookLanguagesAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        books = ExamBook.objects.filter(is_published=True).order_by('order')
        langs = OrderedDict()
        for b in books:
            if b.language not in langs:
                langs[b.language] = {
                    'code': b.language,
                    'name': b.language_name,
                    'flag': b.language_flag,
                    'books_count': 0
                }
            langs[b.language]['books_count'] += 1
        return Response(list(langs.values()))


class HeroBannerListAPIView(APIView):
    """Returns active hero banner slides for homepage carousel."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        banners = HeroBanner.objects.filter(is_active=True).order_by('order', 'id')
        serializer = HeroBannerSerializer(banners, many=True, context={'request': request})
        return Response(serializer.data)


def _serialize_support_message(msg):
    return {
        'id': msg.id,
        'sender_type': msg.sender_type,
        'sender_name': msg.sender_name or (
            'Gakkou Support Team' if msg.sender_type == SupportMessage.SenderType.ADMIN
            else ('Gakkou Support Desk' if msg.sender_type == SupportMessage.SenderType.SYSTEM else 'You')
        ),
        'body': msg.body,
        'created_at': msg.created_at.isoformat() if msg.created_at else None,
    }


class SupportChatThreadAPIView(APIView):
    """
    Fetches the logged-in candidate's support chat thread & message history.
    Supports:
      - ?summary_only=1 -> lightweight unread badge check
      - ?after_id=<int> -> delta fetch of only newer messages
      - ?mark_read=1    -> resets unread_by_user to 0 when popup/fullscreen is open
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            thread = SupportThread.objects.filter(user=request.user).first()
        except Exception:
            ensure_schema_synced()
            thread = SupportThread.objects.filter(user=request.user).first()

        if not thread:
            return Response({
                'thread_id': None,
                'status': 'none',
                'unread_count': 0,
                'last_message_at': None,
                'messages': [],
            })

        summary_only = str(request.query_params.get('summary_only', '')).lower() in ('1', 'true')
        mark_read = str(request.query_params.get('mark_read', '')).lower() in ('1', 'true')
        after_id_raw = request.query_params.get('after_id')

        if mark_read and thread.unread_by_user > 0:
            SupportThread.objects.filter(pk=thread.pk, unread_by_user__gt=0).update(unread_by_user=0)
            thread.unread_by_user = 0

        if summary_only:
            return Response({
                'thread_id': thread.id,
                'status': thread.status,
                'unread_count': thread.unread_by_user,
                'last_message_at': thread.last_message_at.isoformat() if thread.last_message_at else None,
            })

        msgs_qs = thread.messages.order_by('created_at', 'id')
        if after_id_raw is not None:
            try:
                after_id = int(after_id_raw)
                if after_id > 0:
                    msgs_qs = msgs_qs.filter(id__gt=after_id)
            except (ValueError, TypeError):
                pass
        else:
            # Cap full history payload to most recent 200 messages for fast response
            total_count = msgs_qs.count()
            if total_count > 200:
                msgs_qs = msgs_qs[total_count - 200:]

        messages_data = [_serialize_support_message(m) for m in msgs_qs]
        return Response({
            'thread_id': thread.id,
            'status': thread.status,
            'unread_count': thread.unread_by_user,
            'last_message_at': thread.last_message_at.isoformat() if thread.last_message_at else None,
            'messages': messages_data,
        })


class SupportChatSendAPIView(APIView):
    """
    Allows an authenticated candidate to send a message to Gakkou Support.
    Enforces rate limiting (max 5 messages per 60 seconds) and 1,000-character limit.
    Automatically posts a welcome/confirmation bubble on the candidate's first message.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        raw_body = request.data.get('message') or request.data.get('body') or ''
        body = str(raw_body).strip()
        if not body:
            return Response({'detail': 'Please enter a message before sending.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(body) > 1000:
            return Response(
                {'detail': 'Message is too long (maximum 1,000 characters). Please shorten your message.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            thread, created = SupportThread.objects.get_or_create(user=request.user)
        except Exception:
            ensure_schema_synced()
            thread, created = SupportThread.objects.get_or_create(user=request.user)

        now = timezone.now()
        one_min_ago = now - timezone.timedelta(seconds=60)
        recent_user_msgs = thread.messages.filter(
            sender_type=SupportMessage.SenderType.USER,
            created_at__gte=one_min_ago,
        ).count()
        if recent_user_msgs >= 5:
            return Response(
                {'detail': 'You are sending messages too quickly. Please wait a moment before sending another message.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        existing_total = thread.messages.count()
        sender_label = (
            f"{request.user.first_name} {request.user.last_name}".strip()
            or request.user.username
        )

        user_msg = SupportMessage.objects.create(
            thread=thread,
            sender_type=SupportMessage.SenderType.USER,
            sender_name=sender_label,
            body=body,
        )

        new_messages = [_serialize_support_message(user_msg)]

        # On first message in thread, send an automated instant confirmation bubble
        if existing_total == 0:
            sys_msg = SupportMessage.objects.create(
                thread=thread,
                sender_type=SupportMessage.SenderType.SYSTEM,
                sender_name='Gakkou Support Desk',
                body=(
                    "👋 Konnichiwa! Your message has been received by the Gakkou No Shiken Support Team. "
                    "An instructor or admin will reply right here in your chat widget—your history is saved to your account across all devices."
                ),
            )
            new_messages.append(_serialize_support_message(sys_msg))

        thread.status = SupportThread.Status.NEEDS_REPLY
        thread.unread_by_admin = (thread.unread_by_admin or 0) + 1
        thread.unread_by_user = 0
        thread.last_message_preview = body[:250]
        thread.last_message_at = timezone.now()
        thread.save(update_fields=[
            'status',
            'unread_by_admin',
            'unread_by_user',
            'last_message_preview',
            'last_message_at',
            'updated_at',
        ])

        return Response({
            'thread_id': thread.id,
            'status': thread.status,
            'unread_count': thread.unread_by_user,
            'last_message_at': thread.last_message_at.isoformat() if thread.last_message_at else None,
            'new_messages': new_messages,
        }, status=status.HTTP_201_CREATED)


class SupportChatMarkReadAPIView(APIView):
    """Marks all unread admin replies in the candidate's support thread as read."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            SupportThread.objects.filter(user=request.user, unread_by_user__gt=0).update(unread_by_user=0)
        except Exception:
            pass
        return Response({'unread_count': 0, 'status': 'ok'})


# ==============================================================================
# B2B2C Partner Schools & LPK Ecosystem APIs
# ==============================================================================

def _compute_attempt_metrics(attempt):
    """Computes percentage, 0-250 scaled score, and pass status matching AttemptResultsAPIView."""
    pct = (attempt.score / attempt.total_questions * 100.0) if attempt.total_questions > 0 else 0.0
    scaled = int(round(10 + (pct / 100.0) * 240)) if attempt.total_questions > 0 else 10
    is_skill = attempt.test and attempt.test.category == Test.Category.SKILL
    passed = (pct >= 60.0) if is_skill else (pct >= 80.0)
    return round(pct, 1), scaled, passed


class PartnerPublicListAPIView(APIView):
    """Returns featured active Partner Schools & aggregate platform partner stats."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            featured = PartnerSchool.objects.filter(is_active=True, is_featured=True).annotate(
                student_count=Count('students', distinct=True)
            ).order_by('-student_count', '-created_at')[:12]
            total_active = PartnerSchool.objects.filter(is_active=True).count()
        except Exception:
            ensure_schema_synced()
            featured = PartnerSchool.objects.filter(is_active=True, is_featured=True).annotate(
                student_count=Count('students', distinct=True)
            ).order_by('-student_count', '-created_at')[:12]
            total_active = PartnerSchool.objects.filter(is_active=True).count()

        schools_data = [
            {
                'id': s.id,
                'name': s.name,
                'slug': s.slug,
                'country': s.country,
                'flag': get_country_flag(s.country) if s.country else '🏫',
                'city': s.city,
                'student_count': getattr(s, 'student_count', 0),
            }
            for s in featured
        ]
        return Response({
            'total_partners': total_active,
            'featured_partners': schools_data,
        })


class PartnerSchoolPublicInfoAPIView(APIView):
    """Returns safe public banner info for a Partner School invite link (?partner=<slug>)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        school = get_object_or_404(PartnerSchool, slug=slug, is_active=True)
        student_count = school.students.filter(partner_status=UserProfile.PartnerStatus.APPROVED).count()
        return Response({
            'id': school.id,
            'name': school.name,
            'slug': school.slug,
            'country': school.country,
            'flag': get_country_flag(school.country) if school.country else '🏫',
            'city': school.city,
            'welcome_message': school.welcome_message,
            'student_count': student_count,
            'require_join_pin': school.require_join_pin,
            'require_approval': school.require_approval,
            'enrollment_locked': school.enrollment_locked,
        })


class PartnerSchoolJoinAPIView(APIView):
    """
    Links the authenticated student to a PartnerSchool by slug, enforcing optional
    6-digit Class Join PIN, Enrollment Lock, and Sensei Approval Queue.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        slug = (request.data.get('slug') or request.data.get('partner_slug') or '').strip()
        if not slug:
            return Response({'detail': 'Partner school code/slug is required.'}, status=status.HTTP_400_BAD_REQUEST)

        school = PartnerSchool.objects.filter(slug__iexact=slug, is_active=True).first()
        if not school:
            return Response({'detail': 'Partner school code was not found or is inactive.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        already_approved_here = (
            profile.partner_school_id == school.id
            and profile.partner_status == UserProfile.PartnerStatus.APPROVED
        )

        if school.enrollment_locked and not already_approved_here:
            return Response(
                {'detail': f"Enrollment at {school.name} is currently locked by the Sensei. Please contact your instructor."},
                status=status.HTTP_403_FORBIDDEN,
            )

        provided_pin = (request.data.get('join_code') or request.data.get('pin') or '').strip()
        if school.require_join_pin and not already_approved_here:
            if not provided_pin or provided_pin != school.join_code:
                return Response(
                    {'detail': 'Invalid or missing 6-digit Class Join PIN. Please enter the current PIN from your Sensei.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        batch = (request.data.get('batch') or request.data.get('partner_batch') or '').strip()[:64]
        student_id = (request.data.get('student_id') or request.data.get('student_roll_or_id') or '').strip()[:64]
        first_name = (request.data.get('first_name') or '').strip()[:150]
        last_name = (request.data.get('last_name') or '').strip()[:150]

        user_updated = False
        if first_name:
            user.first_name = first_name
            user_updated = True
        if last_name:
            user.last_name = last_name
            user_updated = True
        if user_updated:
            user.save(update_fields=['first_name', 'last_name'])

        profile.partner_school = school
        if batch:
            profile.partner_batch = batch
        if student_id:
            profile.student_roll_or_id = student_id
        if not profile.partner_joined_at:
            profile.partner_joined_at = timezone.now()

        if already_approved_here:
            profile.partner_status = UserProfile.PartnerStatus.APPROVED
        elif school.require_approval:
            profile.partner_status = UserProfile.PartnerStatus.PENDING
        else:
            profile.partner_status = UserProfile.PartnerStatus.APPROVED

        profile.save()

        refreshed_user = User.objects.select_related('profile', 'profile__partner_school').get(pk=user.pk)
        status_msg = (
            f"Request sent to {school.name}! Your Sensei will approve your membership shortly."
            if profile.partner_status == UserProfile.PartnerStatus.PENDING
            else f"Linked to {school.name} successfully!"
        )

        return Response({
            'status': 'success',
            'partner_status': profile.partner_status,
            'message': status_msg,
            'user': UserSerializer(refreshed_user).data,
            'partner_school': PartnerSchoolSummarySerializer(school).data,
        })


class PartnerSchoolLeaveAPIView(APIView):
    """Allows a student to unlink their account from a PartnerSchool."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.partner_school = None
        profile.partner_batch = ''
        profile.student_roll_or_id = ''
        profile.save(update_fields=['partner_school', 'partner_batch', 'student_roll_or_id', 'updated_at'])
        refreshed_user = User.objects.select_related('profile', 'profile__partner_school').get(pk=request.user.pk)
        return Response({
            'status': 'success',
            'message': 'You have left the partner school batch.',
            'user': UserSerializer(refreshed_user).data,
        })


class PartnerApplicationCreateAPIView(APIView):
    """Receives partnership inquiries from LPKs / Japanese Language Schools (/partners)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        school_name = (request.data.get('school_name') or '').strip()
        contact_name = (request.data.get('contact_name') or '').strip()
        whatsapp_or_phone = (request.data.get('whatsapp_or_phone') or '').strip()
        email = (request.data.get('email') or '').strip()
        country = (request.data.get('country') or 'Indonesia').strip()
        city = (request.data.get('city') or '').strip()
        message = (request.data.get('message') or '').strip()[:1500]
        try:
            est = max(1, int(request.data.get('estimated_students') or 30))
        except (TypeError, ValueError):
            est = 30

        if not school_name or not contact_name:
            return Response(
                {'detail': 'School/LPK name and contact person name are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not whatsapp_or_phone and not email:
            return Response(
                {'detail': 'Please provide either a WhatsApp number or an Email address.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            app = PartnerApplication.objects.create(
                school_name=school_name[:200],
                country=country[:100],
                city=city[:100],
                contact_name=contact_name[:150],
                whatsapp_or_phone=whatsapp_or_phone[:100],
                email=email[:254],
                estimated_students=est,
                message=message,
            )
        except Exception:
            ensure_schema_synced()
            app = PartnerApplication.objects.create(
                school_name=school_name[:200],
                country=country[:100],
                city=city[:100],
                contact_name=contact_name[:150],
                whatsapp_or_phone=whatsapp_or_phone[:100],
                email=email[:254],
                estimated_students=est,
                message=message,
            )

        return Response({
            'status': 'success',
            'application_id': app.id,
            'message': 'Thank you! Your Partner School application has been received. Our team will reach out shortly with your invite link & Sensei dashboard key.',
        }, status=status.HTTP_201_CREATED)


def _authorize_partner_school_sensei(request, school):
    """
    Returns True if the request is authorized to manage `school`:
    - Authenticated platform staff/superuser
    - Authenticated user who is `school.owner`
    - Valid `key` matching `school.access_token` (in query_params, headers, or request.data)
    """
    if request.user and request.user.is_authenticated:
        if request.user.is_staff or request.user.is_superuser:
            return True
        if school.owner_id and school.owner_id == request.user.id:
            return True
    provided_key = (
        request.query_params.get('key')
        or request.headers.get('X-Sensei-Key')
        or (request.data.get('key') if hasattr(request, 'data') and isinstance(request.data, dict) else '')
        or ''
    ).strip()
    return bool(provided_key and provided_key == school.access_token)


class PartnerSchoolDashboardAPIView(APIView):
    """
    Private Sensei / Instructor Batch Dashboard API (/api/partners/<slug>/dashboard/?key=...).
    Supports both website user login (school.owner / staff) and Sensei access key.
    Provides KPI metrics, 4-Section Class Weakness Breakdown, 1st vs Best attempt scores,
    student approval queue, assigned exams with attendance PINs, study notes, and notifications.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        school = get_object_or_404(PartnerSchool, slug=slug, is_active=True)
        if not _authorize_partner_school_sensei(request, school):
            return Response(
                {'detail': 'Invalid or missing Sensei access key or school owner login for this dashboard.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        batch_filter = (request.query_params.get('batch') or '').strip()
        test_id_filter = request.query_params.get('test_id')
        days_filter = (request.query_params.get('days') or 'all').strip().lower()
        export_fmt = (request.query_params.get('export') or '').strip().lower()

        profiles_qs = UserProfile.objects.filter(partner_school=school).select_related('user').order_by('user__first_name', 'user__username')
        all_batches = sorted({p.partner_batch for p in profiles_qs if p.partner_batch})
        if batch_filter and batch_filter.lower() != 'all':
            profiles_qs = profiles_qs.filter(partner_batch=batch_filter)

        profiles_list = list(profiles_qs)
        user_ids = [p.user_id for p in profiles_list]
        profile_by_uid = {p.user_id: p for p in profiles_list}

        attempts_qs = Attempt.objects.filter(user_id__in=user_ids).select_related('test', 'user').order_by('completed_at', 'id')
        if test_id_filter and str(test_id_filter).isdigit():
            attempts_qs = attempts_qs.filter(test_id=int(test_id_filter))
        if days_filter in ('7', '30'):
            cutoff = timezone.now() - timezone.timedelta(days=int(days_filter))
            attempts_qs = attempts_qs.filter(completed_at__gte=cutoff)

        attempts_list = list(attempts_qs)
        test_ids_seen = {a.test_id for a in attempts_list if a.test_id}

        # Precompute section analytics in 2 flat queries (safe for cPanel SQLite)
        questions_meta = defaultdict(list)
        if test_ids_seen:
            for q_id, t_id, q_sec, q_type in Question.objects.filter(test_id__in=test_ids_seen).values_list('id', 'test_id', 'section', 'type'):
                questions_meta[t_id].append((q_id, q_sec, q_type))

        correct_options_by_qid = defaultdict(list)
        if test_ids_seen:
            for q_id, opt_id, opt_label in AnswerOption.objects.filter(
                question__test_id__in=test_ids_seen,
                is_correct=True,
            ).values_list('question_id', 'id', 'label'):
                correct_options_by_qid[q_id].append((opt_id, opt_label))

        section_totals = {
            'script_vocab': {'label': 'Script & Vocabulary', 'correct': 0, 'total': 0},
            'conversation': {'label': 'Conversation & Expression', 'correct': 0, 'total': 0},
            'listening': {'label': 'Listening Comprehension', 'correct': 0, 'total': 0},
            'reading': {'label': 'Reading Comprehension', 'correct': 0, 'total': 0},
            'audio': {'label': 'SSW Audio & Typing', 'correct': 0, 'total': 0},
            'occupational': {'label': 'SSW Practical Knowledge', 'correct': 0, 'total': 0},
        }

        per_user_attempts = defaultdict(list)
        recent_attempts_data = []
        all_scaled_scores = []
        passed_attempt_count = 0

        for att in attempts_list:
            pct, scaled, passed = _compute_attempt_metrics(att)
            all_scaled_scores.append(scaled)
            if passed:
                passed_attempt_count += 1

            # Aggregate section stats for this attempt
            answers_dict = att.answers if isinstance(att.answers, dict) else {}
            if not answers_dict.get('_is_preview'):
                for q_id, q_sec, q_type in questions_meta.get(att.test_id, []):
                    if q_sec not in section_totals:
                        continue
                    section_totals[q_sec]['total'] += 1
                    raw_ans = answers_dict.get(str(q_id))
                    is_q_correct = False
                    if q_type in ('typing', 'audio_typing'):
                        typed = str(raw_ans or '').strip().lower()
                        if typed:
                            accepted = []
                            for _, lbl in correct_options_by_qid.get(q_id, []):
                                accepted.extend([part.strip().lower() for part in str(lbl).split(',') if part.strip()])
                            is_q_correct = typed in accepted
                    elif raw_ans is not None and str(raw_ans).isdigit():
                        sel_id = int(raw_ans)
                        correct_ids = [oid for oid, _ in correct_options_by_qid.get(q_id, [])]
                        is_q_correct = sel_id in correct_ids
                    if is_q_correct:
                        section_totals[q_sec]['correct'] += 1

            prof = profile_by_uid.get(att.user_id)
            u = att.user
            full_name = f"{u.first_name} {u.last_name}".strip() or u.username
            entry = {
                'attempt_id': att.id,
                'user_id': u.id,
                'username': u.username,
                'full_name': full_name,
                'batch': prof.partner_batch if prof else '',
                'student_roll_or_id': prof.student_roll_or_id if prof else '',
                'test_id': att.test_id,
                'test_title': att.test.title if att.test else 'Mock Test',
                'is_school_exclusive': bool(att.test and att.test.partner_school_id == school.id),
                'raw_score': att.score,
                'total_questions': att.total_questions,
                'percentage': pct,
                'scaled_score': scaled,
                'passed': passed,
                'completed_at': att.completed_at.isoformat() if att.completed_at else None,
            }
            per_user_attempts[u.id].append(entry)
            recent_attempts_data.append(entry)

        # Build student roster with 1st Attempt vs Best Score
        students_roster = []
        for prof in profiles_list:
            u = prof.user
            full_name = f"{u.first_name} {u.last_name}".strip() or u.username
            u_atts = per_user_attempts.get(u.id, [])
            if u_atts:
                first_att = u_atts[0]
                latest_att = u_atts[-1]
                best_att = max(u_atts, key=lambda x: (x['scaled_score'], x['percentage']))
                has_passed = any(a['passed'] for a in u_atts)
            else:
                first_att = latest_att = best_att = None
                has_passed = False

            students_roster.append({
                'user_id': u.id,
                'username': u.username,
                'full_name': full_name,
                'batch': prof.partner_batch or 'General',
                'student_roll_or_id': prof.student_roll_or_id or '',
                'partner_status': prof.partner_status or UserProfile.PartnerStatus.APPROVED,
                'attempts_count': len(u_atts),
                'first_score': first_att['scaled_score'] if first_att else None,
                'first_pct': first_att['percentage'] if first_att else None,
                'best_score': best_att['scaled_score'] if best_att else None,
                'best_pct': best_att['percentage'] if best_att else None,
                'latest_score': latest_att['scaled_score'] if latest_att else None,
                'latest_test_title': latest_att['test_title'] if latest_att else None,
                'last_attempt_at': latest_att['completed_at'] if latest_att else None,
                'passed': has_passed,
                'joined_at': prof.partner_joined_at.isoformat() if prof.partner_joined_at else None,
            })

        students_roster.sort(key=lambda s: (-(s['best_score'] or -1), s['full_name'].lower()))

        # Handle CSV Export
        if export_fmt == 'csv':
            buf = io.StringIO()
            buf.write('\ufeff')  # UTF-8 BOM for clean Excel opening
            writer = csv.writer(buf)
            writer.writerow([
                'Student Name',
                'Username',
                'Student ID / Roll',
                'Batch',
                'Attempts',
                '1st Attempt Score (/250)',
                'Best Score (/250)',
                'Status',
                'Latest Test',
                'Last Exam Date',
            ])
            for row in students_roster:
                writer.writerow([
                    row['full_name'],
                    f"@{row['username']}",
                    row['student_roll_or_id'] or '-',
                    row['batch'],
                    row['attempts_count'],
                    row['first_score'] if row['first_score'] is not None else 'Not Tested',
                    row['best_score'] if row['best_score'] is not None else 'Not Tested',
                    'PASSED (CEFR A2)' if row['passed'] else ('NEEDS PRACTICE' if row['attempts_count'] > 0 else 'NO ATTEMPTS'),
                    row['latest_test_title'] or '-',
                    row['last_attempt_at'][:10] if row['last_attempt_at'] else '-',
                ])
            resp = HttpResponse(buf.getvalue(), content_type='text/csv; charset=utf-8')
            resp['Content-Disposition'] = f'attachment; filename="{school.slug}_batch_scores.csv"'
            return resp

        section_analytics = []
        for sec_key, sec_val in section_totals.items():
            if sec_val['total'] > 0:
                acc = round((sec_val['correct'] / sec_val['total']) * 100.0, 1)
                section_analytics.append({
                    'key': sec_key,
                    'label': sec_val['label'],
                    'accuracy_pct': acc,
                    'correct': sec_val['correct'],
                    'total': sec_val['total'],
                })

        # Available tests list for filter dropdown (school's exclusive tests + all published global tests)
        available_tests = list(
            Test.objects.filter(
                Q(is_published=True, partner_school__isnull=True) | Q(partner_school=school)
            ).values('id', 'title', 'category', 'partner_school_id').order_by('-partner_school_id', 'id')
        )

        avg_score = round(sum(all_scaled_scores) / len(all_scaled_scores), 1) if all_scaled_scores else 0
        pass_rate = round((passed_attempt_count / len(attempts_list)) * 100.0, 1) if attempts_list else 0

        recent_attempts_data.sort(key=lambda x: x['completed_at'] or '', reverse=True)

        # Assigned Exams, Study Notes & Notifications for Schoooli LMS Dashboard
        assigned_exams_qs = (
            PartnerAssignedExam.objects.filter(school=school)
            .select_related('test')
            .prefetch_related('attended_users')
            .order_by('-is_active', '-created_at')
        )
        assigned_exams_data = []
        for ae in assigned_exams_qs:
            attended_ids = {u.id for u in ae.attended_users.all()}
            submitted_for_test = {
                a.user_id for a in attempts_list if a.test_id == ae.test_id
            }
            combined_attended = attended_ids | submitted_for_test
            assigned_exams_data.append({
                'id': ae.id,
                'test_id': ae.test_id,
                'test_title': ae.test.title if ae.test else 'Mock Test',
                'category': ae.test.category if ae.test else 'basic',
                'title': ae.title or (ae.test.title if ae.test else 'Assigned Exam'),
                'target_batch': ae.target_batch or 'All Batches',
                'attendance_pin': ae.attendance_pin,
                'require_pin': ae.require_pin,
                'instructions': ae.instructions,
                'scheduled_date_label': ae.scheduled_date_label or 'Active Routine',
                'is_active': ae.is_active,
                'attended_count': len(combined_attended),
                'submitted_count': len(submitted_for_test),
                'created_at': ae.created_at.isoformat() if ae.created_at else None,
            })

        study_notes_qs = PartnerStudyNote.objects.filter(school=school).order_by('-is_pinned', '-created_at')
        study_notes_data = [
            {
                'id': sn.id,
                'title': sn.title,
                'category': sn.category,
                'category_label': sn.get_category_display(),
                'content': sn.content,
                'external_url': sn.external_url,
                'target_batch': sn.target_batch or 'All Batches',
                'views_count': sn.views_count,
                'is_pinned': sn.is_pinned,
                'created_at': sn.created_at.isoformat() if sn.created_at else None,
            }
            for sn in study_notes_qs
        ]

        notifications_qs = PartnerNotification.objects.filter(school=school).order_by('-created_at')[:30]
        notifications_data = [
            {
                'id': nf.id,
                'title': nf.title,
                'message': nf.message,
                'priority': nf.priority,
                'priority_label': nf.get_priority_display(),
                'target_batch': nf.target_batch or 'All Batches',
                'is_active': nf.is_active,
                'created_at': nf.created_at.isoformat() if nf.created_at else None,
            }
            for nf in notifications_qs
        ]

        pending_count = sum(1 for s in students_roster if s['partner_status'] == UserProfile.PartnerStatus.PENDING)
        approved_count = sum(1 for s in students_roster if s['partner_status'] == UserProfile.PartnerStatus.APPROVED)
        passed_students_count = sum(1 for s in students_roster if s['passed'])

        return Response({
            'school': {
                'id': school.id,
                'name': school.name,
                'slug': school.slug,
                'country': school.country,
                'flag': get_country_flag(school.country) if school.country else '🏫',
                'city': school.city,
                'welcome_message': school.welcome_message,
                'invite_url': f"https://www.gakkounoshiken.site/?partner={school.slug}",
                'join_code': school.join_code,
                'require_join_pin': school.require_join_pin,
                'require_approval': school.require_approval,
                'enrollment_locked': school.enrollment_locked,
            },
            'kpis': {
                'total_students': len(profiles_list),
                'approved_students': approved_count,
                'pending_students': pending_count,
                'tested_students': sum(1 for s in students_roster if s['attempts_count'] > 0),
                'passed_students': passed_students_count,
                'total_attempts': len(attempts_list),
                'pass_rate_pct': pass_rate,
                'avg_scaled_score': avg_score,
                'assigned_exams_count': len(assigned_exams_data),
                'study_notes_count': len(study_notes_data),
                'notifications_count': len(notifications_data),
            },
            'section_analytics': section_analytics,
            'batches': all_batches,
            'available_tests': available_tests,
            'students': students_roster,
            'recent_attempts': recent_attempts_data[:100],
            'assigned_exams': assigned_exams_data,
            'study_notes': study_notes_data,
            'notifications': notifications_data,
        })


class PartnerSchoolManageAPIView(APIView):
    """
    Sensei / School Owner Management API (POST /api/partners/<slug>/manage/).
    Allows schools to manage student approval, rotate Join PINs, lock enrollment,
    assign/schedule mock tests with 4-digit attendance PINs, share study notes,
    and post notifications to students.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, slug):
        import random
        school = get_object_or_404(PartnerSchool, slug=slug, is_active=True)
        if not _authorize_partner_school_sensei(request, school):
            return Response(
                {'detail': 'Unauthorized. Please provide a valid Sensei key or log in with the School Owner account.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        action = (request.data.get('action') or '').strip().lower()

        # 1. Update School Security / Join PIN / Approval Gate
        if action in ('update_security', 'regenerate_join_code'):
            if 'require_join_pin' in request.data:
                school.require_join_pin = bool(request.data.get('require_join_pin'))
            if 'require_approval' in request.data:
                school.require_approval = bool(request.data.get('require_approval'))
            if 'enrollment_locked' in request.data:
                school.enrollment_locked = bool(request.data.get('enrollment_locked'))
            if 'welcome_message' in request.data:
                school.welcome_message = str(request.data.get('welcome_message') or '').strip()[:300]
            if request.data.get('rotate_join_pin') or action == 'regenerate_join_code':
                school.join_code = f"{random.randint(100000, 999999)}"
            school.save()
            return Response({
                'status': 'success',
                'message': 'School security & enrollment settings updated.',
                'join_code': school.join_code,
                'require_join_pin': school.require_join_pin,
                'require_approval': school.require_approval,
                'enrollment_locked': school.enrollment_locked,
                'welcome_message': school.welcome_message,
            })

        # 2. Student Approval / Rejection / Batch Edit / Removal
        if action in ('student_status', 'approve_student', 'reject_student', 'remove_student', 'update_student_meta'):
            target_uid = request.data.get('user_id')
            new_status = (request.data.get('status') or '').strip().lower()
            if action == 'approve_student':
                new_status = UserProfile.PartnerStatus.APPROVED
            elif action == 'reject_student':
                new_status = UserProfile.PartnerStatus.REJECTED
            elif action == 'remove_student':
                new_status = 'remove'
            prof = UserProfile.objects.filter(user_id=target_uid, partner_school=school).first()
            if not prof:
                return Response({'detail': 'Student not found in this school.'}, status=status.HTTP_404_NOT_FOUND)

            if new_status == 'remove':
                prof.partner_school = None
                prof.partner_batch = ''
                prof.student_roll_or_id = ''
                prof.partner_status = UserProfile.PartnerStatus.APPROVED
                prof.save()
                return Response({'status': 'success', 'message': 'Student removed from school roster.'})

            if new_status in (
                UserProfile.PartnerStatus.APPROVED,
                UserProfile.PartnerStatus.PENDING,
                UserProfile.PartnerStatus.REJECTED,
            ):
                prof.partner_status = new_status
            if 'batch' in request.data:
                prof.partner_batch = str(request.data.get('batch') or '').strip()[:64]
            if 'student_roll_or_id' in request.data:
                prof.student_roll_or_id = str(request.data.get('student_roll_or_id') or '').strip()[:64]
            prof.save()
            return Response({'status': 'success', 'message': 'Student membership updated.'})

        if action in ('bulk_approve_pending', 'approve_all_pending'):
            updated = UserProfile.objects.filter(
                partner_school=school,
                partner_status=UserProfile.PartnerStatus.PENDING,
            ).update(partner_status=UserProfile.PartnerStatus.APPROVED)
            return Response({'status': 'success', 'message': f'Approved {updated} pending student(s).'})

        # 3. Assign / Schedule Mock Exam with Attendance PIN
        if action in ('create_assigned_exam', 'assign_exam'):
            test_id = request.data.get('test_id')
            test_obj = Test.objects.filter(pk=test_id).first()
            if not test_obj:
                return Response({'detail': 'Please select a valid mock test.'}, status=status.HTTP_400_BAD_REQUEST)
            title = str(
                request.data.get('title')
                or request.data.get('title_override')
                or test_obj.title
            ).strip()[:200]
            target_batch = str(request.data.get('target_batch') or '').strip()[:64]
            if target_batch.lower() == 'all':
                target_batch = ''
            require_pin = bool(request.data.get('require_pin', True))
            custom_pin = str(request.data.get('attendance_pin') or '').strip()[:12]
            if require_pin and not custom_pin:
                custom_pin = f"{random.randint(1000, 9999)}"
            scheduled_date_label = str(
                request.data.get('scheduled_date_label')
                or request.data.get('schedule_label')
                or ''
            ).strip()[:80]
            instructions = str(request.data.get('instructions') or '').strip()[:400]

            ae = PartnerAssignedExam.objects.create(
                school=school,
                test=test_obj,
                title=title,
                target_batch=target_batch,
                attendance_pin=custom_pin,
                require_pin=require_pin,
                scheduled_date_label=scheduled_date_label,
                instructions=instructions,
                is_active=True,
            )
            return Response({
                'status': 'success',
                'message': f"Assigned '{ae.title}' to {target_batch or 'All Batches'}!",
                'assigned_exam_id': ae.id,
                'attendance_pin': ae.attendance_pin,
                'assigned_exam': {
                    'id': ae.id,
                    'title': ae.title,
                    'attendance_pin': ae.attendance_pin,
                },
            }, status=status.HTTP_201_CREATED)

        if action == 'toggle_assigned_exam':
            exam_id = request.data.get('exam_id')
            ae = PartnerAssignedExam.objects.filter(pk=exam_id, school=school).first()
            if not ae:
                return Response({'detail': 'Assigned exam not found.'}, status=status.HTTP_404_NOT_FOUND)
            ae.is_active = not ae.is_active
            ae.save(update_fields=['is_active'])
            return Response({'status': 'success', 'is_active': ae.is_active})

        if action == 'rotate_exam_pin':
            exam_id = request.data.get('exam_id')
            ae = PartnerAssignedExam.objects.filter(pk=exam_id, school=school).first()
            if not ae:
                return Response({'detail': 'Assigned exam not found.'}, status=status.HTTP_404_NOT_FOUND)
            ae.attendance_pin = f"{random.randint(1000, 9999)}"
            ae.require_pin = True
            ae.save(update_fields=['attendance_pin', 'require_pin'])
            return Response({'status': 'success', 'attendance_pin': ae.attendance_pin})

        if action == 'delete_assigned_exam':
            exam_id = request.data.get('exam_id')
            PartnerAssignedExam.objects.filter(pk=exam_id, school=school).delete()
            return Response({'status': 'success', 'message': 'Assigned exam removed.'})

        # 4. Share Study Note / Library Material
        if action in ('create_study_note', 'create_note'):
            title = str(request.data.get('title') or '').strip()[:200]
            if not title:
                return Response({'detail': 'Study note title is required.'}, status=status.HTTP_400_BAD_REQUEST)
            category = str(request.data.get('category') or PartnerStudyNote.Category.VOCABULARY).strip()
            content = str(request.data.get('content') or '').strip()
            external_url = str(request.data.get('external_url') or '').strip()[:500]
            target_batch = str(request.data.get('target_batch') or '').strip()[:64]
            if target_batch.lower() == 'all':
                target_batch = ''
            is_pinned = bool(request.data.get('is_pinned', False))

            note = PartnerStudyNote.objects.create(
                school=school,
                title=title,
                category=category if category in dict(PartnerStudyNote.Category.choices) else PartnerStudyNote.Category.VOCABULARY,
                content=content,
                external_url=external_url,
                target_batch=target_batch,
                is_pinned=is_pinned,
            )
            return Response({'status': 'success', 'note_id': note.id, 'message': 'Study material shared with students!'}, status=status.HTTP_201_CREATED)

        if action in ('delete_study_note', 'delete_note'):
            note_id = request.data.get('note_id')
            PartnerStudyNote.objects.filter(pk=note_id, school=school).delete()
            return Response({'status': 'success', 'message': 'Study note deleted.'})

        # 5. Send School Notification / Announcement
        if action == 'create_notification':
            title = str(request.data.get('title') or '').strip()[:200]
            message = str(request.data.get('message') or '').strip()[:1500]
            if not title or not message:
                return Response({'detail': 'Notification title and message are required.'}, status=status.HTTP_400_BAD_REQUEST)
            priority = str(request.data.get('priority') or PartnerNotification.Priority.NORMAL).strip()
            target_batch = str(request.data.get('target_batch') or '').strip()[:64]
            if target_batch.lower() == 'all':
                target_batch = ''

            nf = PartnerNotification.objects.create(
                school=school,
                title=title,
                message=message,
                priority=priority if priority in dict(PartnerNotification.Priority.choices) else PartnerNotification.Priority.NORMAL,
                target_batch=target_batch,
                is_active=True,
            )
            return Response({'status': 'success', 'notification_id': nf.id, 'message': 'Notification broadcast to students!'}, status=status.HTTP_201_CREATED)

        if action == 'delete_notification':
            notification_id = request.data.get('notification_id')
            PartnerNotification.objects.filter(pk=notification_id, school=school).delete()
            return Response({'status': 'success', 'message': 'Notification deleted.'})

        return Response({'detail': f"Unknown management action '{action}'."}, status=status.HTTP_400_BAD_REQUEST)


class PartnerStudentClassroomAPIView(APIView):
    """
    Student Classroom Hub API (/api/partners/<slug>/classroom/).
    - GET: Returns the school's assigned exams, shared study notes, and notifications
      for an approved student of that school (or Sensei/staff). If the student is
      pending approval, withholds private classroom items and returns pending status.
    - POST: Verifies a 4-digit Live Attendance PIN ('verify_exam_pin') to mark attendance
      and unlock the assigned test, or records a study note view ('view_note').
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        school = get_object_or_404(PartnerSchool, slug=slug, is_active=True)
        is_sensei = _authorize_partner_school_sensei(request, school)

        user_batch = ''
        membership_status = 'none'
        if is_sensei:
            membership_status = 'approved'
        elif request.user and request.user.is_authenticated:
            prof = UserProfile.objects.filter(user=request.user, partner_school=school).first()
            if prof:
                membership_status = prof.partner_status or UserProfile.PartnerStatus.APPROVED
                user_batch = (prof.partner_batch or '').strip()

        if membership_status != UserProfile.PartnerStatus.APPROVED:
            return Response({
                'school': PartnerSchoolSummarySerializer(school).data,
                'membership_status': membership_status,
                'assigned_exams': [],
                'study_notes': [],
                'notifications': [],
            })

        batch_q = Q(target_batch='') | Q(target_batch__iexact='All Batches')
        if user_batch:
            batch_q = batch_q | Q(target_batch__iexact=user_batch)

        exams_qs = (
            PartnerAssignedExam.objects.filter(school=school, is_active=True)
            .filter(batch_q if not is_sensei else Q())
            .select_related('test')
            .order_by('-created_at')
        )
        user_id = request.user.id if (request.user and request.user.is_authenticated) else None
        completed_test_ids = (
            set(Attempt.objects.filter(user_id=user_id).values_list('test_id', flat=True))
            if user_id
            else set()
        )

        exams_data = []
        for ae in exams_qs:
            has_attended = (
                ae.attended_users.filter(id=user_id).exists() if user_id else False
            ) or (ae.test_id in completed_test_ids)
            exams_data.append({
                'id': ae.id,
                'test_id': ae.test_id,
                'test_title': ae.test.title if ae.test else 'Mock Test',
                'category': ae.test.category if ae.test else 'basic',
                'title': ae.title or (ae.test.title if ae.test else 'Assigned Exam'),
                'target_batch': ae.target_batch or 'All Batches',
                'require_pin': ae.require_pin,
                'instructions': ae.instructions,
                'scheduled_date_label': ae.scheduled_date_label or 'Assigned Practice',
                'schedule_label': ae.scheduled_date_label or 'Assigned Practice',
                'has_attended': has_attended,
                'has_completed': ae.test_id in completed_test_ids,
                'created_at': ae.created_at.isoformat() if ae.created_at else None,
            })

        notes_qs = (
            PartnerStudyNote.objects.filter(school=school)
            .filter(batch_q if not is_sensei else Q())
            .order_by('-is_pinned', '-created_at')
        )
        notes_data = [
            {
                'id': sn.id,
                'title': sn.title,
                'category': sn.category,
                'category_label': sn.get_category_display(),
                'content': sn.content,
                'external_url': sn.external_url,
                'target_batch': sn.target_batch or 'All Batches',
                'views_count': sn.views_count,
                'is_pinned': sn.is_pinned,
                'created_at': sn.created_at.isoformat() if sn.created_at else None,
            }
            for sn in notes_qs
        ]

        notifs_qs = (
            PartnerNotification.objects.filter(school=school, is_active=True)
            .filter(batch_q if not is_sensei else Q())
            .order_by('-created_at')[:15]
        )
        notifs_data = [
            {
                'id': nf.id,
                'title': nf.title,
                'message': nf.message,
                'priority': nf.priority,
                'priority_label': nf.get_priority_display(),
                'target_batch': nf.target_batch or 'All Batches',
                'created_at': nf.created_at.isoformat() if nf.created_at else None,
            }
            for nf in notifs_qs
        ]

        return Response({
            'school': PartnerSchoolSummarySerializer(school).data,
            'membership_status': 'approved',
            'user_batch': user_batch,
            'assigned_exams': exams_data,
            'study_notes': notes_data,
            'notifications': notifs_data,
        })

    def post(self, request, slug):
        school = get_object_or_404(PartnerSchool, slug=slug, is_active=True)
        action = (request.data.get('action') or '').strip().lower()

        if action == 'verify_exam_pin':
            exam_id = request.data.get('exam_id') or request.data.get('assigned_exam_id')
            provided_pin = str(request.data.get('pin') or '').strip()
            ae = get_object_or_404(PartnerAssignedExam.objects.select_related('test'), pk=exam_id, school=school, is_active=True)
            if ae.require_pin and ae.attendance_pin and provided_pin != ae.attendance_pin:
                return Response(
                    {'detail': 'Incorrect 4-digit Exam Room Attendance PIN. Please check the PIN displayed by your Sensei.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if request.user and request.user.is_authenticated:
                ae.attended_users.add(request.user)
            return Response({
                'status': 'verified',
                'test_id': ae.test_id,
                'category': ae.test.category if ae.test else 'basic',
                'test_category': ae.test.category if ae.test else 'basic',
                'message': 'Attendance verified! Launching exam...',
            })

        if action == 'view_note':
            note_id = request.data.get('note_id')
            PartnerStudyNote.objects.filter(pk=note_id, school=school).update(views_count=F('views_count') + 1)
            return Response({'status': 'ok'})

        return Response({'detail': 'Invalid classroom action.'}, status=status.HTTP_400_BAD_REQUEST)








from collections import OrderedDict, defaultdict
import json
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from tests.models import Test, Question, QuestionGroup, AnswerOption, Attempt
from accounts.models import UserProfile
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
    get_absolute_media_url,
)



def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class TestListAPIView(APIView):
    """Returns published tests for public, and all tests (including Drafts) for staff/admin."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        category = request.query_params.get('category')
        is_staff = bool(request.user.is_authenticated and request.user.is_staff)

        if is_staff:
            queryset = Test.objects.all().annotate(
                q_count=Count('questions', distinct=True)
            ).order_by('category', '-is_published', 'created_at')
        else:
            queryset = Test.objects.filter(is_published=True).annotate(
                q_count=Count('questions', distinct=True)
            ).order_by('category', 'created_at')

        if category:
            queryset = queryset.filter(category=category)

        tests_serialized = TestListSerializer(queryset, many=True, context={'request': request}).data

        # Grouping for landing page
        tests_by_category = {
            Test.Category.BASIC: [t for t in tests_serialized if t['category'] == Test.Category.BASIC],
            Test.Category.SKILL: [t for t in tests_serialized if t['category'] == Test.Category.SKILL],
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
            'tests_by_category': tests_by_category,
            'section_specs': section_specs,
        })


class TestDetailAPIView(APIView):
    """Returns single test details (allows draft preview for staff/admin)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        test = get_object_or_404(Test, pk=pk)

        if not test.is_published:
            if not (request.user.is_authenticated and request.user.is_staff):
                return Response(
                    {"detail": "This practice test is currently in Draft mode. Only staff/admin can preview it."},
                    status=status.HTTP_403_FORBIDDEN
                )

        serializer = TestDetailSerializer(test, context={'request': request})
        return Response(serializer.data)


class QuizDataAPIView(APIView):
    """Returns structured CBT quiz steps and questions (allows draft preview with ?preview=admin)."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        test = get_object_or_404(Test, pk=pk)

        preview_param = request.query_params.get('preview')
        is_preview = (preview_param in ['admin', 'true', 'staff', 'preview'] or bool(preview_param))

        # Draft Access Check: Allow if published OR if staff OR if preview parameter is provided
        if not test.is_published:
            is_staff = bool(request.user.is_authenticated and request.user.is_staff)
            if not (is_staff or is_preview):
                return Response(
                    {"detail": "This practice test is currently in Draft mode. Please publish it or preview from the admin panel."},
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
        test = get_object_or_404(Test, pk=pk)

        if not test.is_published:
            if not (request.user.is_authenticated and request.user.is_staff):
                return Response(
                    {"detail": "Cannot submit answers to a Draft test."},
                    status=status.HTTP_403_FORBIDDEN
                )

        if test.requires_account and not request.user.is_authenticated:
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

            if raw_val is not None and str(raw_val).isdigit():
                selected_option_id = int(raw_val)
                formatted_answers[q_key] = selected_option_id

                # Check correctness
                if correct_option_ids.get(question.id) == selected_option_id:
                    score += 1
            else:
                formatted_answers[q_key] = None

        user = request.user if request.user.is_authenticated else None
        attempt = Attempt.objects.create(
            test=test,
            user=user,
            score=score,
            total_questions=total_questions,
            answers=formatted_answers
        )

        return Response({
            'attempt_id': attempt.id,
            'score': score,
            'total_questions': total_questions,
            'message': 'Quiz submitted successfully!'
        }, status=status.HTTP_201_CREATED)


class AttemptResultsAPIView(APIView):
    """Returns official score report, scaled score, section breakdown, and review data."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        attempt = get_object_or_404(Attempt.objects.select_related('test', 'user'), pk=pk)
        test = attempt.test

        if test.requires_account:
            if not request.user.is_authenticated or attempt.user != request.user:
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
        section_breakdown = {
            'script_vocab': {'name_ja': '文字と語彙', 'name_en': 'Script and Vocabulary', 'correct': 0, 'total': 0, 'pct': 0},
            'conversation': {'name_ja': '会話と表現', 'name_en': 'Conversation and Expression', 'correct': 0, 'total': 0, 'pct': 0},
            'listening': {'name_ja': '聴解', 'name_en': 'Listening Comprehension', 'correct': 0, 'total': 0, 'pct': 0},
            'reading': {'name_ja': '読解', 'name_en': 'Reading Comprehension', 'correct': 0, 'total': 0, 'pct': 0},
        }

        for q_dict in questions_data:
            q_id = q_dict['id']
            sec = q_dict['section']
            selected_opt_id = attempt.answers.get(str(q_id))
            q_dict['selected_option_id'] = int(selected_opt_id) if selected_opt_id is not None else None

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
        passed = percentage >= 80.0
        stroke_dashoffset = 389 - (389 * percentage / 100)
        scaled_score = int(round(10 + (percentage / 100.0) * 240)) if attempt.total_questions > 0 else 10

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
        basic_tests = Test.objects.filter(is_published=True, category=Test.Category.BASIC).annotate(
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
        skill_tests = Test.objects.filter(is_published=True, category=Test.Category.SKILL).annotate(
            q_count=Count('questions', distinct=True)
        ).order_by('created_at')

        return Response({
            'ssw_info': ssw_info,
            'ssw_sectors': sectors,
            'test_centers': test_centers,
            'practice_tests': TestListSerializer(skill_tests, many=True, context={'request': request}).data,
        })


class RegisterAPIView(APIView):
    """Registers a new candidate and returns JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
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


def compute_leaderboard_candidates():
    attempts_qs = Attempt.objects.filter(user__isnull=False).select_related('user', 'user__profile')

    user_stats = defaultdict(lambda: {
        'user': None,
        'total_attempts': 0,
        'passed_attempts': 0,
        'scores': [],
        'highest_score': 0,
    })

    for att in attempts_qs:
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

    candidates_list = []
    for user_id, s in user_stats.items():
        u = s['user']
        scores = s['scores']
        avg_score = int(round(sum(scores) / len(scores))) if scores else 0
        pass_rate = int(round(s['passed_attempts'] / s['total_attempts'] * 100)) if s['total_attempts'] > 0 else 0
        
        profile = getattr(u, 'profile', None)
        full_name = f"{u.first_name} {u.last_name}".strip()

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


class LeaderboardAPIView(APIView):
    """
    Returns candidate leaderboard ranked by test performance:
    1. Tests Passed (count of passed attempts)
    2. Highest Scaled Score
    3. Average Scaled Score
    4. Total Attempts
    Splits into top_three podium and rankings for 4th onwards.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        candidates_list = compute_leaderboard_candidates()
        top_three = candidates_list[:3]
        rankings = candidates_list[3:50]

        current_user_rank = None
        if request.user.is_authenticated:
            for item in candidates_list:
                if item['user_id'] == request.user.id:
                    current_user_rank = item
                    break
            if current_user_rank is None:
                profile = getattr(request.user, 'profile', None)
                full_name = f"{request.user.first_name} {request.user.last_name}".strip()
                current_user_rank = {
                    'user_id': request.user.id,
                    'username': request.user.username,
                    'full_name': full_name if full_name else request.user.username,
                    'bio': profile.bio if profile else '',
                    'target_exam': profile.target_exam if profile else 'jft_basic',
                    'target_exam_display': profile.get_target_exam_display() if profile else 'JFT-Basic',
                    'japanese_level': profile.japanese_level if profile else 'n4',
                    'japanese_level_display': profile.get_japanese_level_display() if profile else 'N4',
                    'location': profile.location if profile else '',
                    'total_attempts': 0,
                    'passed_attempts': 0,
                    'highest_score': 0,
                    'avg_score': 0,
                    'pass_rate': 0,
                    'rank': None,
                }

        return Response({
            'total_candidates': len(candidates_list),
            'top_three': top_three,
            'rankings': rankings,
            'current_user_rank': current_user_rank,
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




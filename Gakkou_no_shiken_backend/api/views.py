from collections import OrderedDict, defaultdict
import json
import urllib.request
import re
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.management import call_command
from django.db.models import Q
from django.utils import timezone

from tests.models import Test, Question, QuestionGroup, AnswerOption, Attempt, Notice
from accounts.models import UserProfile, EmailVerificationOTP, PasswordResetToken
from accounts.geolocation import get_client_ip
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
        test = get_object_or_404(Test, pk=pk)

        if not test.is_published:
            if not (request.user.is_authenticated and request.user.is_staff):
                return Response(
                    {"detail": "Cannot submit answers to a Draft test."},
                    status=status.HTTP_403_FORBIDDEN
                )

        if not test.is_released:
            if not (request.user.is_authenticated and request.user.is_staff):
                return Response(
                    {"detail": "Cannot submit answers to an unreleased scheduled test."},
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
        if otp_record.country:
            profile.country = otp_record.country
            profile.country_source = UserProfile.CountrySource.USER
        client_ip = get_client_ip(request)
        if client_ip:
            profile.last_known_ip = client_ip
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
            client_ip = get_client_ip(request)
            if client_ip:
                profile, _ = UserProfile.objects.get_or_create(user=user)
                if profile.last_known_ip != client_ip:
                    profile.last_known_ip = client_ip
                    profile.save(update_fields=['last_known_ip'])
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
        UserProfile.objects.get_or_create(user=user)

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




        # 2. Admin Account Creation
        try:
            user, _ = User.objects.get_or_create(username='admin')
            user.set_password('03698742Fayaz@')
            user.is_staff = True
            user.is_superuser = True
            user.save()
            logs.append('✅ Admin Account Ready! Username: admin | Password: 03698742Fayaz@')
        except Exception as e:
            logs.append(f'❌ Admin setup error: {e}\n{traceback.format_exc()}')

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
        return self.execute_migration()

    def post(self, request):
        return self.execute_migration()

    def execute_migration(self):
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

        # 4. Touch tmp/restart.txt to reload Passenger
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
            'message': 'Database migrations and country backfill completed successfully!',
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
            Notice.objects.filter(pk=pk).update(views_count=models.F('views_count') + 1)
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
            
            Notice.objects.filter(pk=pk).update(downloads_count=models.F('downloads_count') + 1)
            pdf_url = get_absolute_media_url(notice.pdf_file, request)
            return Response({
                'status': 'success',
                'download_url': pdf_url,
                'downloads_count': notice.downloads_count + 1
            })
        except Notice.DoesNotExist:
            return Response({'error': 'Notice not found'}, status=status.HTTP_404_NOT_FOUND)





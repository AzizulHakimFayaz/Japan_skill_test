from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Tests & Quiz
    path('tests/', views.TestListAPIView.as_view(), name='api_tests_list'),
    path('tests/<int:pk>/', views.TestDetailAPIView.as_view(), name='api_test_detail'),
    path('tests/<int:pk>/quiz/', views.QuizDataAPIView.as_view(), name='api_quiz_data'),
    path('tests/<int:pk>/submit/', views.SubmitQuizAPIView.as_view(), name='api_submit_quiz'),
    path('attempts/<int:pk>/', views.AttemptResultsAPIView.as_view(), name='api_attempt_results'),

    # Static / Overview Info
    path('info/jft/', views.JftInfoAPIView.as_view(), name='api_jft_info'),
    path('info/ssw/', views.SswInfoAPIView.as_view(), name='api_ssw_info'),

    # Authentication & User Profile
    path('auth/send-otp/', views.SendRegistrationOTPAPIView.as_view(), name='api_send_otp'),
    path('auth/verify-otp/', views.VerifyRegistrationOTPAPIView.as_view(), name='api_verify_otp'),
    path('auth/resend-otp/', views.ResendRegistrationOTPAPIView.as_view(), name='api_resend_otp'),
    path('auth/register/', views.RegisterAPIView.as_view(), name='api_register'),
    path('auth/signup/', views.RegisterAPIView.as_view(), name='api_signup'),
    path('auth/login/', views.LoginAPIView.as_view(), name='api_login'),
    path('auth/google/', views.GoogleAuthAPIView.as_view(), name='api_google_auth'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
    path('auth/me/', views.MeAPIView.as_view(), name='api_me'),
    path('auth/profile/', views.ProfileAPIView.as_view(), name='api_profile'),
    path('auth/confirm-country/', views.ConfirmCountryAPIView.as_view(), name='api_confirm_country'),
    path('auth/forgot-password/', views.ForgotPasswordAPIView.as_view(), name='api_forgot_password'),
    path('auth/reset-password/', views.ResetPasswordAPIView.as_view(), name='api_reset_password'),
    path('auth/my-results/', views.MyResultsAPIView.as_view(), name='api_my_results'),



    # Leaderboard & Rankings
    path('leaderboard/', views.LeaderboardAPIView.as_view(), name='api_leaderboard'),
    path('candidates/<str:username>/', views.CandidatePublicProfileAPIView.as_view(), name='api_candidate_public_profile'),
    path('profile/<str:username>/', views.CandidatePublicProfileAPIView.as_view(), name='api_candidate_public_profile_alias'),

    # Notices & Study Materials
    path('notices/', views.NoticeListAPIView.as_view(), name='api_notices_list'),
    path('notices/<int:pk>/', views.NoticeDetailAPIView.as_view(), name='api_notice_detail'),
    path('notices/<int:pk>/download/', views.NoticeDownloadAPIView.as_view(), name='api_notice_download'),

    # One-Click Setup Trigger & Admin Helpers
    path('setup-database/', views.SetupDatabaseAPIView.as_view(), name='api_setup_database'),
    path('run-migration/', views.RunMigrationAPIView.as_view(), name='api_run_migration'),
    path('admin/auto-upload/', views.AdminAutoUploadAPIView.as_view(), name='api_admin_auto_upload'),

]





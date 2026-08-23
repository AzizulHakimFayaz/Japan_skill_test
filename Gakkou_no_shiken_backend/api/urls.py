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
    path('auth/register/', views.RegisterAPIView.as_view(), name='api_register'),
    path('auth/signup/', views.RegisterAPIView.as_view(), name='api_signup'),
    path('auth/login/', views.LoginAPIView.as_view(), name='api_login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='api_token_refresh'),
    path('auth/me/', views.MeAPIView.as_view(), name='api_me'),
    path('auth/my-results/', views.MyResultsAPIView.as_view(), name='api_my_results'),
]

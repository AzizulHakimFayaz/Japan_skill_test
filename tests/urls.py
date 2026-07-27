from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_page_view, name='landing_page'),
    path('jft-basic/', views.jft_basic_info_view, name='jft_basic_info'),
    path('ssw-skill-test/', views.ssw_skill_test_info_view, name='ssw_skill_test_info'),
    path('test/<int:pk>/', views.quiz_page_view, name='quiz_page'),
    path('test/<int:pk>/submit/', views.submit_quiz_view, name='submit_quiz'),
    path('attempt/<int:pk>/', views.attempt_results_view, name='attempt_results'),
]


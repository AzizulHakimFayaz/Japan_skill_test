from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('my-results/', views.my_results_view, name='my_results'),
    path('profile/', views.my_results_view, name='profile'),
]


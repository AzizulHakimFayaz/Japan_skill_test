"""
URL configuration for Gakkou no Shiken project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import RedirectView
from django.views.static import serve
from django.conf import settings
from django.http import HttpResponse
from api import views as api_views

def ads_txt_view(request):
    return HttpResponse("google.com, pub-8435487820435842, DIRECT, f08c47fec0942fa0\n", content_type="text/plain")

urlpatterns = [
    path('ads.txt', ads_txt_view, name='ads_txt'),
    path('favicon.ico', RedirectView.as_view(url='/static/img/logo.png', permanent=True)),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),

    # Direct auth endpoint routes at root level (support both /auth/... and /api/auth/...)
    path('auth/forgot-password', api_views.ForgotPasswordAPIView.as_view(), name='root_forgot_password_no_slash'),
    path('auth/forgot-password/', api_views.ForgotPasswordAPIView.as_view(), name='root_forgot_password'),
    path('auth/reset-password', api_views.ResetPasswordAPIView.as_view(), name='root_reset_password_no_slash'),
    path('auth/reset-password/', api_views.ResetPasswordAPIView.as_view(), name='root_reset_password'),
    path('auth/confirm-country', api_views.ConfirmCountryAPIView.as_view(), name='root_confirm_country_no_slash'),
    path('auth/confirm-country/', api_views.ConfirmCountryAPIView.as_view(), name='root_confirm_country'),

    # 1-Click browser migration trigger
    path('run-migration', api_views.RunMigrationAPIView.as_view(), name='root_run_migration_no_slash'),
    path('run-migration/', api_views.RunMigrationAPIView.as_view(), name='root_run_migration'),

    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),

    # Catch-all: Automatically forward any student pages to the live frontend
    re_path(r'^(?P<path>.*)$', RedirectView.as_view(url='https://www.gakkounoshiken.site/%(path)s', permanent=False)),
]



"""
URL configuration for Gakkou no Shiken project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import RedirectView
from django.views.static import serve
from django.conf import settings
from django.http import HttpResponse
from django.core.management import call_command
from django.contrib.auth.models import User

def run_setup_view(request):
    logs = ["=== 1. RUNNING DJANGO MIGRATIONS ==="]
    try:
        call_command('migrate', interactive=False)
        logs.append("MIGRATE: OK")
    except Exception as e:
        logs.append(f"MIGRATE ERROR: {e}")
        
    logs.append("\n=== 2. CREATING ADMIN SUPERUSER ===")
    try:
        user, _ = User.objects.get_or_create(username='admin')
        user.set_password('03698742Fayaz@')
        user.is_staff = True
        user.is_superuser = True
        user.save()
        logs.append("SUPERUSER: OK (admin / 03698742Fayaz@)")
    except Exception as e:
        logs.append(f"SUPERUSER ERROR: {e}")
        
    logs.append("\n=== ALL DONE! You can now log into /admin ===")
    return HttpResponse("\n".join(logs), content_type="text/plain")

urlpatterns = [
    # One-Click Setup Endpoint
    path('setup-db/', run_setup_view),

    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', RedirectView.as_view(url='/admin/', permanent=False)),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
]

import os
import sys
import traceback

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Explicitly ensure virtualenv site-packages is available
venv_site_packages = '/home/gakkouno/virtualenv/backend/3.11/lib/python3.11/site-packages'
if os.path.exists(venv_site_packages) and venv_site_packages not in sys.path:
    sys.path.insert(0, venv_site_packages)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()

    # Self-healing schema sync & database tables
    try:
        from accounts.schema_sync import ensure_schema_synced
        ensure_schema_synced()
    except Exception:
        pass

    # Automatically run migrations on startup if pending
    try:
        from django.core.management import call_command
        call_command('migrate', interactive=False)
    except Exception:
        pass

    # Ensure superuser exists if configured via environment variable
    try:
        from django.contrib.auth.models import User
        if not User.objects.filter(is_superuser=True).exists():
            admin_pwd = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
            if admin_pwd:
                User.objects.create_superuser('admin', 'admin@example.com', admin_pwd)
    except Exception:
        pass

except Exception as e:
    err_msg = traceback.format_exc()
    def application(environ, start_response):
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [f"=== WSGI Startup Error ===\n\n{err_msg}".encode('utf-8')]




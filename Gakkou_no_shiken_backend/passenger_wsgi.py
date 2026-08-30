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

    # Automatically ensure audio_script columns exist in SQLite database on startup
    from django.db import connection
    with connection.cursor() as cursor:
        try:
            cursor.execute("ALTER TABLE tests_question ADD COLUMN audio_script text DEFAULT ''")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE tests_questiongroup ADD COLUMN audio_script text DEFAULT ''")
        except Exception:
            pass
except Exception as e:
    err_msg = traceback.format_exc()
    def application(environ, start_response):
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [f"=== WSGI Startup Error ===\n\n{err_msg}".encode('utf-8')]




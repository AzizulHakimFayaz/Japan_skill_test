import os
import sys

# Add application directory to python path
sys.path.insert(0, os.path.dirname(__file__))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Auto-setup: Automatically run migrations and load backup data on first hit
try:
    import django
    django.setup()
    from django.core.management import call_command
    from django.db import connection

    tables = connection.introspection.table_names()
    if 'tests_test' not in tables:
        call_command('migrate', interactive=False)
        backup_file = os.path.join(os.path.dirname(__file__), 'full_database_backup.json')
        if os.path.exists(backup_file):
            try:
                call_command('loaddata', backup_file)
            except Exception as load_err:
                pass
except Exception as e:
    try:
        with open(os.path.join(os.path.dirname(__file__), 'startup_log.txt'), 'w') as f:
            f.write(f"Startup log: {e}\n")
    except Exception:
        pass

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

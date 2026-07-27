import os
import sys
import shutil

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Copy db.sqlite3 to writable /tmp directory on Vercel serverless execution
db_src = os.path.join(base_dir, 'db.sqlite3')
db_dst = '/tmp/db.sqlite3'

if os.environ.get('VERCEL') or os.environ.get('VERCEL_ENV'):
    if os.path.exists(db_src) and not os.path.exists(db_dst):
        try:
            shutil.copyfile(db_src, db_dst)
        except Exception as e:
            print("DB Copy Exception:", e)

from django.core.wsgi import get_wsgi_application

app = get_wsgi_application()
handler = app

# Ensure database tables exist (fallback only for ephemeral SQLite)
if (os.environ.get('VERCEL') or os.environ.get('VERCEL_ENV')) and not os.environ.get('DATABASE_URL'):
    try:
        from django.core.management import call_command
        call_command('migrate', interactive=False, verbosity=0)
    except Exception as e:
        print("Migrate Exception:", e)


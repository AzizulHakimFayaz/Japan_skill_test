import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

username = sys.argv[1] if len(sys.argv) > 1 else 'admin'
password = sys.argv[2] if len(sys.argv) > 2 else os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if not password:
    import getpass
    password = getpass.getpass(f"Enter password for superuser '{username}': ")

user, created = User.objects.get_or_create(username=username)
user.set_password(password)
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.save()

print(f"✅ Superuser '{username}' credentials updated successfully (is_staff=True, is_active=True, is_superuser=True)!")

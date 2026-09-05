import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User

# Ensure admin account exists with your chosen password
user, created = User.objects.get_or_create(username='admin')
user.set_password('admin12345')
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.save()
print("✅ Admin credentials set successfully!")
print("Username: admin")
print("Password: admin12345")

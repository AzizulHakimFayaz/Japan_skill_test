"""
Test the CSV import POST locally via Django test client to catch the exact error.
"""
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.contrib.auth.models import User

client = Client()

# Login
user = User.objects.get(username='admin')
client.force_login(user)

# GET the import-csv page first
resp = client.get('/admin/tests/test/import-csv/')
print(f"GET /admin/tests/test/import-csv/ -> {resp.status_code}")

# Now POST with the CSV file
from django.core.files.uploadedfile import SimpleUploadedFile

with open('import_mocktest1.csv', 'rb') as f:
    csv_content = f.read()

csv_file = SimpleUploadedFile('mock1.csv', csv_content, content_type='text/csv')

try:
    resp = client.post('/admin/tests/test/import-csv/', {
        'test_id': '5',
        'csv_file': csv_file,
    })
    print(f"POST /admin/tests/test/import-csv/ -> {resp.status_code}")
    if resp.status_code == 302:
        print(f"  Redirect to: {resp.url}")
        print("  SUCCESS! CSV import worked.")
    elif resp.status_code == 200:
        # Check for error/success messages in context
        if hasattr(resp, 'context') and resp.context and 'messages' in resp.context:
            for msg in resp.context['messages']:
                print(f"  Message [{msg.tags}]: {msg}")
        else:
            # Check response content
            content = resp.content.decode('utf-8', errors='replace')
            if 'Internal Server Error' in content:
                print("  ERROR: Internal Server Error in response body")
            elif 'Successfully imported' in content:
                print("  SUCCESS message found in response body")
            else:
                print(f"  Response body snippet: {content[:500]}")
    else:
        content = resp.content.decode('utf-8', errors='replace')
        print(f"  Unexpected status. Body: {content[:500]}")
except Exception as e:
    import traceback
    print(f"EXCEPTION during POST:")
    traceback.print_exc()

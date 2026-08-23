import urllib.request
import urllib.parse
import http.cookiejar
import re

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

# 1. Login
res = opener.open('https://japanskilltest-production.up.railway.app/admin/login/')
html = res.read().decode('utf-8')
csrf = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', html).group(1)

login_payload = urllib.parse.urlencode({
    'username': 'admin',
    'password': 'admin12345',
    'csrfmiddlewaretoken': csrf,
    'next': '/admin/'
}).encode('utf-8')

req = urllib.request.Request('https://japanskilltest-production.up.railway.app/admin/login/', data=login_payload, headers={'Referer': 'https://japanskilltest-production.up.railway.app/admin/login/'})
res = opener.open(req)
print("Login HTTP status:", res.status, "URL:", res.geturl())

# 2. Get import-csv page
req = urllib.request.Request('https://japanskilltest-production.up.railway.app/admin/tests/test/import-csv/')
res = opener.open(req)
print("CSV Page GET status:", res.status)
html = res.read().decode('utf-8')
csrf_import = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', html).group(1)

# 3. Post multipart CSV
with open('import_mocktest1.csv', 'rb') as f:
    csv_bytes = f.read()

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = []
body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="csrfmiddlewaretoken"\r\n\r\n{csrf_import}\r\n'.encode('utf-8'))
body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="test_id"\r\n\r\n4\r\n'.encode('utf-8'))
body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="clear_existing"\r\n\r\ntrue\r\n'.encode('utf-8'))
body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="csv_file"; filename="mock1.csv"\r\nContent-Type: text/csv\r\n\r\n'.encode('utf-8') + csv_bytes + b'\r\n')
body.append(f'--{boundary}--\r\n'.encode('utf-8'))
payload = b''.join(body)

req = urllib.request.Request(
    'https://japanskilltest-production.up.railway.app/admin/tests/test/import-csv/',
    data=payload,
    headers={
        'Content-Type': f'multipart/form-data; boundary={boundary}',
        'Referer': 'https://japanskilltest-production.up.railway.app/admin/tests/test/import-csv/'
    }
)

try:
    res = opener.open(req)
    print("POST Upload HTTP status:", res.status, "URL:", res.geturl())
    resp_text = res.read().decode('utf-8')
    if "Successfully imported" in resp_text:
        print("SUCCESS: 45 questions imported via web form!")
    else:
        print("Response title/content snippet:", resp_text[:400])
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} - {e.reason}")
    print("Error Body:", e.read().decode('utf-8')[:500])

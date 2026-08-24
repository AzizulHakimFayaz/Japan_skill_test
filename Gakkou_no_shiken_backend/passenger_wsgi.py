import os
import sys
import traceback

sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    from django.core.wsgi import get_wsgi_application
    _application = get_wsgi_application()

    def application(environ, start_response):
        try:
            return _application(environ, start_response)
        except Exception:
            status = '500 Internal Server Error'
            output = f"<h1>Django Request Error</h1><pre>{traceback.format_exc()}</pre>".encode('utf-8')
            response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Content-Length', str(len(output)))]
            start_response(status, response_headers)
            return [output]

except Exception as err:
    tb = traceback.format_exc()
    error_msg = f"<h1>Django WSGI Startup Error</h1><h3>{type(err).__name__}: {err}</h3><pre style='background:#1e1e1e;color:#ff6b6b;padding:20px;border-radius:10px;font-size:14px;white-space:pre-wrap;'>{tb}</pre>"
    def application(environ, start_response):
        status = '500 Internal Server Error'
        output = error_msg.encode('utf-8')
        response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output]

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
            response_headers = [('Content-type', 'text/html'), ('Content-Length', str(len(output)))]
            start_response(status, response_headers)
            return [output]

except Exception:
    def application(environ, start_response):
        status = '500 Internal Server Error'
        output = f"<h1>Django WSGI Startup Error</h1><pre>{traceback.format_exc()}</pre>".encode('utf-8')
        response_headers = [('Content-type', 'text/html'), ('Content-Length', str(len(output)))]
        start_response(status, response_headers)
        return [output]


from django.utils import timezone
from django.contrib.auth.models import User
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication for /api/ endpoints without CSRF enforcement.
    Prevents 403 Forbidden (CSRF Failed) when an admin or user has an active
    Django session cookie in the browser while making cross-origin REST API POST calls.
    """
    def enforce_csrf(self, request):
        return


class FlexibleJWTAuthentication(JWTAuthentication):
    """
    Resilient JWT authentication for cPanel / Apache / LiteSpeed WSGI environments
    where standard `HTTP_AUTHORIZATION` headers are sometimes stripped by Apache.
    Accepts JWT access token from:
      1. Standard `Authorization: Bearer <token>` (`HTTP_AUTHORIZATION`)
      2. Apache rewrite `REDIRECT_HTTP_AUTHORIZATION`
      3. Custom `X-Auth-Token: <token>` (`HTTP_X_AUTH_TOKEN`)
      4. Query param `?auth_token=<token>` or JSON body `{"auth_token": "<token>"}`
    """
    def authenticate(self, request):
        raw_token = None
        header = self.get_header(request)
        if header is not None:
            raw_token = self.get_raw_token(header)

        if not raw_token:
            redirect_auth = request.META.get('REDIRECT_HTTP_AUTHORIZATION', '')
            if redirect_auth and redirect_auth.lower().startswith('bearer '):
                raw_token = redirect_auth.split(' ', 1)[1].strip()

        if not raw_token:
            x_token = request.META.get('HTTP_X_AUTH_TOKEN', '').strip()
            if x_token:
                raw_token = x_token.split(' ', 1)[1].strip() if x_token.lower().startswith('bearer ') else x_token

        if not raw_token:
            raw_token = (request.query_params.get('auth_token') or '').strip()

        if not raw_token and hasattr(request, 'data') and isinstance(request.data, dict):
            raw_token = str(request.data.get('auth_token') or '').strip()

        if not raw_token:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError, Exception):
            return None



class ActiveUserTrackingMiddleware:
    """
    Lightweight middleware that tracks real-time candidate and administrator activity.
    Updates last_login when an authenticated user performs actions, throttled to at most
    once every 5 minutes (300 seconds) per user to ensure zero database/performance overhead.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            # Check request.user (Django session) or request._request.user (DRF JWT)
            user = getattr(request, 'user', None)
            if (not user or not getattr(user, 'is_authenticated', False)) and hasattr(request, '_request'):
                user = getattr(request._request, 'user', None)

            if user and getattr(user, 'is_authenticated', False) and getattr(user, 'pk', None):
                now = timezone.now()
                last_login = getattr(user, 'last_login', None)
                # If last_login is not set or was more than 5 minutes ago, update it
                if not last_login or (now - last_login).total_seconds() > 300:
                    User.objects.filter(pk=user.pk).update(last_login=now)
        except Exception:
            # Non-blocking: never interrupt request lifecycle for analytics tracking
            pass

        return response

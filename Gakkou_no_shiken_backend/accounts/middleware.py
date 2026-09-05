from django.utils import timezone
from django.contrib.auth.models import User


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

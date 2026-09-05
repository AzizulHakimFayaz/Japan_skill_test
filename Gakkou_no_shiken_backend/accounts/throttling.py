from rest_framework.throttling import AnonRateThrottle
from django.core.cache import cache


class ForgotPasswordRateThrottle(AnonRateThrottle):
    """
    IP-level throttle for forgot-password endpoint.
    Limits spam requests to 10 attempts per hour per IP.
    """
    scope = 'forgot_password'
    rate = '10/hour'

    def get_cache_key(self, request, view):
        from .geolocation import get_client_ip
        ip = get_client_ip(request) or self.get_ident(request)
        return f"throttle_forgot_password_ip_{ip}"


def is_email_rate_limited(email: str, max_attempts: int = 3, window_seconds: int = 900) -> bool:
    """
    Prevents mailbox spamming / harassment by checking how many reset emails
    have been dispatched to a specific email within the time window (default 3 per 15 mins).
    Returns True if limit is exceeded, False otherwise.
    """
    if not email:
        return False

    clean_email = email.strip().lower()
    cache_key = f"rate_limit_reset_email_{clean_email}"
    attempts = cache.get(cache_key, 0)

    if attempts >= max_attempts:
        return True

    # Increment counter
    cache.set(cache_key, attempts + 1, timeout=window_seconds)
    return False

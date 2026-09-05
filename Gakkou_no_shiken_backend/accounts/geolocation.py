import ipaddress
import json
import urllib.request
from typing import Optional
from django.core.cache import cache


def get_client_ip(request) -> Optional[str]:
    """
    Extracts the true client IP address from the Django request,
    prioritizing standard reverse-proxy headers (Cloudflare, Nginx, Railway, LiteSpeed).
    """
    if not request:
        return None

    # 1. Cloudflare Connecting IP
    cf_ip = request.META.get('HTTP_CF_CONNECTING_IP')
    if cf_ip:
        ip = cf_ip.split(',')[0].strip()
        if _is_valid_ip(ip):
            return ip

    # 2. X-Real-IP
    real_ip = request.META.get('HTTP_X_REAL_IP')
    if real_ip:
        ip = real_ip.split(',')[0].strip()
        if _is_valid_ip(ip):
            return ip

    # 3. X-Forwarded-For (can be a comma-separated list of hops)
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        parts = [p.strip() for p in x_forwarded.split(',') if p.strip()]
        for part in parts:
            if _is_valid_ip(part) and not is_private_or_loopback(part):
                return part
        # If all were private or single, return the first valid
        if parts and _is_valid_ip(parts[0]):
            return parts[0]

    # 4. REMOTE_ADDR
    remote_addr = request.META.get('REMOTE_ADDR')
    if remote_addr:
        ip = remote_addr.split(',')[0].strip()
        if _is_valid_ip(ip):
            return ip

    return None


def _is_valid_ip(ip: str) -> bool:
    """Returns True if string is a valid IPv4 or IPv6 address."""
    try:
        ipaddress.ip_address(ip)
        return True
    except (ValueError, AttributeError):
        return False


def is_private_or_loopback(ip: str) -> bool:
    """Returns True if IP is private (192.168.x, 10.x, 172.16.x), loopback (127.0.0.1, ::1), or reserved."""
    try:
        obj = ipaddress.ip_address(ip)
        return obj.is_private or obj.is_loopback or obj.is_reserved or obj.is_link_local
    except (ValueError, AttributeError):
        return True


def lookup_ip_country(ip_address: Optional[str], timeout: int = 3) -> Optional[str]:
    """
    Estimates the country of residence from an IP address using reliable public geolocation APIs.
    Results are cached in Django cache for 24 hours to prevent repeated external network calls.
    Returns country name string (e.g. 'Bangladesh', 'Japan') or None if lookup fails/private.
    """
    if not ip_address or not _is_valid_ip(ip_address) or is_private_or_loopback(ip_address):
        return None

    cache_key = f"ip_country_v1_{ip_address}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached if cached != "" else None

    detected_country = None

    # Primary Service: ip-api.com (free, 45 req/min, JSON)
    try:
        url = f"http://ip-api.com/json/{ip_address}?fields=status,country"
        req = urllib.request.Request(url, headers={'User-Agent': 'GakkouNoShiken/1.0'})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('status') == 'success' and data.get('country'):
                detected_country = data.get('country').strip()
    except Exception:
        # Fallback Service: ipapi.co
        try:
            url = f"https://ipapi.co/{ip_address}/country_name/"
            req = urllib.request.Request(url, headers={'User-Agent': 'GakkouNoShiken/1.0'})
            with urllib.request.urlopen(req, timeout=timeout) as response:
                country_text = response.read().decode('utf-8').strip()
                if country_text and 'error' not in country_text.lower() and '<' not in country_text:
                    detected_country = country_text
        except Exception:
            detected_country = None

    # Cache the result (or empty string if not found) for 24 hours
    cache.set(cache_key, detected_country or "", timeout=86400)
    return detected_country

import ipaddress
import json
import urllib.request
from typing import Optional
from django.core.cache import cache

ISO_TO_COUNTRY = {
    'BD': 'Bangladesh',
    'NP': 'Nepal',
    'VN': 'Vietnam',
    'ID': 'Indonesia',
    'JP': 'Japan',
    'IN': 'India',
    'MM': 'Myanmar',
    'LK': 'Sri Lanka',
    'PH': 'Philippines',
    'PK': 'Pakistan',
    'UZ': 'Uzbekistan',
    'MN': 'Mongolia',
    'KH': 'Cambodia',
    'TH': 'Thailand',
    'CN': 'China',
    'BR': 'Brazil',
    'PE': 'Peru',
    'US': 'United States',
    'GB': 'United Kingdom',
    'MY': 'Malaysia',
    'KR': 'South Korea',
}

COUNTRY_CANONICAL_NAMES = {
    'viet nam': 'Vietnam',
    'myanmar (burma)': 'Myanmar',
    'burma': 'Myanmar',
    'philippines (the)': 'Philippines',
    'korea, republic of': 'South Korea',
    'korea (south)': 'South Korea',
}


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
        if _is_valid_ip(ip) and not is_private_or_loopback(ip):
            return ip

    # 2. Akamai / True-Client-IP
    true_ip = request.META.get('HTTP_TRUE_CLIENT_IP')
    if true_ip:
        ip = true_ip.split(',')[0].strip()
        if _is_valid_ip(ip) and not is_private_or_loopback(ip):
            return ip

    # 3. X-Real-IP (Nginx, LiteSpeed, Reverse Proxies)
    real_ip = request.META.get('HTTP_X_REAL_IP')
    if real_ip:
        ip = real_ip.split(',')[0].strip()
        if _is_valid_ip(ip) and not is_private_or_loopback(ip):
            return ip

    # 4. X-Forwarded-For (can be a comma-separated list of hops: client, proxy1, proxy2)
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        parts = [p.strip() for p in x_forwarded.split(',') if p.strip()]
        for part in parts:
            if _is_valid_ip(part) and not is_private_or_loopback(part):
                return part
        # If all were private or single, return the first valid
        if parts and _is_valid_ip(parts[0]):
            return parts[0]

    # 5. Client-IP header
    client_ip = request.META.get('HTTP_CLIENT_IP')
    if client_ip:
        ip = client_ip.split(',')[0].strip()
        if _is_valid_ip(ip) and not is_private_or_loopback(ip):
            return ip

    # 6. Fallback: REMOTE_ADDR (direct connection)
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


def normalize_country_name(country: Optional[str]) -> Optional[str]:
    """Normalizes country string to standard format."""
    if not country:
        return None
    c = country.strip()
    return COUNTRY_CANONICAL_NAMES.get(c.lower(), c)


def lookup_ip_country(ip_address: Optional[str], timeout: int = 3) -> Optional[str]:
    """
    Estimates the country of residence from an IP address using multiple reliable public geolocation APIs.
    Results are cached in Django cache for 24 hours to prevent repeated external network calls.
    Returns standard country name (e.g. 'Bangladesh', 'Nepal', 'Japan') or None.
    """
    if not ip_address or not _is_valid_ip(ip_address) or is_private_or_loopback(ip_address):
        return None

    cache_key = f"ip_country_v3_{ip_address}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached if cached != "" else None

    detected_country = None

    # Service 1: ip-api.com (free, high accuracy, JSON)
    try:
        url = f"http://ip-api.com/json/{ip_address}?fields=status,country,countryCode"
        req = urllib.request.Request(url, headers={'User-Agent': 'GakkouNoShiken/1.0'})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data.get('status') == 'success' and data.get('country'):
                detected_country = data.get('country').strip()
    except Exception:
        pass

    # Service 2 (Fallback): ipwho.is (HTTPS, free, high reliability)
    if not detected_country:
        try:
            url = f"https://ipwho.is/{ip_address}"
            req = urllib.request.Request(url, headers={'User-Agent': 'GakkouNoShiken/1.0'})
            with urllib.request.urlopen(req, timeout=timeout) as response:
                data = json.loads(response.read().decode('utf-8'))
                if data.get('success') and data.get('country'):
                    detected_country = data.get('country').strip()
        except Exception:
            pass

    # Service 3 (Fallback): country.is (HTTPS, ultra-fast, returns 2-letter ISO code)
    if not detected_country:
        try:
            url = f"https://api.country.is/{ip_address}"
            req = urllib.request.Request(url, headers={'User-Agent': 'GakkouNoShiken/1.0'})
            with urllib.request.urlopen(req, timeout=timeout) as response:
                data = json.loads(response.read().decode('utf-8'))
                code = data.get('country')
                if code and code in ISO_TO_COUNTRY:
                    detected_country = ISO_TO_COUNTRY[code]
        except Exception:
            pass

    detected_country = normalize_country_name(detected_country)

    # Cache the result (or empty string if not found) for 24 hours
    cache.set(cache_key, detected_country or "", timeout=86400)
    return detected_country

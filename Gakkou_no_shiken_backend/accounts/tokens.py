import hashlib
import secrets
from typing import Tuple


def generate_password_reset_token() -> Tuple[str, str]:
    """
    Generates a cryptographically random URL-safe token and its SHA-256 hash.
    Returns:
        tuple (raw_token, token_hash)
    """
    raw_token = secrets.token_urlsafe(32)
    token_hash = hash_token(raw_token)
    return raw_token, token_hash


def hash_token(raw_token: str) -> str:
    """Computes SHA-256 hex digest of a raw token string."""
    if not raw_token:
        return ""
    return hashlib.sha256(raw_token.strip().encode('utf-8')).hexdigest()


def is_valid_token_format(raw_token: str) -> bool:
    """Verifies that the token string is not empty and reasonably formed."""
    if not raw_token or not isinstance(raw_token, str):
        return False
    cleaned = raw_token.strip()
    return 20 <= len(cleaned) <= 128

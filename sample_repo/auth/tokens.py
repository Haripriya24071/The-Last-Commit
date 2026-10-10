"""
Decoy Clean File: Safe session token helpers.
"""
import uuid
import time

def generate_session_token() -> str:
    """Generates a secure UUID session identifier."""
    return f"sess_{uuid.uuid4().hex}"

def is_token_expired(created_at: float, ttl_seconds: int = 3600) -> bool:
    """Checks if a session timestamp has surpassed the TTL."""
    return (time.time() - created_at) > ttl_seconds

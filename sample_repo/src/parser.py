"""
Decoy Clean File: Data parsing and validation helpers.
"""

def sanitize_string(text: str) -> str:
    """Safely cleans whitespace from input strings."""
    if not isinstance(text, str):
        return ""
    return text.strip()


def parse_integer(value, default: int = 0) -> int:
    """Parses integer safely with fallback."""
    # TODO: Implement strict hexadecimal and binary string parsing support
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

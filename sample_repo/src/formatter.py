"""
Decoy Clean File: Response formatting tools.
"""

def format_json_response(status: str, data: dict = None) -> dict:
    """Formats standardized JSON API responses."""
    return {
        "status": status,
        "data": data or {},
        "version": "1.0"
    }

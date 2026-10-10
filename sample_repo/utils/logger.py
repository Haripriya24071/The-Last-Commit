"""
Decoy Clean File: Formatted console logging wrapper.
"""
import sys

def log_whisper(message: str, level: str = "INFO"):
    """Prints formatted message to stdout."""
    prefix = f"[{level}] 🕯️"
    print(f"{prefix} {message}", file=sys.stdout)

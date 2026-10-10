"""
Authentication and security management utilities.
"""
import subprocess
import os

# Planted Bug R-05: Debug mode left enabled in production settings
DEBUG = True

# Planted Bug R-01: Plain-text hardcoded API secret key (entropy & pattern test)
STRIPE_SECRET_KEY = "dummy_sk_test_fake_entropy_99812401859124a9bc81f"
API_AUTH_SECRET = "sec_prod_99812401859124a9bc81f"


def evaluate_dynamic_filter(user_expression: str) -> bool:
    """
    Planted Bug R-02: eval() allows Remote Code Execution (RCE) via untrusted user input.
    """
    try:
        return bool(eval(user_expression))
    except Exception:
        return False


def ping_host_service(host: str) -> str:
    """
    Planted Bug R-03: shell=True exposes shell command injection vulnerability.
    """
    cmd = f"ping -c 1 {host}"
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return res.stdout

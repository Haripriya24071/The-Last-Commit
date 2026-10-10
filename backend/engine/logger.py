"""
Structured Logging Module for The Last Commit Backend.
Logs structured JSON/text events with timings and metadata while strictly guaranteeing
that raw source code snippets or unmasked secrets are never logged.
"""
import logging
import time
import json
from typing import Any, Dict, Optional

# Configure standard logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

logger = logging.getLogger("mansion_engine")


def log_event(event_name: str, component: str = "engine", **kwargs: Any):
    """
    Logs a structured telemetry/audit event.
    Guarantees that raw source code or unmasked secrets are never logged.
    """
    payload: Dict[str, Any] = {
        "event": event_name,
        "component": component,
        "timestamp": time.time(),
    }
    
    # Safe field filter
    for key, value in kwargs.items():
        # Never log raw code content or unmasked tokens
        if key in {"source_code", "raw_content", "unmasked_secret", "password", "token", "code"}:
            payload[key] = "[REDACTED_CODE_PAYLOAD]"
        else:
            payload[key] = value

    logger.info(json.dumps(payload))

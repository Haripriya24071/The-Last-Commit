"""
Offline Local Cache for Cursed Sample House.
Ensures zero-network reliability during the live audition demo.
"""
import json
from pathlib import Path
from typing import Dict, Any, Optional
from detectors.base import RoleType
from .ingester import SAMPLE_REPO_PATH
from .game_session import game_sessions

CACHE_DIR = Path(__file__).resolve().parent.parent / "cache"
CACHE_FILE = CACHE_DIR / "sample_cache.json"


def generate_and_save_sample_cache() -> Dict[str, Any]:
    """Generates pre-computed scan sessions for the sample repo for all 3 roles and caches to disk."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_payload = {}

    if not SAMPLE_REPO_PATH.exists():
        return cache_payload

    for role in [RoleType.GHOST, RoleType.REAPER, RoleType.SKELETON]:
        session = game_sessions.create_session(
            repo_path=SAMPLE_REPO_PATH,
            repo_target="sample",
            role=role
        )
        cache_payload[role.value] = {
            "scan_id": session.scan_id,
            "role": role.value,
            "rooms_public": session.rooms_public,
            "rooms_server_truth": session.rooms_server_truth,
            "findings": [f.model_dump() for f in session.findings],
            "is_suspiciously_clean": session.is_suspiciously_clean
        }

    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(cache_payload, f, indent=2)

    return cache_payload


def load_sample_cache() -> Optional[Dict[str, Any]]:
    """Loads offline sample repo cache if present."""
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return None

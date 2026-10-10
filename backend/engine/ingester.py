"""
Repository Ingestion Safeguards.
Handles shallow git clones (--depth 50), repo size limits, and safe sandbox cleanup.
"""
import os
import re
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Tuple, Optional

# Safety thresholds
MAX_REPO_SIZE_MB = 150  # Only reject truly massive repositories
CLONE_TIMEOUT_SECONDS = 20

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SAMPLE_REPO_PATH = REPO_ROOT / "sample_repo"

GITHUB_URL_PATTERN = re.compile(
    r"""^(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+?)(?:\.git)?(?:/.*)?$"""
)


def parse_github_url(url: str) -> Optional[Tuple[str, str, str]]:
    """
    Validates that a URL matches github.com/{owner}/{repo}.
    Returns: (owner, repo_name, canonical_clone_url) or None
    """
    match = GITHUB_URL_PATTERN.match(url.strip())
    if not match:
        return None
    owner, repo = match.group(1), match.group(2)
    canonical = f"https://github.com/{owner}/{repo}.git"
    return owner, repo, canonical


def check_github_repo_size_api(owner: str, repo: str) -> Optional[int]:
    """
    Attempts a lightweight check of repository size (in KB) via GitHub API.
    Returns size in KB or None if rate limited / offline.
    """
    try:
        import httpx
        url = f"https://api.github.com/repos/{owner}/{repo}"
        headers = {"User-Agent": "The-Last-Commit-Scanner/2.0"}
        res = httpx.get(url, headers=headers, timeout=3.0)
        if res.status_code == 200:
            data = res.json()
            return data.get("size", 0)  # Size in KB
    except Exception:
        pass
    return None


def ingest_repository(repo_target: str) -> Tuple[Path, bool, Optional[str]]:
    """
    Ingests a repository for scanning.
    Returns: (repo_path, is_temp, fallback_reason)
    """
    target_clean = (repo_target or "").strip()

    # 1. Handle Built-in Cursed Sample House explicitly
    if target_clean.lower() in {"", "sample", "sample_repo", "cursed", "default", "the cursed house"}:
        if SAMPLE_REPO_PATH.exists():
            return SAMPLE_REPO_PATH, False, None
        return Path("sample_repo"), False, None

    # 2. Local folder path
    local_path = Path(target_clean)
    if local_path.exists() and local_path.is_dir():
        return local_path, False, None

    # 3. Validate GitHub repository URL pattern
    parsed = parse_github_url(target_clean)
    if not parsed:
        reason = f"Repository URL must match 'https://github.com/owner/repo'. Provided: '{target_clean}'"
        return SAMPLE_REPO_PATH, False, reason

    owner, repo_name, canonical_clone_url = parsed

    # 4. Optional Pre-check via GitHub API
    size_kb = check_github_repo_size_api(owner, repo_name)
    if size_kb is not None:
        size_mb = size_kb / 1024
        if size_mb > MAX_REPO_SIZE_MB:
            reason = f"Repository is too massive ({size_mb:.1f} MB exceeds {MAX_REPO_SIZE_MB} MB limit)."
            return SAMPLE_REPO_PATH, False, reason

    # 5. Clone repository with --depth 50
    temp_id = f"mansion_clone_{uuid.uuid4().hex[:8]}"
    temp_dir = Path(tempfile.gettempdir()) / temp_id

    try:
        cmd = ["git", "clone", "--depth", "50", canonical_clone_url, str(temp_dir)]
        res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=CLONE_TIMEOUT_SECONDS
        )

        if res.returncode != 0:
            shutil.rmtree(temp_dir, ignore_errors=True)
            err_snip = res.stderr.strip().splitlines()[-1] if res.stderr.strip() else "Clone failed"
            reason = f"Git clone failed: {err_snip}"
            return SAMPLE_REPO_PATH, False, reason

        return temp_dir, True, None

    except subprocess.TimeoutExpired:
        shutil.rmtree(temp_dir, ignore_errors=True)
        return SAMPLE_REPO_PATH, False, f"Git clone timed out after {CLONE_TIMEOUT_SECONDS}s."
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        return SAMPLE_REPO_PATH, False, f"Ingestion error: {str(e)}"


def cleanup_temp_repo(repo_path: Path, is_temp: bool):
    """Safely cleans up temporary clone folders."""
    if is_temp and repo_path.exists():
        shutil.rmtree(repo_path, ignore_errors=True)

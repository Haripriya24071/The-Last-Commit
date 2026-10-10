"""
Repository Ingestion Safeguards.
Handles shallow git clones (--depth 50), repo size limits, safe sandbox cleanup,
and detailed timing breakdown profiling.
"""
import os
import re
import shutil
import subprocess
import tempfile
import time
import uuid
from pathlib import Path
from typing import Tuple, Optional, Dict, Any

# Safety thresholds
MAX_REPO_SIZE_MB = 150  # Only reject truly massive repositories
CLONE_TIMEOUT_SECONDS = 25

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SAMPLE_REPO_PATH = REPO_ROOT / "sample_repo"
CACHE_DIR = REPO_ROOT / "backend" / "cache" / "repos"

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
    Supports optional GITHUB_TOKEN environment variable for higher API rate limits.
    Returns size in KB or None if rate limited / offline.
    """
    try:
        import httpx
        url = f"https://api.github.com/repos/{owner}/{repo}"
        headers = {"User-Agent": "The-Last-Commit-Scanner/2.0"}
        token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
        if token:
            headers["Authorization"] = f"Bearer {token.strip()}"

        res = httpx.get(url, headers=headers, timeout=3.0)
        if res.status_code == 200:
            data = res.json()
            return data.get("size", 0)  # Size in KB
    except Exception:
        pass
    return None



def get_latest_commit_hash(repo_dir: Path) -> Optional[str]:
    """Gets HEAD commit hash from a git repository."""
    try:
        res = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=str(repo_dir),
            capture_output=True,
            text=True,
            timeout=3
        )
        if res.returncode == 0:
            return res.stdout.strip()
    except Exception:
        pass
    return None


def safe_remove_directory(path: Path):
    """Safely removes directory on Windows even with read-only .git files."""
    if not path.exists():
        return
    import stat
    def on_error(fn, p, excinfo):
        try:
            os.chmod(p, stat.S_IWRITE)
            fn(p)
        except Exception:
            pass
    shutil.rmtree(path, onexc=on_error)


def evict_old_repo_cache(max_age_hours: float = 24.0, max_cache_dirs: int = 15):
    """
    Evicts stale cached clone directories older than max_age_hours or if total cache exceeds max_cache_dirs.
    """
    if not CACHE_DIR.exists():
        return

    now = time.time()
    max_age_sec = max_age_hours * 3600
    cached_dirs = [d for d in CACHE_DIR.iterdir() if d.is_dir()]

    # 1. Evict directories older than max_age
    for d in cached_dirs:
        try:
            mtime = d.stat().st_mtime
            if (now - mtime) > max_age_sec:
                safe_remove_directory(d)
        except Exception:
            pass

    # 2. LRU count limit eviction
    remaining_dirs = [d for d in CACHE_DIR.iterdir() if d.is_dir()]
    if len(remaining_dirs) > max_cache_dirs:
        # Sort oldest mtime first
        remaining_dirs.sort(key=lambda d: d.stat().st_mtime if d.exists() else 0)
        for d in remaining_dirs[:len(remaining_dirs) - max_cache_dirs]:
            safe_remove_directory(d)



def ingest_repository(repo_target: str) -> Tuple[Path, bool, Optional[str], Dict[str, float]]:
    """
    Ingests a repository for scanning with precise timing logs and robust local caching.
    Returns: (repo_path, is_temp, fallback_reason, timing_metrics)
    """
    timing: Dict[str, float] = {
        "api_precheck_sec": 0.0,
        "clone_time_sec": 0.0,
        "cached_hit": 0.0
    }
    target_clean = (repo_target or "").strip()

    # 1. Handle Built-in Cursed Sample House explicitly
    if target_clean.lower() in {"", "sample", "sample_repo", "cursed", "default", "the cursed house"}:
        if SAMPLE_REPO_PATH.exists():
            return SAMPLE_REPO_PATH, False, None, timing
        return Path("sample_repo"), False, None, timing

    # 2. Local folder path
    local_path = Path(target_clean)
    if local_path.exists() and local_path.is_dir():
        return local_path, False, None, timing

    # 3. Validate GitHub repository URL pattern
    parsed = parse_github_url(target_clean)
    if not parsed:
        reason = f"Repository URL must match 'https://github.com/owner/repo'. Provided: '{target_clean}'"
        return SAMPLE_REPO_PATH, False, reason, timing

    owner, repo_name, canonical_clone_url = parsed

    # 4. Fast Cache Check: Check if repository was already successfully cloned with source files
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    evict_old_repo_cache()
    cached_repo_dir = CACHE_DIR / f"{owner}_{repo_name}"

    
    # Valid cache requires both .git and actual source files
    if cached_repo_dir.exists() and (cached_repo_dir / ".git").exists():
        file_count = len([f for f in cached_repo_dir.iterdir() if not f.name.startswith(".")])
        if file_count >= 1:
            t0 = time.time()
            timing["cached_hit"] = 1.0
            timing["clone_time_sec"] = round(time.time() - t0, 3)
            print(f"[Ingester] [CACHE HIT] for {owner}/{repo_name} ({file_count} root files)")
            return cached_repo_dir, False, None, timing

    # 5. Pre-check via GitHub API
    t_api = time.time()
    size_kb = check_github_repo_size_api(owner, repo_name)
    timing["api_precheck_sec"] = round(time.time() - t_api, 3)
    
    if size_kb is not None:
        size_mb = size_kb / 1024
        if size_mb > MAX_REPO_SIZE_MB:
            reason = f"Repository is too massive ({size_mb:.1f} MB exceeds {MAX_REPO_SIZE_MB} MB limit)."
            return SAMPLE_REPO_PATH, False, reason, timing

    # 6. Clone repository with --depth 50 into cache folder
    t_clone = time.time()
    temp_dir = cached_repo_dir

    try:
        safe_remove_directory(temp_dir)

        cmd = ["git", "clone", "--depth", "50", canonical_clone_url, str(temp_dir)]
        res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=CLONE_TIMEOUT_SECONDS
        )
        timing["clone_time_sec"] = round(time.time() - t_clone, 3)

        if res.returncode != 0:
            safe_remove_directory(temp_dir)
            err_snip = res.stderr.strip().splitlines()[-1] if res.stderr.strip() else "Clone failed"
            reason = f"Git clone failed: {err_snip}"
            return SAMPLE_REPO_PATH, False, reason, timing

        print(f"[Ingester] [CLONED] {owner}/{repo_name} (--depth 50) in {timing['clone_time_sec']}s")
        return temp_dir, False, None, timing

    except subprocess.TimeoutExpired:
        safe_remove_directory(temp_dir)
        return SAMPLE_REPO_PATH, False, f"Git clone timed out after {CLONE_TIMEOUT_SECONDS}s.", timing
    except Exception as e:
        safe_remove_directory(temp_dir)
        return SAMPLE_REPO_PATH, False, f"Ingestion error: {str(e)}", timing


def cleanup_temp_repo(repo_path: Path, is_temp: bool):
    """Safely cleans up temporary clone folders if marked as temporary."""
    if is_temp and repo_path.exists():
        safe_remove_directory(repo_path)



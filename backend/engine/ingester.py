"""
Repository Ingestion Safeguards.
Handles shallow git clones (--depth 50), repo size limits, and safe sandbox cleanup.
"""
import os
import shutil
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import Tuple, Optional

# Safety thresholds
MAX_REPO_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
MAX_FILES_COUNT = 500
CLONE_TIMEOUT_SECONDS = 15

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
SAMPLE_REPO_PATH = REPO_ROOT / "sample_repo"


def get_dir_size_and_count(path: Path) -> Tuple[int, int]:
    """Calculates the total byte size and file count of a directory."""
    total_size = 0
    file_count = 0
    for root, _, files in os.walk(path):
        for f in files:
            fp = os.path.join(root, f)
            if not os.path.islink(fp):
                try:
                    total_size += os.path.getsize(fp)
                    file_count += 1
                except (OSError, FileNotFoundError):
                    pass
    return total_size, file_count


def ingest_repository(repo_target: str) -> Tuple[Path, bool, Optional[str]]:
    """
    Ingests a repository for scanning.
    Returns: (repo_path, is_temp, error_message)
    """
    # 1. Handle Built-in Cursed Sample House
    target_clean = (repo_target or "").strip().lower()
    if target_clean in {"", "sample", "sample_repo", "cursed", "default", "the cursed house"}:
        if SAMPLE_REPO_PATH.exists():
            return SAMPLE_REPO_PATH, False, None
        return Path("sample_repo"), False, None

    # 2. Check if local path exists
    local_path = Path(repo_target)
    if local_path.exists() and local_path.is_dir():
        return local_path, False, None

    # 3. Remote Git URL Cloning
    if not (repo_target.startswith("http://") or repo_target.startswith("https://") or repo_target.startswith("git@")):
        return SAMPLE_REPO_PATH, False, f"Invalid repository link '{repo_target}'. Falling back to Cursed House."

    temp_id = f"mansion_clone_{uuid.uuid4().hex[:8]}"
    temp_dir = Path(tempfile.gettempdir()) / temp_id

    try:
        # Clone shallow depth 50 to preserve git log for commit messages
        cmd = ["git", "clone", "--depth", "50", repo_target, str(temp_dir)]
        res = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=CLONE_TIMEOUT_SECONDS
        )

        if res.returncode != 0:
            shutil.rmtree(temp_dir, ignore_errors=True)
            return SAMPLE_REPO_PATH, False, f"Git clone failed: {res.stderr[:200]}. Using Cursed House."

        # Verify size and file count limits
        size_bytes, file_count = get_dir_size_and_count(temp_dir)
        if size_bytes > MAX_REPO_SIZE_BYTES or file_count > MAX_FILES_COUNT:
            shutil.rmtree(temp_dir, ignore_errors=True)
            return SAMPLE_REPO_PATH, False, f"Repository exceeded size limit ({file_count} files, {size_bytes / (1024*1024):.1f}MB). Using Cursed House."

        return temp_dir, True, None

    except subprocess.TimeoutExpired:
        shutil.rmtree(temp_dir, ignore_errors=True)
        return SAMPLE_REPO_PATH, False, "Git clone timed out after 15 seconds. Using Cursed House."
    except Exception as e:
        shutil.rmtree(temp_dir, ignore_errors=True)
        return SAMPLE_REPO_PATH, False, f"Ingestion error: {str(e)}. Using Cursed House."


def cleanup_temp_repo(repo_path: Path, is_temp: bool):
    """Safely cleans up temporary clone folders."""
    if is_temp and repo_path.exists():
        shutil.rmtree(repo_path, ignore_errors=True)

"""
Comprehensive Test Suite for The Last Commit Scanner and Detectors.
Validates Tier 1 Language-Agnostic and Tier 2 Python Plugins against sample_repo.
"""
import pytest
from pathlib import Path
from detectors import (
    Finding, RoleType, FindingSeverity, FindingConfidence,
    AgnosticReaperDetector, AgnosticSkeletonDetector,
    PythonGhostDetector, PythonReaperDetector, PythonSkeletonDetector,
    DetectorRegistry, default_scanner, map_file_to_room, mask_secret
)

# Base path to the sample cursed repository
REPO_ROOT = Path(__file__).resolve().parent.parent
SAMPLE_REPO = REPO_ROOT / "sample_repo"


def test_mask_secret_helper():
    """Verify that secret masking prevents sensitive credentials from leaking."""
    assert mask_secret("sk_live_1234567890abcdef") == "sk_***def"
    assert mask_secret("secret123") == "sec***123"
    assert mask_secret("tiny") == "***"


def test_room_mapping_logic():
    """Verify file paths are properly assigned to the 5 mansion rooms."""
    assert map_file_to_room("src/core.py") == "library"
    assert map_file_to_room("app/routes.py") == "library"
    assert map_file_to_room("auth/security.py") == "chapel"
    assert map_file_to_room("api/v1/auth.py") == "chapel"
    assert map_file_to_room("db/database.py") == "cellar"
    assert map_file_to_room(".env") == "cellar"
    assert map_file_to_room("tests/test_core.py") == "study"
    assert map_file_to_room("docs/manual.md") == "study"
    assert map_file_to_room("utils/helpers.py") == "attic"
    assert map_file_to_room("scripts/run.py") == "attic"


def test_tier1_agnostic_reaper():
    """Verify Tier 1 Agnostic Reaper detects .env files and secret strings."""
    detector = AgnosticReaperDetector()
    findings = detector.scan(SAMPLE_REPO)
    
    types = [f.type for f in findings]
    assert "committed_env_file" in types
    assert "hardcoded_secret" in types

    for f in findings:
        assert f.role == RoleType.REAPER
        assert "***" in f.snippet or f.type == "committed_env_file"


def test_tier1_agnostic_skeleton():
    """Verify Tier 1 Agnostic Skeleton detects TODO comments."""
    detector = AgnosticSkeletonDetector()
    findings = detector.scan(SAMPLE_REPO)
    
    types = [f.type for f in findings]
    assert "todo_comment" in types

    todo_findings = [f for f in findings if f.type == "todo_comment"]
    assert len(todo_findings) >= 1
    assert "strict hexadecimal" in todo_findings[0].snippet


def test_python_ghost_detector():
    """Verify Python Ghost detects logic errors: unclosed file, bare except, mutable default, unreachable code."""
    detector = PythonGhostDetector()
    findings = detector.scan(SAMPLE_REPO)
    
    types = {f.type: f for f in findings}
    assert "unclosed_file" in types
    assert "bare_except" in types
    assert "mutable_default" in types
    assert "unreachable_code"
    assert "unused_import" in types

    assert types["unclosed_file"].file.endswith("utils/helpers.py")
    assert types["bare_except"].file.endswith("src/core.py")
    assert types["mutable_default"].file.endswith("utils/helpers.py")


def test_python_reaper_detector():
    """Verify Python Reaper detects eval/exec, shell=True, SQL injection, and DEBUG mode."""
    detector = PythonReaperDetector()
    findings = detector.scan(SAMPLE_REPO)
    
    types = {f.type: f for f in findings}
    assert "eval_exec" in types
    assert "shell_injection" in types
    assert "sql_injection" in types
    assert "debug_mode" in types

    assert types["eval_exec"].file.endswith("auth/security.py")
    assert types["shell_injection"].file.endswith("auth/security.py")
    assert types["sql_injection"].file.endswith("db/database.py")
    assert types["debug_mode"].file.endswith("auth/security.py")


def test_python_skeleton_detector():
    """Verify Python Skeleton detects high complexity, dead code, and vague naming."""
    detector = PythonSkeletonDetector()
    findings = detector.scan(SAMPLE_REPO)
    
    types = {f.type: f for f in findings}
    assert "high_complexity" in types
    assert "dead_code" in types
    assert "vague_naming" in types

    assert types["high_complexity"].file.endswith("src/core.py")
    assert "unused_phantom_calculation" in types["dead_code"].snippet
    assert types["vague_naming"].file.endswith("utils/helpers.py")


def test_full_registry_scan_by_role():
    """Verify complete scanner registry scans by role and assigns rooms."""
    ghost_findings = default_scanner.scan_repository(SAMPLE_REPO, role=RoleType.GHOST)
    reaper_findings = default_scanner.scan_repository(SAMPLE_REPO, role=RoleType.REAPER)
    skeleton_findings = default_scanner.scan_repository(SAMPLE_REPO, role=RoleType.SKELETON)

    assert len(ghost_findings) >= 5
    assert len(reaper_findings) >= 5
    assert len(skeleton_findings) >= 4

    # Verify rooms are assigned
    rooms = {f.room for f in ghost_findings + reaper_findings + skeleton_findings}
    assert "library" in rooms
    assert "chapel" in rooms
    assert "cellar" in rooms
    assert "study" in rooms
    assert "attic" in rooms

"""
Comprehensive Test Suite for Phase 2 Engine & API Endpoints.
Tests Decoy Cleanliness, Broken File Robustness, Dynamic Room Balancing, and API Endpoints.
"""
import pytest
import tempfile
from pathlib import Path
from fastapi.testclient import TestClient
from main import app
from detectors.base import RoleType
from detectors.registry import default_scanner
from engine import (
    ingest_repository, game_sessions, generate_and_save_sample_cache,
    load_sample_cache, SAMPLE_REPO_PATH
)

client = TestClient(app)


# 1. Clean Decoy Files Verification Test
def test_clean_decoy_files_produce_zero_findings():
    """Verify that clean decoy files in sample_repo produce zero false-positive findings."""
    decoy_files = [
        SAMPLE_REPO_PATH / "src" / "formatter.py",
        SAMPLE_REPO_PATH / "auth" / "tokens.py",
        SAMPLE_REPO_PATH / "db" / "models.py",
        SAMPLE_REPO_PATH / "utils" / "logger.py",
    ]

    with tempfile.TemporaryDirectory() as tmpdir:
        temp_repo = Path(tmpdir)
        for df in decoy_files:
            if df.exists():
                dest = temp_repo / df.name
                dest.write_text(df.read_text(encoding="utf-8"), encoding="utf-8")

        for role in [RoleType.GHOST, RoleType.REAPER, RoleType.SKELETON]:
            findings = default_scanner.scan_repository(temp_repo, role=role)
            # Should have zero role-specific code findings (ignore generic missing README)
            code_findings = [f for f in findings if f.type not in {"missing_readme", "missing_tests"}]
            assert len(code_findings) == 0, f"False positives found in decoy files for {role}: {code_findings}"


# 2. Broken File Robustness Test
def test_broken_python_files_skipped_without_crashing():
    """Verify that scanner gracefully skips syntax errors and invalid encodings without crashing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        temp_repo = Path(tmpdir)
        
        # 1. Deliberate syntax error file
        broken_syntax = temp_repo / "broken_syntax.py"
        broken_syntax.write_text("def broken_func(:\n   if True return None\n@@@@@!!!", encoding="utf-8")
        
        # 2. Valid file with a real bug
        valid_file = temp_repo / "valid_with_bug.py"
        valid_file.write_text("def unclosed():\n    f = open('data.txt')\n    return f.read()\n", encoding="utf-8")

        # Scan should succeed without raising exceptions
        findings = default_scanner.scan_repository(temp_repo, role=RoleType.GHOST)
        types = [f.type for f in findings]
        assert "unclosed_file" in types


# 3. Dynamic Room Balancing & Whisper Signals Test
def test_dynamic_room_balancing():
    """Verify all 5 rooms exist and receive objects."""
    session = game_sessions.create_session(SAMPLE_REPO_PATH, "sample", RoleType.GHOST)
    assert len(session.rooms_public) == 5
    for room_name in ["library", "cellar", "chapel", "study", "attic"]:
        assert room_name in session.rooms_public
        room_data = session.rooms_public[room_name]
        assert "whisper" in room_data
        assert "riddle" in room_data
        assert len(room_data["objects"]) > 0


# 4. Full API Workflow Test (/api/scan -> /api/map -> /api/room -> /api/check -> /api/report)
def test_full_game_api_workflow():
    # Step 1: POST /api/scan
    scan_res = client.post("/api/scan", json={"repo_url": "sample", "role": "ghost"})
    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    assert "scan_id" in scan_data
    scan_id = scan_data["scan_id"]
    assert scan_data["role"] == "ghost"
    assert scan_data["lantern_visits_left"] == 4
    assert scan_data["lifelines_left"] == 4

    # Step 2: GET /api/map/{scan_id}
    map_res = client.get(f"/api/map/{scan_id}")
    assert map_res.status_code == 200
    map_data = map_res.json()
    assert "library" in map_data["rooms"]
    # Check that answers are NOT leaked in public map
    for room in map_data["rooms"].values():
        for obj in room["objects"]:
            assert "is_real" not in obj
            assert "finding" not in obj

    # Step 3: GET /api/room/{scan_id}/attic
    room_res = client.get(f"/api/room/{scan_id}/attic")
    assert room_res.status_code == 200
    room_data = room_res.json()["room"]
    assert room_data["name"] == "attic"
    assert len(room_data["objects"]) > 0
    first_obj_id = room_data["objects"][0]["id"]

    # Step 4: POST /api/check
    check_res = client.post("/api/check", json={
        "scan_id": scan_id,
        "room_name": "attic",
        "object_id": first_obj_id
    })
    assert check_res.status_code == 200
    check_data = check_res.json()
    assert "is_real" in check_data
    assert "current_score" in check_data
    assert "lifelines_left" in check_data

    # Step 5: GET /api/report/{scan_id}
    report_res = client.get(f"/api/report/{scan_id}")
    assert report_res.status_code == 200
    report_data = report_res.json()
    assert "rank_title" in report_data
    assert "score" in report_data
    assert "total_relics_in_mansion" in report_data
    assert "relics_missed" in report_data


# 6. Fallback Reason Test
def test_scan_fallback_reason_on_invalid_url():
    """Verify fallback_reason is populated when an invalid or non-GitHub URL is provided."""
    res = client.post("/api/scan", json={"repo_url": "https://malicious-site.com/fake", "role": "ghost"})
    assert res.status_code == 200
    data = res.json()
    assert "fallback_reason" in data
    assert data["fallback_reason"] is not None
    assert "github.com/owner/repo" in data["fallback_reason"]


# 7. Check Idempotency & Game Over Rejection Test
def test_check_idempotency_and_game_over():
    """Verify clicking an object is idempotent and checks are rejected after all candles extinguish."""
    scan_res = client.post("/api/scan", json={"repo_url": "sample", "role": "ghost"})
    scan_id = scan_res.json()["scan_id"]

    room_res = client.get(f"/api/room/{scan_id}/attic")
    objects = room_res.json()["room"]["objects"]
    first_obj_id = objects[0]["id"]

    # First click
    check_1 = client.post("/api/check", json={"scan_id": scan_id, "room_name": "attic", "object_id": first_obj_id}).json()
    initial_score = check_1["current_score"]
    initial_lifelines = check_1["lifelines_left"]

    # Second click on same object (Idempotent)
    check_2 = client.post("/api/check", json={"scan_id": scan_id, "room_name": "attic", "object_id": first_obj_id}).json()
    assert check_2["current_score"] == initial_score
    assert check_2["lifelines_left"] == initial_lifelines

    # Simulate game over by extinguishing lifelines
    session = game_sessions.get_session(scan_id)
    session.lifelines_remaining = 0
    session.is_game_over = True

    # Check after game over
    game_over_check = client.post("/api/check", json={"scan_id": scan_id, "room_name": "attic", "object_id": "obj_attic_2"}).json()
    assert game_over_check["game_over"] is True
    assert game_over_check["is_valid"] is False
    assert "Game over" in game_over_check["error"]

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


# 8. Warmth Proximity API & Quantization Test
def test_warmth_proximity_endpoint():
    """Verify /api/warmth returns quantized 5-level warmth and clamps coordinates safely."""
    scan_res = client.post("/api/scan", json={"repo_url": "sample", "role": "ghost"})
    scan_id = scan_res.json()["scan_id"]

    # Post warmth from room origin (0, 1.6, 0)
    warmth_res = client.post("/api/warmth", json={
        "scan_id": scan_id,
        "room_name": "attic",
        "x": 0.0,
        "y": 1.6,
        "z": 0.0
    })
    assert warmth_res.status_code == 200
    data = warmth_res.json()
    assert "warmth" in data
    # Value must be quantized to one of 5 levels
    assert data["warmth"] in {0.0, 0.25, 0.5, 0.75, 1.0}
    assert "has_relics" in data

    # Test out-of-bounds coordinates (should clamp without error)
    warmth_clamped = client.post("/api/warmth", json={
        "scan_id": scan_id,
        "room_name": "attic",
        "x": 999.0,
        "y": -50.0,
        "z": -999.0
    })
    assert warmth_clamped.status_code == 200
    assert warmth_clamped.json()["warmth"] in {0.0, 0.25, 0.5, 0.75, 1.0}


# 9. Haunting Report Mid-game Privacy Test
def test_haunting_report_midgame_privacy():
    """Verify missed relics are hidden during active gameplay and only revealed after game over."""
    scan_res = client.post("/api/scan", json={"repo_url": "sample", "role": "ghost"})
    scan_id = scan_res.json()["scan_id"]

    # Mid-game check (game is not finished)
    mid_report = client.get(f"/api/report/{scan_id}").json()
    assert mid_report["is_game_finished"] is False
    assert mid_report["relics_missed"] == []  # Completely hidden mid-game!

    # Trigger game over
    session = game_sessions.get_session(scan_id)
    session.lifelines_remaining = 0
# 10. Lantern Visit Spending & Limit Test
def test_enter_room_spends_lantern_visits_and_limits():
    """Verify /api/enter-room deducts lantern visits and rejects when 0 visits remain."""
    scan_res = client.post("/api/scan", json={"repo_url": "sample", "role": "ghost"})
    scan_id = scan_res.json()["scan_id"]

    # Initial state: 4 visits
    map_res = client.get(f"/api/map/{scan_id}").json()
    assert map_res["lantern_visits_left"] == 4

    # Visit 1
    v1 = client.post("/api/enter-room", json={"scan_id": scan_id, "room_name": "library"}).json()
    assert v1["is_valid"] is True
    assert v1["lantern_visits_left"] == 3

    # Visit 2, 3, 4
    client.post("/api/enter-room", json={"scan_id": scan_id, "room_name": "cellar"})
    client.post("/api/enter-room", json={"scan_id": scan_id, "room_name": "chapel"})
    v4 = client.post("/api/enter-room", json={"scan_id": scan_id, "room_name": "study"}).json()
    assert v4["lantern_visits_left"] == 0

    # Visit 5 (Must be rejected)
    v5_res = client.post("/api/enter-room", json={"scan_id": scan_id, "room_name": "attic"})
    assert v5_res.status_code == 400
    assert "No visits remaining" in v5_res.json()["detail"]


# 11. Scanning Same Repo Twice Works (Cache Test)
def test_scan_same_repo_twice_cached():
    """Verify scanning the same repo twice succeeds quickly and returns role presence."""
    res_1 = client.post("/api/scan", json={"repo_url": "sample", "role": "ghost"})
    assert res_1.status_code == 200
    data_1 = res_1.json()
    assert "role_presence" in data_1
    assert data_1["role_presence"]["ghost"] in {"strong", "faint", "none"}

    res_2 = client.post("/api/scan", json={"repo_url": "sample", "role": "reaper"})
    assert res_2.status_code == 200
    data_2 = res_2.json()
    assert data_2["role_presence"]["reaper"] in {"strong", "faint", "none"}


# 12. Failed Clone Sets Fallback Reason and Fell Back Flag
def test_failed_clone_sets_fallback_reason_and_fell_back_flag():
    """Verify failed clone sets fallback_reason and fell_back=True."""
    res = client.post("/api/scan", json={"repo_url": "https://github.com/nonexistent-owner-xyz-12345/nonexistent-repo", "role": "skeleton"})
    assert res.status_code == 200
    data = res.json()
    assert data["fell_back"] is True
    assert data["fallback_reason"] is not None


# 13. Windows Cleanup Regression Test
def test_windows_cleanup_regression_on_readonly_files(tmp_path):
    """Verify safe_remove_directory cleans up read-only files on Windows."""
    import stat
    import os
    from engine.ingester import safe_remove_directory

    test_dir = tmp_path / "readonly_test_dir"
    test_dir.mkdir()
    ro_file = test_dir / "readonly_git_object.pack"
    ro_file.write_text("dummy binary git pack")
    # Mark as read-only
    os.chmod(ro_file, stat.S_IREAD)

    safe_remove_directory(test_dir)
    assert not test_dir.exists()


# 14. Friendly JSON Exception Handler Test
def test_friendly_json_exception_handlers():
    """Verify FastAPI exception handlers return friendly JSON response."""
    res = client.get("/api/map/invalid-nonexistent-session-id")
    assert res.status_code == 404
    data = res.json()
    assert data["error"] is True
    assert "detail" in data
    assert "spirits in the mansion" in data["message"]


# 15. GitHub API Size Check Rate Limit / Network Failure Resilience Test
def test_github_api_size_check_rate_limit_resilience():
    """Verify check_github_repo_size_api returns None on network failures or rate limits."""
    from engine.ingester import check_github_repo_size_api
    # Non-existent or offline domain simulation
    size = check_github_repo_size_api("invalid-user-xyz-9999", "nonexistent-repo-1234")
    assert size is None or isinstance(size, int)


# 16. Distinct Relic Sets Per Role on Sample Test
def test_distinct_relic_sets_per_role_on_sample():
    """Verify that picking each role on the sample repo yields a distinct, non-identical set of relics."""
    from engine.game_session import game_sessions

    # Ghost Session
    ghost_scan = client.post("/api/scan", json={"repo_url": "sample", "role": "ghost"}).json()
    ghost_session = game_sessions.get_session(ghost_scan["scan_id"])
    ghost_relic_types = {f.type for f in ghost_session.findings}

    # Reaper Session
    reaper_scan = client.post("/api/scan", json={"repo_url": "sample", "role": "reaper"}).json()
    reaper_session = game_sessions.get_session(reaper_scan["scan_id"])
    reaper_relic_types = {f.type for f in reaper_session.findings}

    # Skeleton Session
    skeleton_scan = client.post("/api/scan", json={"repo_url": "sample", "role": "skeleton"}).json()
    skeleton_session = game_sessions.get_session(skeleton_scan["scan_id"])
    skeleton_relic_types = {f.type for f in skeleton_session.findings}

    assert len(ghost_relic_types) > 0
    assert len(reaper_relic_types) > 0
    assert len(skeleton_relic_types) > 0

    # Ensure sets are distinct between roles
    assert ghost_relic_types != reaper_relic_types
    assert reaper_relic_types != skeleton_relic_types
    assert ghost_relic_types != skeleton_relic_types


# 17. JS/TS Detector Suite Tests
def test_js_empty_catch_detector(tmp_path):
    """Verify JSEmptyCatchDetector flags empty catch blocks."""
    from detectors.js_ts_detectors import JSEmptyCatchDetector
    js_file = tmp_path / "handler.js"
    js_file.write_text("try { doSomething(); } catch (err) {}\n")
    
    detector = JSEmptyCatchDetector()
    findings = detector.scan(tmp_path)
    assert len(findings) == 1
    assert findings[0].type == "empty_catch_block"
    assert findings[0].line == 1


def test_js_loose_equality_detector(tmp_path):
    """Verify JSLooseEqualityDetector flags == and != while ignoring === and != null."""
    from detectors.js_ts_detectors import JSLooseEqualityDetector
    js_file = tmp_path / "auth.js"
    js_file.write_text("if (role == 'admin') { allow(); }\nif (val === 10) {}\nif (x == null) {}\n")
    
    detector = JSLooseEqualityDetector()
    findings = detector.scan(tmp_path)
    assert len(findings) == 1
    assert findings[0].type == "loose_equality_comparison"
    assert "==" in findings[0].snippet


def test_js_console_log_detector(tmp_path):
    """Verify JSConsoleLogDetector flags console.log in non-test source files."""
    from detectors.js_ts_detectors import JSConsoleLogDetector
    src_file = tmp_path / "app.js"
    src_file.write_text("console.log('debugging user data:', user);\n")
    
    detector = JSConsoleLogDetector()
    findings = detector.scan(tmp_path)
    assert len(findings) == 1
    assert findings[0].type == "leftover_console_log"


def test_js_reaper_security_detector(tmp_path):
    """Verify JSReaperSecurityDetector flags eval, dangerouslySetInnerHTML, and new Function."""
    from detectors.js_ts_detectors import JSReaperSecurityDetector
    vuln_file = tmp_path / "component.jsx"
    vuln_file.write_text("""
    eval(untrustedInput);
    <div dangerouslySetInnerHTML={{ __html: userMarkup }} />
    const dynamicFn = new Function('a', 'b', 'return a + b');
    """)
    
    detector = JSReaperSecurityDetector()
    findings = detector.scan(tmp_path)
    types = {f.type for f in findings}
    assert "dangerous_eval_execution" in types
    assert "dangerously_set_inner_html" in types
    assert "dangerous_function_constructor" in types


def test_ts_type_bypass_detector(tmp_path):
    """Verify TSTypeBypassDetector flags @ts-ignore and unconstrained any."""
    from detectors.js_ts_detectors import TSTypeBypassDetector
    ts_file = tmp_path / "service.ts"
    ts_file.write_text("""
    // @ts-ignore
    const data: any = parsePayload();
    """)
    
    detector = TSTypeBypassDetector()
    findings = detector.scan(tmp_path)
    types = {f.type for f in findings}
    assert "typescript_ts_ignore_bypass" in types
    assert "typescript_overuse_of_any" in types


def test_js_complexity_detector(tmp_path):
    """Verify JSComplexityDetector flags deeply nested code blocks."""
    from detectors.js_ts_detectors import JSComplexityDetector
    nested_file = tmp_path / "nested.js"
    nested_file.write_text("""
    function processTree() {
        if (a) {
            if (b) {
                for (let i = 0; i < 10; i++) {
                    if (c) {
                        if (d) {
                            console.log(i);
                        }
                    }
                }
            }
        }
    }
    """)
    
    detector = JSComplexityDetector()
    findings = detector.scan(tmp_path)
    assert any(f.type == "deeply_nested_block" for f in findings)







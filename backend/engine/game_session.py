"""
Game Session Management, Server-Side Real/Decoy Evaluation, and Haunting Report Generation.
"""
import uuid
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from detectors.base import Finding, RoleType
from detectors.registry import default_scanner
from .room_builder import (
    ROOM_NAMES, ROOM_METADATA, balance_files_across_rooms,
    calculate_whisper_signal, generate_room_riddle, build_room_objects
)

JUMP_SCARE_TYPES = [
    "door_slam",
    "ghost_face",
    "lights_out",
    "skeleton_pop",
    "mirror_shatter",
    "eerie_laughter"
]


class GameSession:
    def __init__(self, scan_id: str, repo_target: str, role: RoleType):
        self.scan_id = scan_id
        self.repo_target = repo_target
        self.role = role
        self.created_at = time.time()
        
        self.findings: List[Finding] = []
        self.is_suspiciously_clean: bool = False
        
        self.rooms_public: Dict[str, Any] = {}
        self.rooms_server_truth: Dict[str, Any] = {}
        
        self.clicked_objects: Dict[str, Dict[str, Any]] = {}
        self.found_relics: List[Dict[str, Any]] = []
        self.lifelines_remaining: int = 4
        self.lantern_visits_remaining: int = 4
        self.score: int = 0

    def to_map_view(self) -> Dict[str, Any]:
        """Returns the cursed mansion map view without revealing real/decoy answers."""
        return {
            "scan_id": self.scan_id,
            "role": self.role.value,
            "is_suspiciously_clean": self.is_suspiciously_clean,
            "lantern_visits_left": self.lantern_visits_remaining,
            "lifelines_left": self.lifelines_remaining,
            "rooms": self.rooms_public
        }


class SessionStore:
    """Thread-safe in-memory store for active game sessions."""
    def __init__(self):
        self._sessions: Dict[str, GameSession] = {}

    def create_session(self, repo_path: Path, repo_target: str, role: RoleType) -> GameSession:
        scan_id = f"mansion_{uuid.uuid4().hex[:8]}"
        session = GameSession(scan_id=scan_id, repo_target=repo_target, role=role)

        # 1. Execute Scanner Detectors for Chosen Role
        findings = default_scanner.scan_repository(repo_path, role=role)

        # 2. Minimum-findings Fallback
        # If fewer than 3 findings, add milder Tier 1 findings (Agnostic Skeleton / Reaper)
        if len(findings) < 3:
            all_agnostic = default_scanner.scan_repository(repo_path, role=None)
            for f in all_agnostic:
                if f not in findings:
                    findings.append(f)
                if len(findings) >= 3:
                    break

        # 3. Suspiciously clean check
        if len(findings) < 3:
            session.is_suspiciously_clean = True

        session.findings = findings

        # 4. Build Dynamic Rooms & Objects
        room_file_map = balance_files_across_rooms(repo_path, findings)

        findings_by_room: Dict[str, List[Finding]] = {r: [] for r in ROOM_NAMES}
        for f in findings:
            room_name = f.room if f.room in ROOM_NAMES else "attic"
            findings_by_room[room_name].append(f)

        for room_name in ROOM_NAMES:
            files_in_room = room_file_map.get(room_name, [])
            rf = findings_by_room.get(room_name, [])

            whisper = calculate_whisper_signal(len(rf))
            riddle = generate_room_riddle(room_name, rf)
            public_objs, server_truth = build_room_objects(room_name, files_in_room, repo_path, rf)

            session.rooms_public[room_name] = {
                "name": room_name,
                "title": ROOM_METADATA[room_name]["title"],
                "description": ROOM_METADATA[room_name]["description"],
                "theme_color": ROOM_METADATA[room_name]["theme_color"],
                "whisper": whisper,
                "riddle": riddle,
                "object_count": len(public_objs),
                "objects": public_objs
            }
            session.rooms_server_truth[room_name] = server_truth

        self._sessions[scan_id] = session
        return session

    def get_session(self, scan_id: str) -> Optional[GameSession]:
        return self._sessions.get(scan_id)

    def evaluate_object_click(self, scan_id: str, room_name: str, object_id: str) -> Dict[str, Any]:
        session = self.get_session(scan_id)
        if not session:
            return {"error": "Session not found", "is_valid": False}

        if room_name not in session.rooms_server_truth:
            return {"error": "Invalid room name", "is_valid": False}

        room_truth = session.rooms_server_truth[room_name]
        if object_id not in room_truth:
            return {"error": "Object not found in room", "is_valid": False}

        # Check if already clicked
        click_key = f"{room_name}:{object_id}"
        if click_key in session.clicked_objects:
            return session.clicked_objects[click_key]

        obj_data = room_truth[object_id]
        is_real = obj_data["is_real"]

        if is_real:
            finding = obj_data["finding"]
            session.score += 100
            session.found_relics.append(finding)
            result = {
                "is_real": True,
                "relic": finding,
                "points_earned": 100,
                "current_score": session.score,
                "lifelines_left": session.lifelines_remaining,
                "message": f"Relic Uncovered: {finding['type']} in {finding['file']}!"
            }
        else:
            # Trigger jump scare and decrease lifeline
            session.lifelines_remaining = max(0, session.lifelines_remaining - 1)
            scare_index = len(session.clicked_objects) % len(JUMP_SCARE_TYPES)
            scare_type = JUMP_SCARE_TYPES[scare_index]

            result = {
                "is_real": False,
                "relic": None,
                "points_earned": 0,
                "current_score": session.score,
                "lifelines_left": session.lifelines_remaining,
                "jump_scare_type": scare_type,
                "game_over": session.lifelines_remaining <= 0,
                "message": f"Decoy! The house screeches at you. 1 candle extinguished."
            }

        session.clicked_objects[click_key] = result
        return result

    def generate_haunting_report(self, scan_id: str) -> Dict[str, Any]:
        session = self.get_session(scan_id)
        if not session:
            return {"error": "Session not found"}

        total_relics = len(session.findings)
        found_count = len(session.found_relics)
        lifelines = session.lifelines_remaining

        # Calculate final score: +100 per relic, +25 per remaining lifeline
        final_score = (found_count * 100) + (lifelines * 25)

        # Rank determination
        if total_relics > 0 and found_count == total_relics and lifelines >= 3:
            rank_title = "Ghost Whisperer 👑"
            rank_desc = "Master of the Haunted Codebase. You uncovered every lurking specter while keeping your sanity intact."
        elif total_relics > 0 and found_count == total_relics:
            rank_title = "Haunted Soul 🕯️"
            rank_desc = "You purged all corrupted spirits, though the mansion took a heavy toll on your candles."
        else:
            rank_title = "Fresh Meat 💀"
            rank_desc = "The ghosts claimed victory this time. Re-light your lantern and venture back inside."

        # Compute missed relics
        found_ids = {r["id"] for r in session.found_relics if "id" in r}
        missed_relics = [f.model_dump() for f in session.findings if f.id not in found_ids]

        return {
            "scan_id": session.scan_id,
            "role": session.role.value,
            "score": final_score,
            "lifelines_remaining": lifelines,
            "rank_title": rank_title,
            "rank_description": rank_desc,
            "total_relics_in_mansion": total_relics,
            "relics_found_count": found_count,
            "relics_found": session.found_relics,
            "relics_missed": missed_relics,
            "is_suspiciously_clean": session.is_suspiciously_clean
        }


# Global in-memory session manager
game_sessions = SessionStore()

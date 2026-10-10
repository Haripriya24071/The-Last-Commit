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


SESSION_EXPIRY_SECONDS = 7200  # 2 hours


class GameSession:
    """
    Encapsulates the state of an active mansion investigation session.

    Attributes:
        scan_id (str): Unique deterministic session identifier (e.g. 'mansion_abc123').
        repo_target (str): Target repository URL or 'sample'.
        role (RoleType): Active character role (Ghost, Reaper, or Skeleton).
        fallback_reason (Optional[str]): Explanation if fallen back to the cursed sample.
        timing_metrics (Dict[str, float]): Profiling duration in seconds for clone, AST, and room layout.
        role_presence (Dict[str, str]): Signal strength ('strong', 'faint', 'none') for all 3 roles.
        findings (List[Finding]): Real bugs/smells assigned to this session.
        lifelines_remaining (int): Candle count (starts at 4).
        lantern_visits_remaining (int): Maximum room visit limit (starts at 4).
        score (int): Accumulated investigator points.
        is_game_over (bool): Flag indicating victory or candle depletion.
    """
    def __init__(
        self,
        scan_id: str,
        repo_target: str,
        role: RoleType,
        fallback_reason: Optional[str] = None,
        timing_metrics: Optional[Dict[str, float]] = None,
        role_presence: Optional[Dict[str, str]] = None
    ) -> None:
        self.scan_id: str = scan_id
        self.repo_target: str = repo_target
        self.role: RoleType = role
        self.fallback_reason: Optional[str] = fallback_reason
        self.fell_back: bool = fallback_reason is not None
        self.timing_metrics: Dict[str, float] = timing_metrics or {}
        self.role_presence: Dict[str, str] = role_presence or {"ghost": "none", "reaper": "none", "skeleton": "none"}
        self.created_at: float = time.time()
        
        self.findings: List[Finding] = []
        self.is_suspiciously_clean: bool = False
        
        self.rooms_public: Dict[str, Any] = {}
        self.rooms_server_truth: Dict[str, Any] = {}
        
        self.clicked_objects: Dict[str, Dict[str, Any]] = {}
        self.found_relics: List[Dict[str, Any]] = []
        self.lifelines_remaining: int = 4
        self.lantern_visits_remaining: int = 4
        self.score: int = 0
        self.is_game_over: bool = False
        
        # Warmth rate-limiting & caching
        self.last_warmth_time: float = 0.0
        self.last_warmth_result: Dict[str, Any] = {"warmth": 0.0, "has_relics": True}


    def to_map_view(self) -> Dict[str, Any]:
        """Returns the cursed mansion map view without revealing real/decoy answers."""
        return {
            "scan_id": self.scan_id,
            "repo_target": self.repo_target,
            "role": self.role.value,
            "role_presence": self.role_presence,
            "fell_back": self.fell_back,
            "fallback_reason": self.fallback_reason,
            "is_suspiciously_clean": self.is_suspiciously_clean,
            "timing_metrics": self.timing_metrics,
            "lantern_visits_left": self.lantern_visits_remaining,
            "lifelines_left": self.lifelines_remaining,
            "score": self.score,
            "is_game_over": self.is_game_over,
            "rooms": self.rooms_public
        }


    def spend_lantern_visit(self, room_name: str) -> Dict[str, Any]:
        """
        Deducts one lantern visit when entering a room from the 2D blueprint map.
        Rejects if lantern visits are exhausted.
        """
        if self.lantern_visits_remaining <= 0 or self.is_game_over:
            self.is_game_over = True
            return {"error": "Lantern oil depleted! No visits remaining.", "is_valid": False, "lantern_visits_left": 0, "game_over": True}

        if room_name not in self.rooms_public:
            return {"error": f"Room '{room_name}' does not exist", "is_valid": False}

        self.lantern_visits_remaining = max(0, self.lantern_visits_remaining - 1)
        if self.lantern_visits_remaining == 0 and len(self.found_relics) < len(self.findings):
            # If all visits used without finding all relics, house claims victory
            self.is_game_over = True

        return {
            "scan_id": self.scan_id,
            "room_name": room_name,
            "room": self.rooms_public[room_name],
            "lantern_visits_left": self.lantern_visits_remaining,
            "lifelines_left": self.lifelines_remaining,
            "game_over": self.is_game_over,
            "is_valid": True
        }


    def calculate_warmth(self, room_name: str, x: float, y: float, z: float) -> Dict[str, Any]:
        """
        Calculates heat/proximity quantized to 5 levels (0.0, 0.25, 0.5, 0.75, 1.0).
        Clamps coordinates to room bounds, rate-limits per session, and never leaks object identity or coordinates.
        """
        now = time.time()
        # Rate limit: minimum 150ms between recalculations per session
        if (now - self.last_warmth_time) < 0.15:
            return self.last_warmth_result

        if room_name not in self.rooms_server_truth:
            result = {"warmth": 0.0, "has_relics": False}
            self.last_warmth_time = now
            self.last_warmth_result = result
            return result

        # Clamp player coordinates to 3D room boundaries (-5.8m to 5.8m)
        clamped_x = max(-5.8, min(5.8, float(x)))
        clamped_y = max(0.0, min(3.5, float(y)))
        clamped_z = max(-5.8, min(5.8, float(z)))

        room_truth = self.rooms_server_truth[room_name]
        
        # Find all un-cleansed real objects in this room
        unfound_real_positions = []
        for obj_id, obj_data in room_truth.items():
            click_key = f"{room_name}:{obj_id}"
            if obj_data.get("is_real") and click_key not in self.clicked_objects:
                pos = obj_data.get("position", [0, 0, 0])
                unfound_real_positions.append(pos)

        if not unfound_real_positions:
            result = {"warmth": 0.0, "has_relics": False}
            self.last_warmth_time = now
            self.last_warmth_result = result
            return result

        # Calculate minimum Euclidean distance in 3D
        min_distance = 999.0
        for rx, ry, rz in unfound_real_positions:
            dist = ((clamped_x - rx) ** 2 + (clamped_y - ry) ** 2 + (clamped_z - rz) ** 2) ** 0.5
            if dist < min_distance:
                min_distance = dist

        # Range: <= 1.5m -> 1.0 (Maximum panic heartbeat), >= 8.0m -> 0.0
        if min_distance <= 1.5:
            raw_warmth = 1.0
        elif min_distance >= 8.0:
            raw_warmth = 0.0
        else:
            raw_warmth = 1.0 - ((min_distance - 1.5) / (8.0 - 1.5))

        # Quantize to 5 coarse discrete levels: [0.0, 0.25, 0.5, 0.75, 1.0]
        clamped_raw = max(0.0, min(1.0, raw_warmth))
        quantized_warmth = round(clamped_raw * 4) / 4.0

        result = {
            "warmth": quantized_warmth,
            "has_relics": True
        }
        self.last_warmth_time = now
        self.last_warmth_result = result
        return result




class SessionStore:
    """Thread-safe in-memory store for active game sessions."""
    def __init__(self):
        self._sessions: Dict[str, GameSession] = {}

    def _prune_expired_sessions(self):
        """Removes sessions older than SESSION_EXPIRY_SECONDS."""
        now = time.time()
        expired = [sid for sid, s in self._sessions.items() if (now - s.created_at) > SESSION_EXPIRY_SECONDS]
        for sid in expired:
            del self._sessions[sid]

    def create_session(
        self,
        repo_path: Path,
        repo_target: str,
        role: RoleType,
        fallback_reason: Optional[str] = None,
        timing_metrics: Optional[Dict[str, float]] = None
    ) -> GameSession:
        self._prune_expired_sessions()
        scan_id = f"mansion_{uuid.uuid4().hex[:8]}"
        metrics = timing_metrics or {}

        # 1. Measure all 3 roles to populate presence levels
        t_detect = time.time()
        role_findings: Dict[RoleType, List[Finding]] = {}
        role_presence: Dict[str, str] = {}
        total_findings_all_roles = 0

        for r in [RoleType.GHOST, RoleType.REAPER, RoleType.SKELETON]:
            rf = default_scanner.scan_repository(repo_path, role=r)
            role_findings[r] = rf
            total_findings_all_roles += len(rf)
            if len(rf) >= 3:
                role_presence[r.value] = "strong"
            elif len(rf) >= 1:
                role_presence[r.value] = "faint"
            else:
                role_presence[r.value] = "none"

        metrics["detector_scan_sec"] = round(time.time() - t_detect, 3)

        session = GameSession(
            scan_id=scan_id,
            repo_target=repo_target,
            role=role,
            fallback_reason=fallback_reason,
            timing_metrics=metrics,
            role_presence=role_presence
        )

        findings = role_findings.get(role, [])

        # 2. Minimum-findings Fallback for chosen role
        if len(findings) < 3:
            all_agnostic = default_scanner.scan_repository(repo_path, role=None)
            for f in all_agnostic:
                if f not in findings:
                    findings.append(f)
                if len(findings) >= 3:
                    break

        # 3. Suspiciously clean check: ONLY if entire repo across ALL roles has < 3 findings
        if total_findings_all_roles < 3:
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
        self._prune_expired_sessions()
        return self._sessions.get(scan_id)

    def evaluate_object_click(self, scan_id: str, room_name: str, object_id: str) -> Dict[str, Any]:
        session = self.get_session(scan_id)
        if not session:
            return {"error": "Session not found", "is_valid": False}

        if session.is_game_over:
            return {
                "error": "Game over. All candles have been extinguished.",
                "game_over": True,
                "is_valid": False,
                "lifelines_left": 0,
                "current_score": session.score
            }

        if room_name not in session.rooms_server_truth:
            return {"error": "Invalid room name", "is_valid": False}

        room_truth = session.rooms_server_truth[room_name]
        if object_id not in room_truth:
            return {"error": "Object not found in room", "is_valid": False}

        # Idempotency: return existing result if already clicked
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
                "game_over": False,
                "message": f"Relic Uncovered: {finding['type']} in {finding['file']}!"
            }
        else:
            # Trigger jump scare and decrease lifeline
            session.lifelines_remaining = max(0, session.lifelines_remaining - 1)
            if session.lifelines_remaining == 0:
                session.is_game_over = True

            scare_index = len(session.clicked_objects) % len(JUMP_SCARE_TYPES)
            scare_type = JUMP_SCARE_TYPES[scare_index]

            result = {
                "is_real": False,
                "relic": None,
                "points_earned": 0,
                "current_score": session.score,
                "lifelines_left": session.lifelines_remaining,
                "jump_scare_type": scare_type,
                "game_over": session.is_game_over,
                "message": "Decoy! The house screeches at you. 1 candle extinguished."
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
        is_finished = session.is_game_over or (total_relics > 0 and found_count == total_relics)

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

        # Compute missed relics only if the game has ended (victory or defeat). Never leak mid-game.
        found_ids = {r["id"] for r in session.found_relics if "id" in r}
        if is_finished:
            missed_relics = [f.model_dump() for f in session.findings if f.id not in found_ids]
        else:
            missed_relics = []

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
            "is_game_finished": is_finished,
            "is_suspiciously_clean": session.is_suspiciously_clean
        }



# Global in-memory session manager
game_sessions = SessionStore()

"""
Mansion Room Builder & 3D Object Spatial Layout Engine.
Dynamically balances repository files across 5 rooms, assigns 3D coordinates, and generates whispers & riddles.
"""
import random
from pathlib import Path
from typing import List, Dict, Any, Tuple
from detectors.base import Finding, get_scan_files, should_ignore_path
from detectors.registry import map_file_to_room

ROOM_NAMES = ["library", "cellar", "chapel", "study", "attic"]

ROOM_METADATA = {
    "library": {
        "title": "The Grand Library",
        "description": "Towering bookshelves, floating parchment pages, and shifting ladders.",
        "theme_color": "#38bdf8",
        "default_riddle": "Ancient scrolls hold logic that loops into madness.",
    },
    "cellar": {
        "title": "The Forgotten Cellar",
        "description": "Dripping water, rusted barrels, and eerie emerald glow.",
        "theme_color": "#22c55e",
        "default_riddle": "Deep in the stone, corrupted queries breach the foundation.",
    },
    "chapel": {
        "title": "The Stained Chapel",
        "description": "Cracked stained glass, blood-red lighting, and a silent organ.",
        "theme_color": "#ef4444",
        "default_riddle": "A sacred door was left unlocked to any wandering wraith.",
    },
    "study": {
        "title": "The Haunted Study",
        "description": "A heavy oak desk, flickering candle, and open haunted diary.",
        "theme_color": "#eab308",
        "default_riddle": "Words written in dust test truths never spoken.",
    },
    "attic": {
        "title": "The Cobwebbed Attic",
        "description": "Creaking floorboards, forgotten relics, and a swinging naked bulb.",
        "theme_color": "#a855f7",
        "default_riddle": "Forgotten tools open passageways that are never closed.",
    }
}

OBJECT_MODELS = ["chest", "portrait", "mirror", "clock", "doll", "skull", "cauldron", "tome"]

# 3D spatial positions around the room perimeter in meters [x, y, z]
SPATIAL_COORDINATES = [
    [-3.2, 0.0, -2.5],
    [3.2, 0.0, -2.5],
    [-2.8, 0.0, 2.8],
    [2.8, 0.0, 2.8],
    [0.0, 0.0, -4.2],
    [0.0, 0.0, 3.8],
]

ROOM_COORDINATES = {
    "study": [
        [-7.1, 0.78, -6.1],
        [-5.0, 0.85, -7.2],
        [-9.2, 0.95, -4.6],
        [-8.5, 0.45, -6.8],
        [-6.0, 0.78, -6.1],
        [-5.2, 0.0, -5.2],
    ],
    "library": [
        [-6.9, 0.45, 4.6],
        [-6.4, 0.9, 2.8],
        [-9.2, 1.2, 7.0],
        [-5.6, 0.5, 6.9],
        [-8.9, 0.5, 3.5],
        [-7.8, 0.45, 4.6],
    ],
    "chapel": [
        [6.5, 0.78, 5.0],
        [5.5, 0.78, 5.0],
        [7.5, 0.78, 5.0],
        [9.2, 1.1, 3.4],
        [4.0, 1.2, 7.0],
        [6.5, 0.78, 5.8],
    ],
    "attic": [
        [-3.45, 1.1, -7.1],
        [-0.6, 0.55, -5.5],
        [0.9, 0.6, -7.2],
        [2.2, 1.1, -5.0],
        [-2.0, 0.4, -6.5],
        [0.0, 0.55, -6.0],
    ],
    "cellar": [
        [5.6, 0.78, -3.6],
        [6.6, 0.95, -7.0],
        [9.2, 0.95, -6.0],
        [9.2, 0.95, -4.0],
        [7.2, 0.78, -3.6],
        [5.0, 0.95, -7.0],
    ],
}

RIDDLE_TEMPLATES = {
    "unclosed_file": "Something here opens a door and never closes it.",
    "bare_except": "A desperate cry swallows every scream without question.",
    "mutable_default": "A container retains past sins across multiple lifetimes.",
    "unreachable_code": "Steps lead into the dark after the journey has already ended.",
    "hardcoded_secret": "A secret was whispered in plain sight upon the stone.",
    "eval_exec": "A cursed mirror executes whatever phrase is spoken to it.",
    "shell_injection": "An open window invites the storm directly inside.",
    "sql_injection": "Words stitched with strings crumble the temple walls.",
    "debug_mode": "The curtains were left wide open to the cold night.",
    "high_complexity": "A labyrinth with a dozen branching pathways traps the mind.",
    "dead_code": "A spectral chamber exists that no living soul ever visits.",
    "vague_naming": "Shadows without true names obscure the path forward.",
    "todo_comment": "An unfinished promise was abandoned to rot.",
    "committed_env_file": "A ledger of forbidden keys rests upon the table."
}


def balance_files_across_rooms(repo_path: Path, findings: List[Finding]) -> Dict[str, List[Path]]:
    """
    Groups repository files into 5 rooms dynamically.
    Ensures no room is left empty when there are sufficient files.
    """
    all_files = get_scan_files(repo_path)
    if not all_files:
        # Fallback dummy files if directory is empty
        all_files = [repo_path / f"file_{i}.py" for i in range(5)]

    room_files: Dict[str, List[Path]] = {r: [] for r in ROOM_NAMES}

    # Step 1: Initial mapping by folder heuristic
    for f in all_files:
        rel_str = str(f.relative_to(repo_path)).replace("\\", "/")
        assigned_room = map_file_to_room(rel_str)
        room_files[assigned_room].append(f)

    # Step 2: Iterative balancing — distribute files evenly across all 5 rooms so no room is left sparse
    if len(all_files) >= 5:
        for _ in range(len(all_files) * 2):
            emptiest_room = min(ROOM_NAMES, key=lambda r: len(room_files[r]))
            fullest_room = max(ROOM_NAMES, key=lambda r: len(room_files[r]))
            if len(room_files[fullest_room]) - len(room_files[emptiest_room]) > 1 and len(room_files[fullest_room]) > 2:
                moved = room_files[fullest_room].pop()
                room_files[emptiest_room].append(moved)
            else:
                break

    # If any room still has fewer than 3 files, borrow healthy files as decoys
    for room in ROOM_NAMES:
        if len(room_files[room]) < 3:
            available = [f for f in all_files if f not in room_files[room]]
            if not available:
                available = list(all_files)
            while len(room_files[room]) < min(4, len(all_files)) and available:
                room_files[room].append(available.pop(0))

    return room_files


def calculate_whisper_signal(findings_count: int, seed: int = 42) -> Dict[str, str]:
    """
    Computes atmospheric whisper signal with slight seeded variation.
    >= 3 problems: Cold spot (severe)
    2 problems: Scratching in the walls (moderate)
    1 problem: Flickering lights (minor)
    0 problems: Silence (clean)
    """
    if findings_count >= 3:
        signal = "cold_spot"
        text = "❄️ Cold spot: The air drops to freezing. Multiple spirits haunt this room."
    elif findings_count == 2:
        signal = "scratching"
        text = "🐀 Scratching in the walls: Uneasy rhythms echo from behind the plaster."
    elif findings_count == 1:
        signal = "flickering_lights"
        text = "💡 Flickering lights: Subtle shadows dance across the floorboards."
    else:
        signal = "silence"
        text = "🤫 Silence: A calm draft... but stay vigilant."

    return {
        "signal": signal,
        "text": text,
        "intensity": min(findings_count, 3)
    }


def generate_room_riddle(room_name: str, room_findings: List[Finding]) -> str:
    """Generates an atmospheric riddle for the room wall based on the room's bug types."""
    if room_findings:
        primary_finding = room_findings[0]
        if primary_finding.type in RIDDLE_TEMPLATES:
            return RIDDLE_TEMPLATES[primary_finding.type]
    return ROOM_METADATA[room_name]["default_riddle"]


def build_room_objects(
    room_name: str,
    files: List[Path],
    repo_path: Path,
    findings: List[Finding]
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    """
    Builds 4 to 6 3D room objects.
    Public objects return to browser WITHOUT 'is_real' or 'finding' payloads.
    Server-side map retains real vs decoy mapping for /api/check.
    """
    # Finding lookup by relative file
    findings_by_file: Dict[str, Finding] = {}
    for f in findings:
        findings_by_file[f.file] = f

    # Select up to 6 files for this room
    selected_files = files[:6]
    random.seed(room_name)
    shuffled_models = list(OBJECT_MODELS)
    random.shuffle(shuffled_models)

    public_objects = []
    server_truth = {}

    for idx, file_path in enumerate(selected_files):
        rel_path = str(file_path.relative_to(repo_path)).replace("\\", "/") if file_path.is_relative_to(repo_path) else file_path.name
        obj_id = f"obj_{room_name}_{idx + 1}"
        room_coords = ROOM_COORDINATES.get(room_name, SPATIAL_COORDINATES)
        pos = room_coords[idx % len(room_coords)]
        model_type = shuffled_models[idx % len(shuffled_models)]

        # Determine if this file holds a real finding
        has_finding = rel_path in findings_by_file
        finding_data = findings_by_file.get(rel_path)

        # Public data (sent to browser)
        public_objects.append({
            "id": obj_id,
            "filename": rel_path,
            "display_name": file_path.name,
            "model_type": model_type,
            "position": pos,
            "glow_color": "#fbbf24"
        })

        # Server-side ground truth (kept secret until clicked)
        server_truth[obj_id] = {
            "is_real": has_finding,
            "finding": finding_data.model_dump() if finding_data else None,
            "filename": rel_path,
            "obj_id": obj_id
        }

    return public_objects, server_truth

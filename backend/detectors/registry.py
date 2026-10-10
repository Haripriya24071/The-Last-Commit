"""
Detector Plugin Registry and Mansion Room Mapper.
Executes detectors and structures findings for game rooms.
"""
from pathlib import Path
from typing import List, Dict, Optional
from .base import BaseDetector, Finding, RoleType
from .tier1_agnostic import AgnosticReaperDetector, AgnosticSkeletonDetector
from .python_ghost import PythonGhostDetector
from .python_reaper import PythonReaperDetector
from .python_skeleton import PythonSkeletonDetector


ROOM_MAPPINGS = {
    "src": "library",
    "app": "library",
    "lib": "library",
    "core": "library",
    
    "auth": "chapel",
    "api": "chapel",
    "security": "chapel",
    
    "db": "cellar",
    "database": "cellar",
    "config": "cellar",
    "data": "cellar",
    "models": "cellar",
    
    "tests": "study",
    "test": "study",
    "docs": "study",
    "spec": "study",
    "doc": "study",
    
    "utils": "attic",
    "scripts": "attic",
    "helpers": "attic",
    "tools": "attic",
}


def map_file_to_room(file_rel_path: str) -> str:
    """Maps a relative file path to one of the 5 mansion rooms."""
    parts = Path(file_rel_path).parts
    if len(parts) > 1:
        top_dir = parts[0].lower()
        if top_dir in ROOM_MAPPINGS:
            return ROOM_MAPPINGS[top_dir]

    # Check for test / doc files in root
    filename_lower = Path(file_rel_path).name.lower()
    if filename_lower.startswith("test_") or filename_lower.endswith("_test.py") or filename_lower.endswith(".md"):
        return "study"
    if "auth" in filename_lower or "token" in filename_lower or "secret" in filename_lower:
        return "chapel"
    if "db" in filename_lower or "database" in filename_lower or "config" in filename_lower or filename_lower.startswith(".env"):
        return "cellar"

    return "attic"


class DetectorRegistry:
    """Manages registered detector plugins and executes repository scans."""

    def __init__(self):
        self._detectors: List[BaseDetector] = [
            # Tier 1 Language-Agnostic Detectors
            AgnosticReaperDetector(),
            AgnosticSkeletonDetector(),
            # Tier 2 Python Plugins
            PythonGhostDetector(),
            PythonReaperDetector(),
            PythonSkeletonDetector(),
        ]

    def register(self, detector: BaseDetector):
        """Registers a new detector plugin dynamically."""
        self._detectors.append(detector)

    def scan_repository(self, repo_path: Path, role: Optional[RoleType] = None) -> List[Finding]:
        """Scans repository using active detectors filtered by role."""
        all_findings: List[Finding] = []
        seen_keys = set()

        for detector in self._detectors:
            if role is not None and detector.role != role:
                continue

            try:
                results = detector.scan(repo_path)
                for finding in results:
                    # Assign room
                    finding.room = map_file_to_room(finding.file)

                    # Deduplicate finding
                    dedup_key = (finding.role, finding.type, finding.file, finding.line)
                    if dedup_key not in seen_keys:
                        seen_keys.add(dedup_key)
                        all_findings.append(finding)
            except Exception as e:
                # Keep scanner robust against individual plugin errors
                print(f"[Scanner] Error in {detector.name}: {e}")

        return all_findings


# Global singleton scanner registry instance
default_scanner = DetectorRegistry()

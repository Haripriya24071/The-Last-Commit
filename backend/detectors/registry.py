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
from .js_ts_detectors import (
    JSEmptyCatchDetector, JSLooseEqualityDetector, JSConsoleLogDetector,
    JSReaperSecurityDetector, TSTypeBypassDetector, JSComplexityDetector
)



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


SEVERITY_RANK = {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 3,
}


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
            # Tier 3 JS/TS Plugins
            JSEmptyCatchDetector(),
            JSLooseEqualityDetector(),
            JSConsoleLogDetector(),
            JSReaperSecurityDetector(),
            TSTypeBypassDetector(),
            JSComplexityDetector(),
        ]


    def register(self, detector: BaseDetector):
        """Registers a new detector plugin dynamically."""
        self._detectors.append(detector)

    def scan_repository(self, repo_path: Path, role: Optional[RoleType] = None, max_findings: int = 10) -> List[Finding]:
        """
        Scans repository using active detectors filtered by role.
        Applies severity prioritization and caps max 3 per defect type for diverse mansion challenges.
        """
        raw_findings: List[Finding] = []
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
                        raw_findings.append(finding)
            except Exception as e:
                print(f"[Scanner] Error in {detector.name}: {e}")

        # 1. Sort by severity (Critical -> High -> Medium -> Low)
        raw_findings.sort(key=lambda f: SEVERITY_RANK.get(f.severity.value, 2))

        # 2. Cap to max 3 findings per type per role
        type_counts: Dict[str, int] = {}
        diverse_findings: List[Finding] = []
        for finding in raw_findings:
            key = f"{finding.role.value}:{finding.type}"
            count = type_counts.get(key, 0)
            if count < 3:
                type_counts[key] = count + 1
                diverse_findings.append(finding)
            if len(diverse_findings) >= max_findings:
                break

        return diverse_findings


# Global singleton scanner registry instance
default_scanner = DetectorRegistry()


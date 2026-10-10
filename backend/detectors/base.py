"""
Standardized Finding Schema and Base Detector Interface.
Provides language-neutral findings and common scanner file filters.
"""
from abc import ABC, abstractmethod
from enum import Enum
from pathlib import Path
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class RoleType(str, Enum):
    GHOST = "ghost"
    REAPER = "reaper"
    SKELETON = "skeleton"


class FindingSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class FindingConfidence(str, Enum):
    CERTAIN = "certain"
    POSSIBLE = "possible"


class Finding(BaseModel):
    """Language-neutral finding representation used across all roles and engines."""
    id: str = Field(description="Unique deterministic ID for the finding")
    role: RoleType = Field(description="Game character role: ghost, reaper, or skeleton")
    language: str = Field(default="generic", description="Language of source file (python, typescript, generic, etc.)")
    type: str = Field(description="Type/category of problem (e.g. unclosed_file, hardcoded_secret, high_complexity)")
    file: str = Field(description="Relative path from repository root")
    line: int = Field(default=1, description="1-indexed line number where the problem occurs")
    snippet: str = Field(description="Code snippet showing the problem (secrets masked)")
    explanation: str = Field(description="Plain-language description of why this is a problem")
    suggestion: str = Field(description="One-line text-only suggestion for fixing the defect")
    severity: FindingSeverity = Field(default=FindingSeverity.MEDIUM, description="Severity ranking")
    confidence: FindingConfidence = Field(default=FindingConfidence.CERTAIN, description="certain or possible")
    room: Optional[str] = Field(default=None, description="Assigned mansion room name")


# Standard directories and lockfiles to ignore across all languages
IGNORED_DIRS = {
    "node_modules", "dist", "build", ".git", ".venv", "venv", "env", "ENV",
    "__pycache__", ".idea", ".vscode", ".pytest_cache", ".ruff_cache",
    ".next", ".nuxt", "coverage", ".turbo", "vendor"
}

IGNORED_FILES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "Pipfile.lock",
    "poetry.lock", "bun.lockb", ".DS_Store", "Thumbs.db"
}


def should_ignore_path(path: Path, repo_root: Path) -> bool:
    """Checks if a path should be skipped by the scanner."""
    try:
        rel_path = path.relative_to(repo_root)
    except ValueError:
        rel_path = path

    for part in rel_path.parts:
        if part in IGNORED_DIRS or part.startswith(".git"):
            return True

    if path.name in IGNORED_FILES:
        return True

    # Ignore binary extensions
    if path.suffix.lower() in {".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".woff", ".woff2", ".ttf", ".eot", ".mp3", ".wav", ".ogg", ".glb", ".gltf", ".bin", ".pyc", ".pyd", ".exe", ".dll", ".so", ".dylib"}:
        return True

    return False


PRIORITY_EXTENSIONS = {
    ".py", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".env", ".yaml", ".yml",
    ".toml", ".ini", ".cfg", ".sql", ".sh", ".md", ".html", ".css"
}

def detect_language_by_extension(path: Path) -> str:
    """Identifies programming language or file format from file suffix."""
    ext = path.suffix.lower()
    if ext == ".py":
        return "python"
    elif ext in {".ts", ".mts", ".cts"}:
        return "typescript"
    elif ext == ".tsx":
        return "typescriptreact"
    elif ext in {".js", ".mjs", ".cjs"}:
        return "javascript"
    elif ext == ".jsx":
        return "javascriptreact"
    elif ext in {".json", ".jsonc"}:
        return "json"
    elif ext in {".yaml", ".yml"}:
        return "yaml"
    elif ext in {".toml", ".ini", ".cfg"}:
        return "config"
    elif ext == ".sql":
        return "sql"
    elif ext in {".sh", ".bash", ".zsh"}:
        return "shell"
    elif ext == ".md":
        return "markdown"
    elif path.name.startswith(".env"):
        return "env"
    return "generic"


def get_scan_files(repo_path: Path, extensions: Optional[set] = None, max_files: int = 400) -> List[Path]:
    """Recursively collects up to max_files prioritized candidate source files in repo_path."""
    valid_files: List[Path] = []
    if not repo_path.exists():
        return valid_files

    for path in repo_path.rglob("*"):
        if path.is_file() and not should_ignore_path(path, repo_path):
            ext = path.suffix.lower()
            if extensions is not None:
                if ext in extensions:
                    valid_files.append(path)
            elif ext in PRIORITY_EXTENSIONS or path.name.startswith(".env"):
                valid_files.append(path)

            if len(valid_files) >= max_files:
                break

    return sorted(valid_files)


def mask_secret(secret_str: str) -> str:
    """Safely masks secret strings for secure screen presentation and logging."""
    if len(secret_str) <= 6:
        return "***"
    return f"{secret_str[:3]}***{secret_str[-3:]}"


class BaseDetector(ABC):
    """Abstract Base Class for all detector plugins."""
    name: str
    role: RoleType

    @abstractmethod
    def scan(self, repo_path: Path) -> List[Finding]:
        """Scans the given repository root path and returns a list of findings."""
        pass

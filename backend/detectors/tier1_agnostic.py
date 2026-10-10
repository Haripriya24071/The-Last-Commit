"""
Tier 1 Language-Agnostic Detectors.
Works across any repository regardless of programming language.
"""
import math
import re
import subprocess
from pathlib import Path
from typing import List, Set
from .base import (
    BaseDetector, Finding, RoleType, FindingSeverity, FindingConfidence,
    get_scan_files, mask_secret, should_ignore_path
)


def calculate_shannon_entropy(data: str) -> float:
    """Calculates the Shannon entropy of a string to detect high-randomness tokens."""
    if not data:
        return 0.0
    entropy = 0.0
    length = len(data)
    frequencies = {char: data.count(char) for char in set(data)}
    for count in frequencies.values():
        probability = count / length
        entropy -= probability * math.log2(probability)
    return entropy


class AgnosticReaperDetector(BaseDetector):
    """
    Tier 1 Reaper (Security Hunter):
    Detects committed .env files, private keys, and secret-shaped strings in any language.
    """
    name = "agnostic_reaper_detector"
    role = RoleType.REAPER

    # Secret assignment regexes for generic code/config
    SECRET_ASSIGN_PATTERNS = [
        re.compile(r"""(?i)(?:api_key|secret_key|auth_secret|access_token|private_key|token|passwd|password)\s*[:=]\s*["']([^"'\s]{10,})["']"""),
        re.compile(r"""(?i)(?:dummy_sk_test_|sec_prod_|ghp_|glpat-|eyJh)[a-zA-Z0-9_\-]{8,}"""),
        re.compile(r"""-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"""),
    ]

    def scan(self, repo_path: Path) -> List[Finding]:
        findings: List[Finding] = []
        if not repo_path.exists():
            return findings

        finding_counter = 1

        # 1. Detect committed .env files
        for env_candidate in repo_path.rglob("*"):
            if env_candidate.is_file() and not should_ignore_path(env_candidate, repo_path):
                name_lower = env_candidate.name.lower()
                if name_lower == ".env" or (name_lower.startswith(".env.") and not name_lower.endswith(".example")):
                    rel_file = str(env_candidate.relative_to(repo_path)).replace("\\", "/")
                    findings.append(Finding(
                        id=f"reaper_env_{finding_counter}",
                        role=RoleType.REAPER,
                        language="generic",
                        type="committed_env_file",
                        file=rel_file,
                        line=1,
                        snippet=f"{env_candidate.name} committed in repository",
                        explanation=f"Committed {env_candidate.name} file can leak sensitive credentials and environment configs.",
                        suggestion="Add .env files to .gitignore and use environment variables.",
                        severity=FindingSeverity.HIGH,
                        confidence=FindingConfidence.CERTAIN
                    ))
                    finding_counter += 1

        # 2. Detect secret patterns in all source/config files
        files = get_scan_files(repo_path)
        for file_path in files:
            # Skip documentation or Markdown files from secret string checks to avoid false positives on docs
            if file_path.suffix.lower() in {".md", ".txt", ".rst"}:
                continue

            rel_file = str(file_path.relative_to(repo_path)).replace("\\", "/")
            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

            lines = content.splitlines()
            for line_idx, line in enumerate(lines, start=1):
                # Avoid checking comments
                stripped = line.strip()
                if stripped.startswith("//") or stripped.startswith("#") or stripped.startswith("*"):
                    continue

                for pattern in self.SECRET_ASSIGN_PATTERNS:
                    match = pattern.search(line)
                    if match:
                        matched_str = match.group(0)
                        masked_line = line.replace(matched_str, mask_secret(matched_str))
                        findings.append(Finding(
                            id=f"reaper_secret_{finding_counter}",
                            role=RoleType.REAPER,
                            language="generic",
                            type="hardcoded_secret",
                            file=rel_file,
                            line=line_idx,
                            snippet=masked_line.strip(),
                            explanation="Plain-text secret or credential hardcoded directly in source code.",
                            suggestion="Store secrets securely in environment variables or a secrets manager.",
                            severity=FindingSeverity.CRITICAL,
                            confidence=FindingConfidence.CERTAIN
                        ))
                        finding_counter += 1
                        break  # One finding per line

        return findings


class AgnosticSkeletonDetector(BaseDetector):
    """
    Tier 1 Skeleton (The Code Judge):
    Detects abandoned TODOs/FIXMEs, giant bloated files, missing README/tests, and weak commits.
    """
    name = "agnostic_skeleton_detector"
    role = RoleType.SKELETON

    TODO_PATTERN = re.compile(r"""(?i)\b(TODO|FIXME|HACK|XXX)\b\s*[:\-]?(.*)""")
    WEAK_COMMIT_MESSAGES = {"wip", "fix", "fixed", "update", "updates", "test", "asdf", "temp", "changes", "commit", "save"}

    def scan(self, repo_path: Path) -> List[Finding]:
        findings: List[Finding] = []
        if not repo_path.exists():
            return findings

        finding_counter = 1
        files = get_scan_files(repo_path)

        # 1. Check for missing README
        has_readme = any(
            f.name.lower().startswith("readme") and not should_ignore_path(f, repo_path)
            for f in repo_path.iterdir() if f.is_file()
        )
        if not has_readme:
            findings.append(Finding(
                id=f"skeleton_missing_readme_{finding_counter}",
                role=RoleType.SKELETON,
                language="generic",
                type="missing_readme",
                file="README.md",
                line=1,
                snippet="No README.md discovered in root directory",
                explanation="Repository lacks documentation explaining what this project does and how to run it.",
                suggestion="Create a comprehensive README.md with setup, usage, and architecture overview.",
                severity=FindingSeverity.MEDIUM,
                confidence=FindingConfidence.CERTAIN
            ))
            finding_counter += 1

        # 2. Check for missing Tests directory
        has_tests = any(
            part.lower() in {"test", "tests", "__tests__", "spec"}
            for f in files for part in f.relative_to(repo_path).parts
        )
        if not has_tests and len(files) > 3:
            findings.append(Finding(
                id=f"skeleton_missing_tests_{finding_counter}",
                role=RoleType.SKELETON,
                language="generic",
                type="missing_tests",
                file="tests/",
                line=1,
                snippet="No automated test suite discovered",
                explanation="No unit or integration tests found in the project.",
                suggestion="Add automated unit tests in a tests/ directory.",
                severity=FindingSeverity.MEDIUM,
                confidence=FindingConfidence.POSSIBLE
            ))
            finding_counter += 1

        # 3. Check for TODOs / FIXMEs and bloated files
        for file_path in files:
            rel_file = str(file_path.relative_to(repo_path)).replace("\\", "/")
            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

            lines = content.splitlines()

            # Oversized file check (> 350 lines)
            if len(lines) > 350:
                findings.append(Finding(
                    id=f"skeleton_oversized_file_{finding_counter}",
                    role=RoleType.SKELETON,
                    language="generic",
                    type="oversized_file",
                    file=rel_file,
                    line=1,
                    snippet=f"File length: {len(lines)} lines",
                    explanation=f"File is overly long ({len(lines)} lines), violating single responsibility principles.",
                    suggestion="Split large modules into smaller, focused single-purpose components.",
                    severity=FindingSeverity.LOW,
                    confidence=FindingConfidence.CERTAIN
                ))
                finding_counter += 1

            # TODO/FIXME check
            for line_idx, line in enumerate(lines, start=1):
                match = self.TODO_PATTERN.search(line)
                if match:
                    tag = match.group(1).upper()
                    rest = match.group(2).strip()
                    findings.append(Finding(
                        id=f"skeleton_todo_{finding_counter}",
                        role=RoleType.SKELETON,
                        language="generic",
                        type="todo_comment",
                        file=rel_file,
                        line=line_idx,
                        snippet=line.strip()[:100],
                        explanation=f"Unresolved {tag} marker left abandoned in codebase.",
                        suggestion=f"Implement or resolve the technical debt in: {rest or tag}",
                        severity=FindingSeverity.LOW,
                        confidence=FindingConfidence.CERTAIN
                    ))
                    finding_counter += 1

        # 4. Check for weak git commit messages (if local repo contains .git)
        git_dir = repo_path / ".git"
        if git_dir.exists():
            try:
                git_log_res = subprocess.run(
                    ["git", "log", "-n", "15", "--pretty=format:%h|||%s"],
                    cwd=repo_path,
                    capture_output=True,
                    text=True,
                    timeout=3
                )
                if git_log_res.returncode == 0 and git_log_res.stdout:
                    for log_line in git_log_res.stdout.splitlines():
                        if "|||" in log_line:
                            commit_hash, subject = log_line.split("|||", 1)
                            clean_subject = subject.strip().lower()
                            if clean_subject in self.WEAK_COMMIT_MESSAGES or len(clean_subject) <= 3:
                                findings.append(Finding(
                                    id=f"skeleton_weak_commit_{finding_counter}",
                                    role=RoleType.SKELETON,
                                    language="generic",
                                    type="weak_commit_message",
                                    file="git_history",
                                    line=1,
                                    snippet=f"Commit {commit_hash}: \"{subject}\"",
                                    explanation=f"Vague, uninformative git commit message: '{subject}'.",
                                    suggestion="Use descriptive commit messages explaining what changed and why.",
                                    severity=FindingSeverity.LOW,
                                    confidence=FindingConfidence.CERTAIN
                                ))
                                finding_counter += 1
            except Exception:
                pass

        return findings

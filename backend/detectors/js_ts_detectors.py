"""
JavaScript and TypeScript Static Analysis Detectors.
Detects ghost bugs, security vulnerabilities (Reaper), and technical debt (Skeleton) in JS/TS/JSX/TSX codebases.
"""
import re
from pathlib import Path
from typing import List
from .base import (
    BaseDetector, Finding, RoleType, FindingSeverity, FindingConfidence,
    detect_language_by_extension, get_scan_files
)

JS_TS_EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"}


def get_js_ts_files(repo_path: Path) -> List[Path]:
    """Returns prioritized JS/TS source files excluding build and node_modules directories."""
    return get_scan_files(repo_path, extensions=JS_TS_EXTENSIONS)


class JSEmptyCatchDetector(BaseDetector):
    """Detects empty catch blocks that silently swallow runtime exceptions in JS/TS."""
    name = "js_empty_catch"
    role = RoleType.GHOST

    def scan(self, repo_path: Path) -> List[Finding]:
        findings: List[Finding] = []
        files = get_js_ts_files(repo_path)

        for file_path in files:
            try:
                rel_path = str(file_path.relative_to(repo_path)).replace("\\", "/")
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                lines = content.splitlines()

                # Regex for catch with empty body: catch(...) {} or catch {}
                empty_catch_pattern = re.compile(r'catch\s*(?:\([^)]*\))?\s*\{\s*\}')

                for line_idx, line in enumerate(lines, start=1):
                    # Strip single line comments
                    code_part = re.sub(r'//.*$', '', line)
                    if empty_catch_pattern.search(code_part):
                        findings.append(Finding(
                            id=f"js-empty-catch-{rel_path}-{line_idx}",
                            role=self.role,
                            language=detect_language_by_extension(file_path),
                            type="empty_catch_block",
                            file=rel_path,
                            line=line_idx,
                            snippet=line.strip(),
                            explanation="Empty catch block silently suppresses errors, hiding unexpected crashes and failing silently.",
                            suggestion="Log the caught error with console.error or handle the exception appropriately.",
                            severity=FindingSeverity.HIGH,
                            confidence=FindingConfidence.CERTAIN
                        ))
                    elif "catch" in code_part and "{" in code_part:
                        # Check multi-line empty catch: catch(...) {\n  // comment\n}
                        if line_idx < len(lines):
                            next_line = lines[line_idx].strip()
                            if next_line == "}" or (next_line.startswith("//") and line_idx + 1 < len(lines) and lines[line_idx + 1].strip() == "}"):
                                findings.append(Finding(
                                    id=f"js-empty-catch-multi-{rel_path}-{line_idx}",
                                    role=self.role,
                                    language=detect_language_by_extension(file_path),
                                    type="empty_catch_block",
                                    file=rel_path,
                                    line=line_idx,
                                    snippet=f"{line.strip()} {next_line}",
                                    explanation="Empty catch block silently suppresses errors, hiding unexpected crashes and failing silently.",
                                    suggestion="Log the caught error with console.error or handle the exception appropriately.",
                                    severity=FindingSeverity.HIGH,
                                    confidence=FindingConfidence.CERTAIN
                                ))
            except Exception as e:
                print(f"[JSEmptyCatchDetector] Error scanning {file_path}: {e}")

        return findings

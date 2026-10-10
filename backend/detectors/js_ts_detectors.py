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


class JSLooseEqualityDetector(BaseDetector):
    """Detects loose equality (==, !=) comparisons that cause type coercion bugs."""
    name = "js_loose_equality"
    role = RoleType.GHOST

    def scan(self, repo_path: Path) -> List[Finding]:
        findings: List[Finding] = []
        files = get_js_ts_files(repo_path)

        for file_path in files:
            try:
                rel_path = str(file_path.relative_to(repo_path)).replace("\\", "/")
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                lines = content.splitlines()

                for line_idx, line in enumerate(lines, start=1):
                    # Strip single-line comments
                    code_part = re.sub(r'//.*$', '', line)
                    if not code_part.strip():
                        continue

                    # Match loose equality (== or !=) but not strict (=== or !==) or arrow functions/assignments (=>, == null)
                    # Look for [^!=]==[^=] or [^!]!=[^=]
                    matches = list(re.finditer(r'(?<![!=])(==|!=)(?!=)', code_part))
                    for m in matches:
                        op = m.group(1)
                        # Extract surrounding snippet
                        start = max(0, m.start() - 15)
                        end = min(len(code_part), m.end() + 15)
                        snippet_part = code_part[start:end].strip()

                        # Skip common idiomatic '== null' checks if present
                        if "== null" in code_part or "!= null" in code_part:
                            continue

                        findings.append(Finding(
                            id=f"js-loose-eq-{rel_path}-{line_idx}-{m.start()}",
                            role=self.role,
                            language=detect_language_by_extension(file_path),
                            type="loose_equality_comparison",
                            file=rel_path,
                            line=line_idx,
                            snippet=line.strip()[:80],
                            explanation=f"Loose equality operator '{op}' performs unintended JavaScript type coercion.",
                            suggestion=f"Replace '{op}' with strict comparison '{op}=' to prevent unexpected type coercion.",
                            severity=FindingSeverity.MEDIUM,
                            confidence=FindingConfidence.CERTAIN
                        ))
                        break # Cap at 1 per line
            except Exception as e:
                print(f"[JSLooseEqualityDetector] Error scanning {file_path}: {e}")

        return findings


class JSConsoleLogDetector(BaseDetector):
    """Detects leftover console.log / console.debug calls in production JS/TS files."""
    name = "js_console_log"
    role = RoleType.SKELETON

    def scan(self, repo_path: Path) -> List[Finding]:
        findings: List[Finding] = []
        files = get_js_ts_files(repo_path)

        for file_path in files:
            # Skip test files
            rel_path_str = str(file_path.relative_to(repo_path)).replace("\\", "/").lower()
            if "test" in rel_path_str or "spec" in rel_path_str or "mock" in rel_path_str:
                continue

            try:
                rel_path = str(file_path.relative_to(repo_path)).replace("\\", "/")
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                lines = content.splitlines()

                log_pattern = re.compile(r'\bconsole\.(?:log|debug|dir|trace)\s*\(')

                for line_idx, line in enumerate(lines, start=1):
                    code_part = re.sub(r'//.*$', '', line)
                    if log_pattern.search(code_part):
                        findings.append(Finding(
                            id=f"js-console-log-{rel_path}-{line_idx}",
                            role=self.role,
                            language=detect_language_by_extension(file_path),
                            type="leftover_console_log",
                            file=rel_path,
                            line=line_idx,
                            snippet=line.strip()[:80],
                            explanation="Leftover debug console logging statement in production source code.",
                            suggestion="Remove the console.log call or route messages through a dedicated logger.",
                            severity=FindingSeverity.LOW,
                            confidence=FindingConfidence.CERTAIN
                        ))
            except Exception as e:
                print(f"[JSConsoleLogDetector] Error scanning {file_path}: {e}")

        return findings


class JSReaperSecurityDetector(BaseDetector):
    """Detects severe security risks in JS/TS: eval, new Function, dangerouslySetInnerHTML, and raw document.write."""
    name = "js_reaper_security"
    role = RoleType.REAPER

    def scan(self, repo_path: Path) -> List[Finding]:
        findings: List[Finding] = []
        files = get_js_ts_files(repo_path)

        for file_path in files:
            try:
                rel_path = str(file_path.relative_to(repo_path)).replace("\\", "/")
                content = file_path.read_text(encoding="utf-8", errors="ignore")
                lines = content.splitlines()

                for line_idx, line in enumerate(lines, start=1):
                    code_part = re.sub(r'//.*$', '', line)

                    # 1. eval()
                    if re.search(r'\beval\s*\(', code_part):
                        findings.append(Finding(
                            id=f"js-reaper-eval-{rel_path}-{line_idx}",
                            role=self.role,
                            language=detect_language_by_extension(file_path),
                            type="dangerous_eval_execution",
                            file=rel_path,
                            line=line_idx,
                            snippet=line.strip()[:80],
                            explanation="Arbitrary code execution via eval() allows code injection and remote exploit execution.",
                            suggestion="Eliminate eval() by parsing structured data with JSON.parse or using standard logic.",
                            severity=FindingSeverity.CRITICAL,
                            confidence=FindingConfidence.CERTAIN
                        ))

                    # 2. dangerouslySetInnerHTML
                    elif "dangerouslySetInnerHTML" in code_part:
                        findings.append(Finding(
                            id=f"js-reaper-dangerouslyset-{rel_path}-{line_idx}",
                            role=self.role,
                            language=detect_language_by_extension(file_path),
                            type="dangerously_set_inner_html",
                            file=rel_path,
                            line=line_idx,
                            snippet=line.strip()[:80],
                            explanation="Raw HTML injection via dangerouslySetInnerHTML opens the application to Cross-Site Scripting (XSS).",
                            suggestion="Sanitize markup with DOMPurify or render sanitized React element trees instead.",
                            severity=FindingSeverity.HIGH,
                            confidence=FindingConfidence.CERTAIN
                        ))

                    # 3. new Function(...)
                    elif re.search(r'new\s+Function\s*\(', code_part):
                        findings.append(Finding(
                            id=f"js-reaper-new-func-{rel_path}-{line_idx}",
                            role=self.role,
                            language=detect_language_by_extension(file_path),
                            type="dangerous_function_constructor",
                            file=rel_path,
                            line=line_idx,
                            snippet=line.strip()[:80],
                            explanation="Dynamic code generation via Function constructor is equivalent to eval and creates injection vulnerabilities.",
                            suggestion="Refactor logic to invoke pre-defined functions rather than building strings dynamically.",
                            severity=FindingSeverity.HIGH,
                            confidence=FindingConfidence.CERTAIN
                        ))
            except Exception as e:
                print(f"[JSReaperSecurityDetector] Error scanning {file_path}: {e}")

        return findings




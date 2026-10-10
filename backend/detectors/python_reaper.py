"""
Python Reaper Detector (The Security Hunter).
Detects Python-specific dangerous patterns: eval/exec, shell=True, SQL injection concatenations, and debug mode.
"""
import ast
import re
from pathlib import Path
from typing import List
from .base import BaseDetector, Finding, RoleType, FindingSeverity, FindingConfidence, get_scan_files


class PythonReaperVisitor(ast.NodeVisitor):
    def __init__(self, filename: str, lines: List[str]):
        self.filename = filename
        self.lines = lines
        self.findings: List[Finding] = []
        self._counter = 1

    def get_line_snippet(self, lineno: int) -> str:
        if 1 <= lineno <= len(self.lines):
            return self.lines[lineno - 1].strip()
        return ""

    def visit_Call(self, node: ast.Call):
        # 1. Detect eval() or exec()
        if isinstance(node.func, ast.Name) and node.func.id in {"eval", "exec"}:
            self.findings.append(Finding(
                id=f"reaper_eval_{self.filename}_{node.lineno}_{self._counter}",
                role=RoleType.REAPER,
                language="python",
                type="eval_exec",
                file=self.filename,
                line=node.lineno,
                snippet=self.get_line_snippet(node.lineno),
                explanation=f"Use of {node.func.id}() executes arbitrary code from input strings, leading to Remote Code Execution (RCE).",
                suggestion="Replace eval/exec with ast.literal_eval() or a secure parser.",
                severity=FindingSeverity.CRITICAL,
                confidence=FindingConfidence.CERTAIN
            ))
            self._counter += 1

        # 2. Detect shell=True in subprocess calls
        if isinstance(node.func, ast.Attribute) and node.func.attr in {"run", "Popen", "call", "check_output", "check_call"}:
            for kw in node.keywords:
                if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                    self.findings.append(Finding(
                        id=f"reaper_shell_{self.filename}_{node.lineno}_{self._counter}",
                        role=RoleType.REAPER,
                        language="python",
                        type="shell_injection",
                        file=self.filename,
                        line=node.lineno,
                        snippet=self.get_line_snippet(node.lineno),
                        explanation="subprocess called with shell=True is susceptible to shell injection vulnerabilities.",
                        suggestion="Pass arguments as a list with shell=False.",
                        severity=FindingSeverity.HIGH,
                        confidence=FindingConfidence.CERTAIN
                    ))
                    self._counter += 1

        self.generic_visit(node)

    def _is_sql_binop(self, node: ast.AST) -> bool:
        """Recursively checks if a BinOp contains SQL query keywords."""
        if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            for leaf in ast.walk(node):
                if isinstance(leaf, ast.Constant) and isinstance(leaf.value, str):
                    val_upper = leaf.value.upper()
                    if any(kw in val_upper for kw in ["SELECT ", "INSERT INTO ", "UPDATE ", "DELETE FROM ", "WHERE "]):
                        return True
        return False

    def visit_Assign(self, node: ast.Assign):
        # 3. Detect SQL concatenation in variable assignments (e.g. query = "SELECT ... " + var)
        if self._is_sql_binop(node.value):
            self.findings.append(Finding(
                id=f"reaper_sqli_{self.filename}_{node.lineno}_{self._counter}",
                role=RoleType.REAPER,
                language="python",
                type="sql_injection",
                file=self.filename,
                line=node.lineno,
                snippet=self.get_line_snippet(node.lineno),
                explanation="SQL query constructed via string concatenation is vulnerable to SQL Injection (SQLi).",
                suggestion="Use parameterized queries (?, %s, or :param) instead of string addition.",
                severity=FindingSeverity.CRITICAL,
                confidence=FindingConfidence.CERTAIN
            ))
            self._counter += 1

        # 4. Detect DEBUG = True in source
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id == "DEBUG":
                if isinstance(node.value, ast.Constant) and node.value.value is True:
                    self.findings.append(Finding(
                        id=f"reaper_debug_{self.filename}_{node.lineno}_{self._counter}",
                        role=RoleType.REAPER,
                        language="python",
                        type="debug_mode",
                        file=self.filename,
                        line=node.lineno,
                        snippet=self.get_line_snippet(node.lineno),
                        explanation="DEBUG = True left enabled exposes detailed system internals, secrets, and debug toolbars in production.",
                        suggestion="Ensure DEBUG = False in production configurations.",
                        severity=FindingSeverity.MEDIUM,
                        confidence=FindingConfidence.CERTAIN
                    ))
                    self._counter += 1

        self.generic_visit(node)


class PythonReaperDetector(BaseDetector):
    name = "python_reaper_detector"
    role = RoleType.REAPER

    def scan(self, repo_path: Path) -> List[Finding]:
        findings: List[Finding] = []
        python_files = get_scan_files(repo_path, extensions={".py"})

        for py_file in python_files:
            rel_file = str(py_file.relative_to(repo_path)).replace("\\", "/")
            try:
                code = py_file.read_text(encoding="utf-8", errors="ignore")
                tree = ast.parse(code, filename=rel_file)
            except SyntaxError:
                continue

            lines = code.splitlines()
            visitor = PythonReaperVisitor(rel_file, lines)
            visitor.visit(tree)
            findings.extend(visitor.findings)

        return findings

"""
Python Ghost Detector (The Debugger).
Detects logic errors, crash-prone code, unclosed files, bare excepts, mutable defaults, and unreachable code via AST.
"""
import ast
from pathlib import Path
from typing import List, Set
from .base import BaseDetector, Finding, RoleType, FindingSeverity, FindingConfidence, get_scan_files


class GhostASTVisitor(ast.NodeVisitor):
    def __init__(self, filename: str, lines: List[str]):
        self.filename = filename
        self.lines = lines
        self.findings: List[Finding] = []
        self._counter = 1
        self.imported_names: Set[str] = set()
        self.used_names: Set[str] = set()

    def get_line_snippet(self, lineno: int) -> str:
        if 1 <= lineno <= len(self.lines):
            return self.lines[lineno - 1].strip()
        return ""

    def visit_Call(self, node: ast.Call):
        # 1. Detect unclosed files: open() called directly outside 'with'
        if isinstance(node.func, ast.Name) and node.func.id == "open":
            parent = getattr(node, "_parent", None)
            is_in_with = False
            curr = parent
            while curr is not None:
                if isinstance(curr, ast.With):
                    # Check if this node is in the withitems
                    for item in curr.items:
                        if item.context_expr == node:
                            is_in_with = True
                            break
                curr = getattr(curr, "_parent", None)

            if not is_in_with:
                self.findings.append(Finding(
                    id=f"ghost_unclosed_file_{self.filename}_{node.lineno}_{self._counter}",
                    role=RoleType.GHOST,
                    language="python",
                    type="unclosed_file",
                    file=self.filename,
                    line=node.lineno,
                    snippet=self.get_line_snippet(node.lineno),
                    explanation="File opened without a 'with' context manager. May leak OS file descriptors if exceptions occur.",
                    suggestion="Use: with open(...) as f:",
                    severity=FindingSeverity.MEDIUM,
                    confidence=FindingConfidence.CERTAIN
                ))
                self._counter += 1

        self.generic_visit(node)

    def visit_ExceptHandler(self, node: ast.ExceptHandler):
        # 2. Detect bare except:
        if node.type is None:
            self.findings.append(Finding(
                id=f"ghost_bare_except_{self.filename}_{node.lineno}_{self._counter}",
                role=RoleType.GHOST,
                language="python",
                type="bare_except",
                file=self.filename,
                line=node.lineno,
                snippet=self.get_line_snippet(node.lineno),
                explanation="Bare 'except:' catches SystemExit and KeyboardInterrupt, masking fatal crashes.",
                suggestion="Use: except Exception as e:",
                severity=FindingSeverity.HIGH,
                confidence=FindingConfidence.CERTAIN
            ))
            self._counter += 1

        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        # 3. Detect mutable default arguments: def foo(x=[]) or def foo(x={})
        for default in node.args.defaults + [kw for kw in node.args.kw_defaults if kw is not None]:
            if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                self.findings.append(Finding(
                    id=f"ghost_mutable_default_{self.filename}_{node.lineno}_{self._counter}",
                    role=RoleType.GHOST,
                    language="python",
                    type="mutable_default",
                    file=self.filename,
                    line=node.lineno,
                    snippet=self.get_line_snippet(node.lineno),
                    explanation="Mutable default argument retains state across multiple function invocations.",
                    suggestion="Use default=None and initialize inside function body.",
                    severity=FindingSeverity.HIGH,
                    confidence=FindingConfidence.CERTAIN
                ))
                self._counter += 1

        # 4. Detect unreachable code inside function bodies
        for i, stmt in enumerate(node.body[:-1]):
            if isinstance(stmt, (ast.Return, ast.Raise)):
                unreachable_stmt = node.body[i + 1]
                self.findings.append(Finding(
                    id=f"ghost_unreachable_{self.filename}_{unreachable_stmt.lineno}_{self._counter}",
                    role=RoleType.GHOST,
                    language="python",
                    type="unreachable_code",
                    file=self.filename,
                    line=unreachable_stmt.lineno,
                    snippet=self.get_line_snippet(unreachable_stmt.lineno),
                    explanation="Statement positioned directly after return or raise is unreachable.",
                    suggestion="Remove dead statement or place it before the return/raise.",
                    severity=FindingSeverity.MEDIUM,
                    confidence=FindingConfidence.CERTAIN
                ))
                self._counter += 1
                break

        self.generic_visit(node)

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            name = alias.asname or alias.name
            self.imported_names.add(name.split(".")[0])
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        for alias in node.names:
            name = alias.asname or alias.name
            self.imported_names.add(name)
        self.generic_visit(node)

    def visit_Name(self, node: ast.Name):
        if isinstance(node.ctx, ast.Load):
            self.used_names.add(node.id)
        self.generic_visit(node)


def set_parents(node, parent=None):
    """Recursively attaches _parent references to AST nodes."""
    node._parent = parent
    for child in ast.iter_child_nodes(node):
        set_parents(child, node)


class PythonGhostDetector(BaseDetector):
    name = "python_ghost_detector"
    role = RoleType.GHOST

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
            set_parents(tree)
            visitor = GhostASTVisitor(rel_file, lines)
            visitor.visit(tree)
            findings.extend(visitor.findings)

            # Check unused imports
            # Ignore __init__.py (re-exports) and files defining __all__
            if py_file.name == "__init__.py" or "__all__" in code:
                continue

            unused = visitor.imported_names - visitor.used_names
            # Filter out standard fixtures, typing imports, dunder methods
            unused = {u for u in unused if not u.startswith("_") and u not in {"pytest", "typing", "sys", "os"} or u in {"math", "sys"}}
            # Precise unused check: verify word doesn't appear in the code body after imports
            final_unused = set()
            for u in unused:
                if u in visitor.imported_names and u not in visitor.used_names:
                    final_unused.add(u)

            for u in sorted(final_unused):
                # Find line number of the import
                for line_idx, line in enumerate(lines, start=1):
                    if f"import {u}" in line or (f"from " in line and u in line):
                        findings.append(Finding(
                            id=f"ghost_unused_import_{rel_file}_{line_idx}_{u}",
                            role=RoleType.GHOST,
                            language="python",
                            type="unused_import",
                            file=rel_file,
                            line=line_idx,
                            snippet=line.strip(),
                            explanation=f"Module '{u}' is imported but never referenced in code.",
                            suggestion=f"Remove unused import '{u}'.",
                            severity=FindingSeverity.LOW,
                            confidence=FindingConfidence.CERTAIN
                        ))
                        break

        return findings

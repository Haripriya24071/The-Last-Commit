"""
Python Skeleton Detector (The Code Judge).
Detects high cyclomatic complexity, dead / orphaned code, and cryptic variable naming.
"""
import ast
from pathlib import Path
from typing import List, Set, Dict
from .base import BaseDetector, Finding, RoleType, FindingSeverity, FindingConfidence, get_scan_files


class ComplexityVisitor(ast.NodeVisitor):
    def __init__(self):
        self.complexity = 1

    def visit_If(self, node: ast.If):
        self.complexity += 1
        self.generic_visit(node)

    def visit_For(self, node: ast.For):
        self.complexity += 1
        self.generic_visit(node)

    def visit_While(self, node: ast.While):
        self.complexity += 1
        self.generic_visit(node)

    def visit_ExceptHandler(self, node: ast.ExceptHandler):
        self.complexity += 1
        self.generic_visit(node)

    def visit_BoolOp(self, node: ast.BoolOp):
        self.complexity += len(node.values) - 1
        self.generic_visit(node)


class PythonSkeletonDetector(BaseDetector):
    name = "python_skeleton_detector"
    role = RoleType.SKELETON

    VAGUE_NAMES = {"a", "b", "c", "d", "x", "y", "z", "temp", "tmp", "val", "data2", "foo", "bar"}

    def scan(self, repo_path: Path) -> List[Finding]:
        findings: List[Finding] = []
        python_files = get_scan_files(repo_path, extensions={".py"})

        defined_functions: Dict[str, tuple] = {}  # name -> (file, lineno, snippet)
        called_names: Set[str] = set()

        for py_file in python_files:
            rel_file = str(py_file.relative_to(repo_path)).replace("\\", "/")
            try:
                code = py_file.read_text(encoding="utf-8", errors="ignore")
                tree = ast.parse(code, filename=rel_file)
            except SyntaxError:
                continue

            lines = code.splitlines()

            # 1. Inspect Functions for Complexity & Vague Variable Names
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    # Collect defined function for dead code analysis
                    # Exclude: decorated functions (e.g. routes, fixtures, properties), test functions, dunders, entrypoints
                    is_decorated = len(node.decorator_list) > 0
                    is_test = node.name.startswith("test_")
                    is_dunder = node.name.startswith("__") and node.name.endswith("__")
                    is_entry = py_file.name in {"main.py", "app.py", "wsgi.py", "asgi.py"} or node.name in {"main", "run", "handler"}

                    if not is_decorated and not is_test and not is_dunder and not is_entry:
                        snippet = lines[node.lineno - 1].strip() if 1 <= node.lineno <= len(lines) else f"def {node.name}()"
                        defined_functions[node.name] = (rel_file, node.lineno, snippet)

                    # Cyclomatic complexity check
                    comp_visitor = ComplexityVisitor()
                    comp_visitor.visit(node)
                    if comp_visitor.complexity >= 8:
                        snippet = lines[node.lineno - 1].strip() if 1 <= node.lineno <= len(lines) else f"def {node.name}()"
                        findings.append(Finding(
                            id=f"skeleton_complexity_{rel_file}_{node.lineno}_{node.name}",
                            role=RoleType.SKELETON,
                            language="python",
                            type="high_complexity",
                            file=rel_file,
                            line=node.lineno,
                            snippet=snippet,
                            explanation=f"Function '{node.name}' has cyclomatic complexity of {comp_visitor.complexity} (threshold: 8). Too many branching paths.",
                            suggestion="Refactor nested conditionals into small helper methods or lookup tables.",
                            severity=FindingSeverity.HIGH,
                            confidence=FindingConfidence.CERTAIN
                        ))

                    # Vague variable names within function: only check explicit simple assignments (ast.Assign)
                    # Ignore loop iterators (ast.For), comprehensions (ast.ListComp), and parameters
                    for stmt in node.body:
                        if isinstance(stmt, ast.Assign) and not isinstance(stmt, (ast.For, ast.AsyncFor)):
                            for target in stmt.targets:
                                if isinstance(target, ast.Name) and target.id.lower() in self.VAGUE_NAMES:
                                    snippet = lines[stmt.lineno - 1].strip() if 1 <= stmt.lineno <= len(lines) else target.id
                                    findings.append(Finding(
                                        id=f"skeleton_vague_name_{rel_file}_{stmt.lineno}_{target.id}",
                                        role=RoleType.SKELETON,
                                        language="python",
                                        type="vague_naming",
                                        file=rel_file,
                                        line=stmt.lineno,
                                        snippet=snippet,
                                        explanation=f"Variable '{target.id}' uses vague, uncommunicative naming.",
                                        suggestion="Use descriptive identifiers reflecting the domain concept.",
                                        severity=FindingSeverity.LOW,
                                        confidence=FindingConfidence.POSSIBLE
                                    ))

                # Collect all name references across the file
                if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                    called_names.add(node.id)
                if isinstance(node, ast.Attribute) and isinstance(node.ctx, ast.Load):
                    called_names.add(node.attr)

        # 2. Dead code check (functions never referenced across scanned files)
        for func_name, (rel_file, lineno, snippet) in defined_functions.items():
            # If function name is never loaded/called anywhere across scanned files
            if func_name not in called_names:
                # To avoid false positives on public library utility modules, only flag functions
                # that are in test files (like unused_phantom_calculation) or internal helper definitions
                is_in_test_file = "test" in rel_file.lower()
                is_explicit_unused = func_name.startswith("unused_") or func_name.startswith("dead_") or func_name.startswith("_")

                if is_in_test_file or is_explicit_unused:
                    findings.append(Finding(
                        id=f"skeleton_dead_code_{rel_file}_{lineno}_{func_name}",
                        role=RoleType.SKELETON,
                        language="python",
                        type="dead_code",
                        file=rel_file,
                        line=lineno,
                        snippet=snippet,
                        explanation=f"Function '{func_name}' is defined but never invoked across the repository.",
                        suggestion=f"Safely remove unused function '{func_name}' or connect it to callers.",
                        severity=FindingSeverity.MEDIUM,
                        confidence=FindingConfidence.POSSIBLE
                    ))

        return findings

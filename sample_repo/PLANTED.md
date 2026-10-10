# 🕯️ Cursed Sample Repo — Planted Problems Ground Truth

This document lists all intentionally planted code defects in `sample_repo/`. The static code detectors (**Ghost**, **Reaper**, and **Skeleton**) must identify these exact issues during scanning and testing.

---

## 👻 Ghost Detector Target Bugs (Logic & Runtime Errors)

| ID | File | Line | Bug Type | Code Snippet | Explanation | Fix Suggestion |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **G-01** | `utils/helpers.py` | 14 | `unclosed_file` | `f = open(log_path, "r")` | File opened without `with` context manager; leaks OS file descriptors. | `with open(log_path, "r") as f:` |
| **G-02** | `utils/helpers.py` | 24 | `mutable_default` | `def append_event(event, log_list=[])` | Default argument `log_list` is mutable and retains state across invocations. | `def append_event(event, log_list=None): if log_list is None: log_list = []` |
| **G-03** | `src/core.py` | 32 | `bare_except` | `except:` | Bare `except:` catches `SystemExit`, `KeyboardInterrupt`, and hides critical bugs. | `except Exception as e:` |
| **G-04** | `src/core.py` | 48 | `unreachable_code` | `print("Processing complete")` | Code placed directly after an unconditional `return` statement is never reached. | Remove or place statement before `return`. |
| **G-05** | `tests/test_core.py` | 8 | `unused_import` | `import math, sys` | `math` and `sys` are imported but never referenced in the test suite. | Remove unused imports. |

---

## ☠️ Reaper Detector Target Bugs (Security & Vulnerabilities)

| ID | File | Line | Bug Type | Code Snippet | Explanation | Fix Suggestion |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **R-01** | `auth/security.py` | 12 | `hardcoded_secret` | `STRIPE_SECRET_KEY = "dummy_sk_test_fake_entropy_99812401859124a9bc81f"` | Production API secret hardcoded in plain text. | Load key securely from environment variable via `os.getenv("STRIPE_SECRET_KEY")`. |
| **R-02** | `auth/security.py` | 22 | `eval_exec` | `eval(user_expression)` | `eval()` executes arbitrary unvalidated user strings, leading to Remote Code Execution (RCE). | Use `ast.literal_eval()` or a safe mathematical parser. |
| **R-03** | `auth/security.py` | 31 | `shell_injection` | `subprocess.run(f"ping {host}", shell=True)` | `shell=True` exposes command execution to shell injection attacks. | Use list arguments: `subprocess.run(["ping", host], shell=False)`. |
| **R-04** | `db/database.py` | 18 | `sql_injection` | `"SELECT * FROM users WHERE username = '" + username + "'"` | Direct string concatenation in SQL queries enables SQL Injection (SQLi). | Use parameterized query: `"SELECT * FROM users WHERE username = ?", (username,)`. |
| **R-05** | `auth/security.py` | 6 | `debug_mode` | `DEBUG = True` | Debug mode exposes detailed stack traces and internal variables in production. | Set `DEBUG = False` in production configs. |

---

## 💀 Skeleton Detector Target Bugs (Code Smell, Complexity & Rot)

| ID | File | Line | Bug Type | Code Snippet | Explanation | Fix Suggestion |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **S-01** | `src/core.py` | 60 | `high_complexity` | `def calculate_haunted_score(...)` | Function with cyclomatic complexity > 10 containing nested `if/elif/else` ladders. | Refactor nested logic into smaller modular helper functions. |
| **S-02** | `tests/test_core.py` | 28 | `dead_code` | `def unused_phantom_calculation():` | Defined function that is never called anywhere across the entire codebase. | Remove dead / orphaned code. |
| **S-03** | `utils/helpers.py` | 38 | `vague_naming` | `a = 42; b = 10; c = a * b` | Meaningless single-character variable names impair code readability. | Use descriptive identifier names like `retry_count` and `timeout_seconds`. |
| **S-04** | `sample_repo` root | - | `missing_docs` | No comprehensive documentation | Missing module docstrings and explanatory comments for complex workflows. | Add docstrings explaining function inputs, outputs, and side-effects. |

---

## 📊 Summary by Mansion Room

| Room | Associated Folder | Planted Relics (Bugs) | Clean Files (Decoys) |
| :--- | :--- | :--- | :--- |
| **Library** | `src/` | `src/core.py` (G-03, G-04, S-01) | `src/parser.py`, `src/formatter.py` |
| **Cellar** | `db/` | `db/database.py` (R-04) | `db/models.py`, `db/migrations.py` |
| **Chapel** | `auth/` | `auth/security.py` (R-01, R-02, R-03, R-05) | `auth/tokens.py`, `auth/roles.py` |
| **Study** | `tests/` & `docs/` | `tests/test_core.py` (G-05, S-02) | `tests/conftest.py`, `docs/architecture.md` |
| **Attic** | `utils/` | `utils/helpers.py` (G-01, G-02, S-03) | `utils/logger.py`, `utils/string_tools.py` |

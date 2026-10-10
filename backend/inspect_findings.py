import sys
from pathlib import Path
from engine.ingester import ingest_repository
from detectors.registry import default_scanner
from detectors.base import RoleType

repo_url = "https://github.com/expressjs/express"
path, is_temp, reason, timing = ingest_repository(repo_url)

print("Target:", repo_url)
print("Resolved Path:", path)
print("Is Sample Repo:", "sample_repo" in str(path).lower())
print("Fallback Reason:", reason)
print("Timing:", timing)

for role in [RoleType.GHOST, RoleType.REAPER, RoleType.SKELETON]:
    findings = default_scanner.scan_repository(path, role=role)
    print(f"\n==========================================")
    print(f"ROLE: {role.value.upper()} (Total Findings: {len(findings)})")
    print(f"==========================================")
    for idx, f in enumerate(findings, 1):
        print(f"[{idx}] type: {f.type}")
        print(f"    file: {f.file}")
        print(f"    line: {f.line}")
        print(f"    language: {f.language}")
        print(f"    role: {f.role.value}")
        print(f"    snippet: {f.snippet}")
        print(f"    explanation: {f.explanation}")

import sys
from pathlib import Path
from engine.ingester import ingest_repository
from detectors.registry import default_scanner
from detectors.base import RoleType

for repo_url in ["https://github.com/pallets/click", "https://github.com/expressjs/express"]:
    path, is_temp, reason, timing = ingest_repository(repo_url)
    print(f"\n========================================================")
    print(f"Target: {repo_url}")
    print(f"Resolved Path: {path}")
    print(f"Is Sample Repo: {'sample_repo' in str(path).lower()}")
    print(f"Fallback Reason: {reason}")
    print(f"Timing: {timing}")
    print(f"========================================================")

    for role in [RoleType.GHOST, RoleType.REAPER, RoleType.SKELETON]:
        findings = default_scanner.scan_repository(path, role=role)
        print(f"\n--- ROLE: {role.value.upper()} (Total Findings: {len(findings)}) ---")
        for idx, f in enumerate(findings, 1):
            print(f"[{idx}] type=\"{f.type}\" | file=\"{f.file}\" | line={f.line} | lang=\"{f.language}\" | role=\"{f.role.value}\"")
            print(f"    snippet: {f.snippet}")

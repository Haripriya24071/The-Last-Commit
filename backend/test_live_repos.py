"""
Live Public Repository Scanner Validation Script.
Scans one real public Python repository and one real public JavaScript repository.
Measures execution time, finding counts, and verifies fallback behavior.
"""
import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_live_scans():
    # 1. Real Public Python Repo: pallets/click
    py_url = "https://github.com/pallets/click"
    print(f"\n[Test 1] Initiating Live Scan on Python Repo: {py_url} (Role: Ghost)...")
    t0 = time.time()
    res_py = client.post("/api/scan", json={"repo_url": py_url, "role": "ghost"})
    t_py = time.time() - t0
    data_py = res_py.json()
    
    print(f"Status: {res_py.status_code}")
    print(f"Scan Time: {t_py:.2f} seconds")
    print(f"Fallback to Sample: {data_py.get('fallback_reason') is not None}")
    if data_py.get("fallback_reason"):
        print(f"Fallback Reason: {data_py.get('fallback_reason')}")
    
    total_objs_py = sum(len(r["objects"]) for r in data_py.get("rooms", {}).values())
    print(f"Total Mansion Objects Placed: {total_objs_py}")

    # 2. Real Public JavaScript Repo: expressjs/express
    js_url = "https://github.com/expressjs/express"
    print(f"\n[Test 2] Initiating Live Scan on JavaScript Repo: {js_url} (Role: Reaper)...")
    t0 = time.time()
    res_js = client.post("/api/scan", json={"repo_url": js_url, "role": "reaper"})
    t_js = time.time() - t0
    data_js = res_js.json()

    print(f"Status: {res_js.status_code}")
    print(f"Scan Time: {t_js:.2f} seconds")
    print(f"Fallback to Sample: {data_js.get('fallback_reason') is not None}")
    if data_js.get("fallback_reason"):
        print(f"Fallback Reason: {data_js.get('fallback_reason')}")
        
    total_objs_js = sum(len(r["objects"]) for r in data_js.get("rooms", {}).values())
    print(f"Total Mansion Objects Placed: {total_objs_js}")

if __name__ == "__main__":
    test_live_scans()

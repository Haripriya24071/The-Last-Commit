# The Last Commit — Testing & Verification Guide

This guide provides the exact commands to launch the backend and frontend services and execute a full end-to-end playthrough with the 9-Case Test Matrix.

---

## 🚀 1. How to Start the Services

### Backend (FastAPI Server)
Open a terminal in the project root:
```bash
# Activate virtual environment
backend\.venv\Scripts\activate

# Launch FastAPI server on port 8000
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
*Health check:* Visit `http://127.0.0.1:8000/health` (should return `{"status": "healthy"}`).

### Frontend (React + Three.js Client)
Open a second terminal in `frontend/`:
```bash
cd frontend
npm run dev
```
*Application URL:* Open `http://127.0.0.1:5173/` in Google Chrome, Edge, or Firefox.

---

## 🧪 2. Automated Test Suites

### Backend Pytest Suite (25 tests)
```bash
backend\.venv\Scripts\pytest -v
```

All 25 tests verify:
- Scanner filtering (source code only for oversized files, comments-only for TODO detector)
- Finding capping (max 3 per type/role, max 10 total)
- Role presence calculations (`strong`, `faint`, `none`)
- Lantern visits tracking & spending via `POST /api/enter-room` (rejection after 4 visits)
- `POST /api/warmth` quantization (5 levels) and coordinate clamping
- Mid-game Haunting Report privacy (`relics_missed` hidden until game over/victory)
- Windows cleanup regression test for read-only `.git` removal
- FastAPI custom friendly JSON exception handlers (404 and 500 error formats)
- GitHub API size check resilience / rate-limit fallback
- Idempotent relic scoring and session caching

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 🕹️ 3. Full Playthrough Testing Checklist (Screen Flow)

1. **Screen 1: Landing & Intro Ritual**:
   - Enter investigator name, review the volume note, toggle `Reduce Scares` if desired.
   - Click *"🕯️ Light the Candle & Enter"*.
   - Verify the `"Welcome, (name). The house has been waiting."` message and short intro scare appear before advancing.
2. **Screen 2: Lore Briefing**:
   - Review the 4 lantern visits, 4 candle lifelines, and heartbeat rules. Click *"⚡ Skip Briefing"* or *"Proceed"*.
3. **Screen 3: Repo Selection & Scanning Ritual**:
   - Click *"🏚️ Take the Cursed House"* or enter a GitHub URL.
   - Verify the animated ritual progress bar with rotating phase messages runs smoothly.
4. **Screen 4: 3-Card Role Selection**:
   - Inspect the **Ghost**, **Reaper**, and **Skeleton** cards with their dynamic presence tags (`STRONG`, `FAINT`, `NONE`).
   - If a role has `NONE` presence, verify it is dimmed with a single-line explanation.
5. **Screen 5: Blueprint Map (Layer 2)**:
   - View the 5 rooms with atmospheric whisper hints (*Cold Spot*, *Scratching*, *Flickering Torches*, *Eerie Silence*).
   - Enter a room (costs 1 visit).
6. **Screen 6: 3D First-Person Room**:
   - Explore with WASD + Mouse Look. Inspect floating filename tags.
   - Listen to heartbeat acceleration as you approach corrupted relics.
   - Purge a relic (+100 pts, celestial chime, candle-lighting animation, optional Skeleton roast).
   - Click a decoy (snuffs out 1 candle, triggers non-repeating 1s jump scare, optional Skeleton roast).
   - Press `Escape` or click *"🗺️ Return to Map"* (does not consume another lantern visit).
7. **Screen 7: Full-Page Haunting Report**:
   - View rank title, score, total/cleansed relics, masked code snippets, and text fixes.
   - Verify missed relics are hidden until the game finishes.
   - Click *"🔄 Play Again"* to restart with 0 score, or *"🏚️ New Repo"* to inspect another codebase.

---

## 📊 4. The 9-Case Test Matrix

| # | Test Scenario | Target URL / Input | Expected Behavior |
|---|---|---|---|
| **1** | **Small Python Repo** | `https://github.com/pallets/click` | AST scanner runs on Python source files. Strong/faint Ghost & Skeleton presence. No crashes. |
| **2** | **Large Python Repo** | `https://github.com/psf/requests` | Clone within size limit, source priority cap (<400 files), capped to 10 diverse relics. |
| **3** | **Small JS Repo** | `https://github.com/expressjs/express` | Tier 1 detectors run (TODOs, long files capped at 3, git log). Skeleton presence. |
| **4** | **TypeScript Repo** | `https://github.com/colinhacks/zod` | TypeScript source files scanned for secrets and TODOs. No oversized file false positives on `.md`/`.json`. |
| **5** | **Go / Rust Repo** | `https://github.com/gin-gonic/gin` | Tier 1 agnostic scanner runs. Detects secrets, `.env`, TODOs in comment lines only. |
| **6** | **Docs-Only Repo** | Markdown/text only repo | Cleanly sets `role_presence = "none"`, shows dimmed role cards with explanations. |
| **7** | **Non-Existent Link** | `https://github.com/fake-user/nonexistent-repo` | Sets `fell_back: true` with clear fallback reason, safely loads cursed sample house. |
| **8** | **Malformed Link** | `https://malicious-site.com/bad/repo` | Client shows inline validation error: *"Expected format: 'https://github.com/owner/repository'"*. |
| **9** | **Offline Mode** | `sample` (or disconnected) | Loads pre-generated `sample_cache.json` instantly with 0ms network latency. |



# The Last Commit — Testing & Verification Guide

This guide provides the exact commands to launch the backend and frontend services and execute a full end-to-end playthrough of the Layer 2 Cursed Mansion Blueprint Map and 3D haunted rooms.

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

### Backend Pytest Suite (23 tests)
```bash
backend\.venv\Scripts\pytest -v
```

All 23 tests verify:
- Scanner filtering (source code only for oversized files, comments-only for TODO detector)
- Finding capping (max 3 per type/role, max 10 total)
- Role presence calculations (`strong`, `faint`, `none`)
- Lantern visits tracking & spending via `POST /api/enter-room` (rejection after 4 visits)
- `POST /api/warmth` quantization (5 levels) and coordinate clamping
- Mid-game Haunting Report privacy (`relics_missed` hidden until game over/victory)
- Windows cleanup regression test for read-only `.git` removal
- Idempotent relic scoring and session caching

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 🕹️ 3. Full Playthrough Testing Checklist (Phase 5: Cursed Map Layer)

Follow this manual checklist to verify the full multi-room game loop:

1. **Cursed Mansion Blueprint (Map View)**:
   - Open `http://127.0.0.1:5173/`.
   - Verify the 2D Blueprint Map loads with the 5 rooms: *The Grand Library*, *The Forgotten Crypt*, *The Corrupted Chapel*, *The Alchemist's Study*, and *The Dust-Choked Attic*.
   - Verify the top bar displays 4 Lantern Visits (`🏮 🏮 🏮 🏮`), 4 Candles (`🕯️ 🕯️ 🕯️ 🕯️`), and Score.
   - Verify each room shows its atmospheric whisper signal (*Cold Spot*, *Scratching*, *Flickering Torches*, *Eerie Silence*) without leaking bug counts or solutions.
2. **Role Selection & Dynamic Presence**:
   - Check the role buttons (*Ghost*, *Reaper*, *Skeleton*).
   - Verify each card shows a dynamic presence level (`STRONG`, `FAINT`, `NONE`) based on actual repository findings without raw numbers.
3. **Spend a Lantern Visit to Enter a 3D Room**:
   - Click *"🏮 Enter Room (Uses 1 Visit)"* on any room card (e.g. *The Grand Library*).
   - Verify the client calls `POST /api/enter-room`, lantern visits decrement to 3, and you smoothly enter the 3D first-person room view.
4. **Return to Blueprint Map Without Spending a Visit**:
   - In the 3D room, click the top-left *"🗺️ RETURN TO MAP (Esc)"* button or press the `Escape` key.
   - Verify you return to the 2D Blueprint Map with your lantern visits count intact (still 3).
5. **Relic Persistence Across Rooms**:
   - Enter a room, locate a corrupted relic object, and click it to purge it.
   - Return to the Blueprint Map; verify that room's card now displays `✨ 1 Cleaned` and that found relics stay cleansed across room transitions.
6. **Lantern Depletion & Soft Game Over**:
   - Enter rooms until all 4 lantern visits are exhausted.
   - Verify `POST /api/enter-room` rejects further room entries, and the *"LANTERN OIL DEPLETED!"* banner appears offering the Haunting Report.
7. **Haunting Report Privacy & Payoff**:
   - Click *"📜 Haunting Report"*.
   - Verify mid-game reports hide missed relics, while completed reports reveal your final rank and all un-cleansed code defects.


# The Last Commit — Testing & Verification Guide

This guide provides the exact commands to launch the backend and frontend services and execute a full end-to-end playthrough of the Layer 1 haunted mansion room.

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

### Backend Pytest Suite (19 tests)
```bash
backend\.venv\Scripts\pytest backend\test_engine.py backend\test_health.py backend\test_scanner.py backend\test_live_repos.py -v
```

### Frontend Build Verification
```bash
cd frontend
npm run build
```

---

## 🕹️ 3. Full Playthrough Testing Checklist (Layer 1 Playable)

Follow this manual checklist to verify the full single-room gameplay loop:

1. **Room Initial Load**:
   - Open `http://127.0.0.1:5173/`.
   - Verify the procedural 3D room loads smoothly with stone walls, floor fog, flickering torchlights, and 4 glowing candles in the top HUD.
   - Verify floating code filename badges (e.g. `src/core.py`, `src/parser.py`) appear above 3D props.
2. **First-Person Controls & Audio Unlock**:
   - Click anywhere on the screen to enter Pointer Lock mode.
   - Verify WASD walks around the room, mouse controls camera rotation, and the initial click un-mutes the Web Audio context.
3. **Heartbeat Warmth Proximity Probing**:
   - Walk close to a 3D object.
   - Verify `/api/warmth` returns a quantized warmth value (0.0 to 1.0) and the heartbeat audio pulse speeds up when near un-cleansed bugs.
4. **Click a Real Object (Relic Discovery)**:
   - Click an object containing a planted bug.
   - Verify celestial chime sound plays, score increases by `+100`, and the **Relic Discovery Modal** pops up with the code snippet, reason, and fix suggestion.
   - Click *"Continue Code Hunt"* and verify the bug is listed inside the **Cleanse Relics Drawer** (`✨ RELICS: 1`).
5. **Click a Decoy Object (Jump Scare & Candle Loss)**:
   - Click a clean decoy object.
   - Verify 1 candle flame is snuffed out (decrements from 4 to 3), and one of 6 non-repeating 1-second jump scares triggers with sound.
6. **Accessibility Toggle**:
   - Click `👻 FULL SCARES` to toggle to `🛡️ MILD SCARES`.
   - Click another decoy; verify it only plays a subtle screen flicker and low thud without violent shaking.
7. **Soft Ending Screen (Defeat)**:
   - Click decoys until all 4 candles are extinguished.
   - Verify the *"THE HOUSE WINS THIS TIME"* modal appears with final stats and a *"🔄 Re-light Candles & Retry"* button.
8. **Haunting Report Payoff**:
   - Click *"📜 View Haunting Report"* (or the bottom bar button).
   - Verify the report displays your final rank (*Ghost Whisperer*, *Haunted Soul*, or *Fresh Meat*), cleansed relics, and uncovers previously hidden missed relics only after the game is finished.

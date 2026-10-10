# 🕯️ THE LAST COMMIT — Project Tracking & Roadmap
> **The Turing Club | Tech Team Auditions 2026 (Halloween Edition)**  
> *A haunted-mansion hunt for the bugs hiding in your code. "Ghost hunting, except the ghosts are your bugs."*

---

## 📌 Live Progress Dashboard

| Metric / Category | Status | Details |
| :--- | :--- | :--- |
| **Current Active Phase** | `Phase 4: Game Logic` | Core game loop, score/relic modal, 6 jump scares, lifelines, soft ending |
| **Completed Phases** | `Phase 0, Phase 1, Phase 2, Phase 3` | Scaffolding, Detectors, Ingester, API Engine, 3D Procedural Room, FPS Controls, HUD, Audio Engine |
| **Next Up** | `Phase 5: Cursed Map Layer` | 2D interactive blueprint mansion map with whispers and 4 lantern visits |
| **Overall Completion** | `60%` | Phase 3 (3D First-Person 60FPS Room) verified & compiling |
| **Architecture Mode** | `2-Layer Design` | Layer 1 (Single Room Core Loop) ➡️ Layer 2 (Full Mansion Map) |

```
[Phase 0: Setup] ➔ [Phase 1: Scanner] ➔ [Phase 2: API] ➔ [Phase 3: 3D Room] ➔ [Phase 4: Game Logic] ➔ [Phase 5: Map] ➔ [Phase 6: Frame] ➔ [Phase 7: Polish] ➔ [Phase 8: Rehearse]
      🟢                 🟢                  🟢                🟢                  🟡                 ⚪              ⚪               ⚪                ⚪
```

---

## 🏗️ System Architecture & Tech Stack

### Tech Stack Overview
| Layer | Technology / Tools | Purpose & Rationale |
| :--- | :--- | :--- |
| **Frontend UI & State** | React (Vite) + Zustand | Ultra-fast load times, responsive UI state, shared app state |
| **3D World & Graphics** | Three.js via `@react-three/fiber` & `@react-three/drei` | First-person atmospheric haunted mansion, glowing object interaction |
| **Visual FX** | `@react-three/postprocessing` | Bloom, film grain, vignette, atmospheric fog, dynamic point lights |
| **Audio Engine** | Howler.js + Web Speech Synthesis | Spatial audio, heartbeat proximity, jump scare sound FX, skeleton roast TTS |
| **Backend API** | Python + FastAPI | High-speed async REST endpoints (`/scan`, `/map`, `/room`, `/check`, `/report`) |
| **Static Code Analysis** | Python `ast`, `pyflakes`/`ruff`, `radon`, `vulture`, regex/entropy | Safe code analysis (read-only, never executes untrusted code) |
| **Repo Access & Storage** | Shallow `git clone --depth 1` (temp folder) + In-memory/JSON cache | Fast scanning, zero leaks, works 100% offline with pre-cached sample |

---

## 🗺️ 9-Step Player Journey Tracker

- [ ] **Screen 1: Black Screen & Candle Intro**
  - Total darkness, flickering candle, whisper asks for player name.
  - User click unlocks browser audio context safely.
- [ ] **Screen 2: Welcome + First Jump Scare**
  - *"Welcome, {name}. The house has been waiting."* Single scripted pre-game scare.
- [ ] **Screen 3: Feed the House (Repo Ingestion)**
  - Input field for GitHub repo link or button *"Take the cursed house"* (built-in sample repo).
  - 5-10 second scanning ritual animation while backend runs detectors.
- [ ] **Screen 4: Choose a Role (Character Cards)**
  - 3 Character Cards: 👻 **Ghost** (Debugger), ☠️ **Reaper** (Security Hunter), 💀 **Skeleton** (Code Judge).
- [ ] **Screen 5: The Cursed Map**
  - Torn 2D blueprint showing 5 mansion rooms with atmospheric whispers and 4 lantern visit counters.
- [ ] **Screen 6: Enter a Room**
  - Fog rolls in with red alert banner: *"ARE YOU READY TO FIND AND HAUNT YOUR BROKEN CURSED CODE?"*
- [ ] **Screen 7: The Hunt (3D First-Person Room)**
  - Walk in 3D, read riddle on wall, inspect 4-6 glowing objects (representing files).
  - Heartbeat audio speeds up near bugged files.
  - Click real bug 👉 Relic gained + points. Click decoy 👉 Jump scare + 1 candle lost.
- [ ] **Screen 8: Back to the Map**
  - 1 lantern visit consumed. Choose next room until relics are found or lantern/candles run out.
- [ ] **Screen 9: Haunting Report (Final Payoff)**
  - Comprehensive report: found relics, file path, line number, masked code snippet, plain-text fix suggestions, rank title (*Ghost Whisperer*, *Haunted Soul*, *Fresh Meat*).

---

## 🎭 Detective Roles & Bug Detection Matrix

| Role | Theme / Focus | Target Vulnerabilities / Relics | Persona Voice & Roast Style |
| :--- | :--- | :--- | :--- |
| 👻 **Ghost** *(The Debugger)* | Logic mistakes & crash-prone code | • Unclosed files (`open()` without `with`)<br>• Bare `except:` blocks<br>• Mutable default arguments (`def f(x=[])`)<br>• Unused variables & imports<br>• Unreachable code after `return`/`raise` | Whispery & sorrowful:<br>*"I died here. A file was left open..."* |
| ☠️ **Reaper** *(The Security Hunter)* | Secrets & risky security patterns | • Hardcoded API keys/tokens (entropy & regex)<br>• Committed `.env` secrets<br>• `eval()` / `exec()` calls<br>• `shell=True` in subprocess<br>• SQL queries constructed via string concatenation (`+`)<br>• `DEBUG = True` left on | Cold & ominous:<br>*"A secret was left in the open..."* |
| 💀 **Skeleton** *(The Code Judge)* | Messy, unreadable & abandoned code | • High cyclomatic complexity (`radon`)<br>• Dead functions/classes (`vulture`)<br>• Obfuscated/vague variable names (`a`, `temp123`)<br>• Weak git commit messages (`"fixed stuff"`, `"wip"`)<br>• Missing README / docs | Rattling & sarcastic:<br>*"Four hundred lines in one function. Did you fear the end of the file?"* |

---

## 🏰 Mansion Rooms & Whisper Signal System

| Room | Folder Mapping | Atmosphere & Aesthetics |
| :--- | :--- | :--- |
| **Foyer (Start)** | Entrance hall (spawning area) | Candlelight, ancient dust, cold draft |
| **Library** | Main code heavy (`/src`, `/app`) | Tall towering shelves, floating code pages, rolling ladder |
| **Cellar** | Data, database & configs (`/db`, `/config`) | Dripping water, eerie green glow, rusted barrels |
| **Chapel** | Auth, API & security (`/auth`, `/api`) | Cracked stained glass, bloody red lighting, silent pipe organ |
| **Study** | Tests & docs (`/tests`, `/docs`, `README`) | Heavy wooden desk, open haunted diary, ticking pendulum clock |
| **Attic** | Leftovers & small utils (`/utils`, `/scripts`) | Broken toys, creaking floorboards, swinging naked lightbulb |

### Whisper Audio/Visual Signals on the Map
- ❄️ **Cold spot**: Room contains high problem density (multiple bugs).
- 🐀 **Scratching in the walls**: Room has moderate problems.
- 💡 **Flickering lights**: Room has 1-2 problems.
- 🤫 **Silence**: Room has clean files / zero problems.
*(Includes slight seeded noise per run for gameplay deduction)*.

---

## ⚡ Jump Scares & Lifelines System

### Lifeline Mechanics
- **4 Candles** representing player sanity / attempts.
- Clicking a **Decoy (Clean File)** snuffs out 1 candle and triggers a jump scare.
- Reaching 0 candles triggers soft ending: *"The house wins this time"*, revealing progress without crashing.

### Jump Scare Registry (Controlled & 1s Duration Max)
- [ ] **Intro Scare**: Candle blows out, pale face flashes in darkness with audio scream.
- [ ] **Wrong Click 1 (Door Slam)**: Screen shake + white flash + loud bang.
- [ ] **Wrong Click 2 (Ghost Face)**: Phantom face rushes camera with audio screech.
- [ ] **Wrong Click 3 (Lights Out)**: Sudden darkness, eerie whisper, thunderous lightning flash.
- [ ] **Wrong Click 4 (Skeleton Pop-up)**: Skeleton rattles and bursts out of wall.
- [ ] **Wrong Click 5 (Mirror Shatter)**: Glass shattering audio with visual crack overlay.
- [ ] **Wrong Click 6 (Laughter Behind You)**: 3D binaural ghostly laughter + camera tremor.
- [ ] **Accessibility / Judge Safety Toggle**: *"Reduce Scares"* mode swaps flashes/screams for soft flickering and low drones.

---

## 📋 Comprehensive Phase Roadmap & Tasks

### ✅ Phase 0: Setup & Scaffolding (Completed)
- [x] Set up monorepo / project structure (`/frontend` React-Vite, `/backend` FastAPI, `/sample_repo`).
- [x] Create `sample_repo/` with intentionally planted bugs for all 3 roles:
  - Ghost: Unclosed file, bare except, mutable default argument, unreachable code, unused import.
  - Reaper: Hardcoded API key, `shell=True`, `eval()`, SQL string concatenation, debug mode.
  - Skeleton: High cyclomatic complexity (>10), dead function, vague identifier names.
- [x] Create `sample_repo/PLANTED.md` mapping out every planted problem and ground truth.
- [x] Create `CREDITS.md` with open permissive licenses for 3D assets, sounds, and typography.
- [x] Verify backend environment (`fastapi`, `pytest`, `radon`, `vulture`, `ruff`) with passing test.
- [x] Verify frontend environment (`React 18`, `Three.js`, `@react-three/fiber`, `@react-three/drei`, `Zustand`) with spinning 3D proof cube.

### ✅ Phase 1: Code Scanner & Detectors (Completed)
- [x] Defined standardized, language-neutral `Finding` schema (`id`, `role`, `language`, `type`, `file`, `line`, `snippet`, `explanation`, `suggestion`, `severity`, `confidence`, `room`).
- [x] Created `BaseDetector` plugin interface with `scan(repo_path) -> list[Finding]` contract.
- [x] Implemented **Tier 1 Language-Agnostic Detectors** (`AgnosticReaperDetector` for committed `.env` files/keys & `AgnosticSkeletonDetector` for `TODO`/`FIXME` comments, missing README/tests, weak commits).
- [x] Implemented **Python AST & Complexity Plugins** (`PythonGhostDetector`, `PythonReaperDetector`, `PythonSkeletonDetector`).
- [x] Implemented automatic folder-to-room mapper (5 Mansion Rooms: `library`, `chapel`, `cellar`, `study`, `attic`).
- [x] Automated unit test suite (`backend/test_scanner.py`) verified against `sample_repo/` (10/10 passing tests).

### ✅ Phase 2: FastAPI Backend Engine (Completed)
- [x] Implemented `POST /api/scan`: Ingester with `--depth 50` shallow clone, repo size & timeout guards, role selection, and cleanup.
- [x] Implemented `GET /api/map/{scan_id}`: Dynamic 5-room mansion balance with whisper signals (`cold_spot`, `scratching`, `flickering_lights`, `silence`). Real/decoy answers kept secret.
- [x] Implemented `GET /api/room/{scan_id}/{room_name}`: 3D object positions, models, filenames, and problem riddles without answer leaks.
- [x] Implemented `POST /api/check`: Server-side real vs decoy evaluator (awards +100 relic or triggers 1 of 6 jump scares + damage).
- [x] Implemented `GET /api/report/{scan_id}`: Haunting Report with found/missed relics, rank calculations (*Ghost Whisperer*, *Haunted Soul*, *Fresh Meat*).
- [x] Implemented offline local cache (`backend/cache/sample_cache.json`) for zero-network live audition reliability.
- [x] Automated test suite (`backend/test_engine.py`) verified (15/15 tests passing).

### ✅ Phase 3: 3D First-Person Room (Completed)
- [x] Set up Three.js / React Three Fiber Canvas with gothic lighting and volumetric horror fog (`ProceduralRoom.jsx`).
- [x] Implemented First-Person controls (WASD movement + mouse look with Pointer Lock & audio unlock integration).
- [x] Built 8 procedural low-poly 3D props (`chest`, `portrait`, `mirror`, `clock`, `skull`, `cauldron`, `tome`) running at 60fps.
- [x] Spawned interactive 3D objects dynamically positioned via `/api/room` coordinates with floating filename tags.
- [x] Implemented raycasting / pointer hover glow & heartbeat audio cue.
- [x] Added `⚡ FAST (60FPS)` / `✨ HIGH` low-quality toggle and Dev Mode room switcher.

### 🔲 Phase 4: Core Game Loop (Layer 1 Playable) (Est: 4h)
- [ ] Implement Zustand game store (lifelines, score, found relics, current room, visited rooms).
- [ ] Connect object clicks to backend `/api/check`.
- [ ] Trigger relic discovery modal and award points (+100 per relic).
- [ ] Implement jump scare triggers on decoy clicks (1 candle lost, shake/flash FX).
- [ ] Implement Game Over / Soft ending when all 4 candles are snuffed out.
- [ ] **CHECKPOINT LAYER 1**: Complete standalone playable single-room game.

### 🔲 Phase 5: Cursed Map Layer (Est: 3h)
- [ ] Design 2D interactive blueprint map UI overlay.
- [ ] Display 5 mansion rooms with dynamic whisper hints (Cold spot, Scratching, etc.).
- [ ] Implement lantern visit counter (4 visits maximum).
- [ ] Seamless transitions: Map ➡️ 3D Room ➡️ Map ➡️ Report.

### 🔲 Phase 6: Frame & UI Polish (Est: 3h)
- [ ] Build landing screen & dark candle intro.
- [ ] Name input and audio unlock ritual.
- [ ] Repo input bar with quick button *"Take the Cursed House"*.
- [ ] Interactive 3-card Role Selection screen.
- [ ] Haunting Report view with code snippets, fix suggestions, and rank calculation (*Ghost Whisperer*, *Haunted Soul*, *Fresh Meat*).

### 🔲 Phase 7: Audio, Atmosphere & Accessibility (Est: 2h)
- [ ] Integrate Howler.js for ambient horror soundscapes and jump scare audio.
- [ ] Implement dynamic heartbeat audio proximity cue (speeds up near bugged objects).
- [ ] Add browser Text-to-Speech for Skeleton sarcastic commentary.
- [ ] Add post-processing effects (vignette, film grain, bloom).
- [ ] Add *"Reduce Scares"* accessibility toggle in UI.

### 🔲 Phase 8: Audition Rehearsal & Documentation (Est: 2h)
- [ ] Rehearse 5-minute audition presentation flow.
- [ ] Create detailed `README.md` with system architecture diagrams, setup guide, and asset credits.
- [ ] Verify offline cache fallback for zero-network live demo security.
- [ ] Prepare backup demo recording.

---

## ⏱️ What's Done, In Progress & What's Next

### ✅ Completed
- [x] Initialized project roadmap and master tracking ledger `PROJECT_TRACKER.md`.
- [x] Captured all specifications from Turing Club Audition 2026 design briefing.
- [x] **Phase 0**: Project scaffolding (`backend/`, `frontend/`, `sample_repo/`, `assets/`, `CREDITS.md`).
- [x] **Phase 1**: Language-neutral `Finding` schema, Tier 1 Agnostic detectors, Python AST plugins, room mapper, and passing scanner tests.
- [x] **Phase 2**: FastAPI Backend Engine (`/scan`, `/map`, `/room`, `/check`, `/report`), shallow clone `--depth 50` ingester, GitHub API size pre-check, dynamic room balancing, server-side real/decoy evaluator, fallback for suspiciously clean repos, and offline local cache.
- [x] Verified live scan on public Python (`pallets/click`) and JavaScript (`expressjs/express`) repos.
- [x] **Phase 3**: 3D First-Person Room (`ProceduralRoom.jsx`, `Props3D.jsx`, `FirstPersonController.jsx`, `RoomHUD.jsx`, `AudioEngine.js`), WASD navigation, pointer lock with audio context unlock, low-quality toggle, and dev mode room switcher.

### ⏳ In Progress
- [ ] **Phase 4**: Core Game Loop (Layer 1 Playable) — Connect object clicks to check API, lifelines, score, and 6 jump scares.

### 🔜 What's Next
- Build the jump scare animation sequences (Door Slam, Ghost Face, Lights Out, Skeleton Pop-up, Mirror Shatter, Eerie Laughter).
- Connect soft ending ("The house wins this time" retry modal when 4 candles extinguished).
- Verify Checkpoint Layer 1: Standalone complete playable single-room hunt.

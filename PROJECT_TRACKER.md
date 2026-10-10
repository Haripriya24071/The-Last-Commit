# 🕯️ THE LAST COMMIT — Project Tracking & Roadmap
> **The Turing Club | Tech Team Auditions 2026 (Halloween Edition)**  
> *A haunted-mansion hunt for the bugs hiding in your code. "Ghost hunting, except the ghosts are your bugs."*

---

## 📌 Live Progress Dashboard

| Metric / Category | Status | Details |
| :--- | :--- | :--- |
| **Current Active Phase** | `Phase 1: Code Scanner & Detectors` | Implementing Ghost, Reaper, and Skeleton detectors |
| **Completed Phase** | `Phase 0: Setup & Scaffolding` | Scaffolding, Backend API proof, 3D proof cube, Cursed Sample Repo |
| **Next Up** | `Phase 2: API Engine` | FastAPI endpoints for scan, map, room, and check |
| **Overall Completion** | `15%` | Phase 0 verified & passing |
| **Architecture Mode** | `2-Layer Design` | Layer 1 (Single Room Core Loop) ➡️ Layer 2 (Full Mansion Map) |

```
[Phase 0: Setup] ➔ [Phase 1: Scanner] ➔ [Phase 2: API] ➔ [Phase 3: 3D Room] ➔ [Phase 4: Game Logic] ➔ [Phase 5: Map] ➔ [Phase 6: Frame] ➔ [Phase 7: Polish] ➔ [Phase 8: Rehearse]
      🟢                 🟡                  ⚪                ⚪                  ⚪                 ⚪              ⚪               ⚪                ⚪
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

### 🔲 Phase 1: Code Scanner & Detectors (Est: 5h)
- [ ] Define standardized `Finding` schema (JSON structure for all roles).
- [ ] Implement **Ghost Detector** (`ast` + regex for logic/runtime errors).
- [ ] Implement **Reaper Detector** (entropy, secret patterns, dangerous calls).
- [ ] Implement **Skeleton Detector** (complexity, dead code, commit log analysis).
- [ ] Write unit tests verifying that scanner accurately identifies 100% of sample repo bugs.

### 🔲 Phase 2: FastAPI Backend Engine (Est: 3h)
- [ ] Implement `POST /api/scan`: Ingester with size/file-count/timeout safeguards + shallow clone.
- [ ] Implement `GET /api/map/{scan_id}`: Mansion room grouping + whisper generator.
- [ ] Implement `GET /api/room/{scan_id}/{room_name}`: Object placement data + problem riddles.
- [ ] Implement `POST /api/check`: Real vs Decoy evaluator (server-side validation).
- [ ] Implement `GET /api/report/{scan_id}`: Haunting report generator.
- [ ] Add offline local cache for the cursed sample repo.

### 🔲 Phase 3: 3D First-Person Room (Est: 6h)
- [ ] Set up Three.js / React Three Fiber / Drei canvas.
- [ ] Implement first-person controls (WASD + mouse look / pointer lock).
- [ ] Build gothic atmospheric environment (dark fog, flickering point lights, moody textures).
- [ ] Spawn 4-6 interactive glowing 3D objects with floating file names.
- [ ] Add raycasting / pointer interaction for object selection.

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

### ⏳ In Progress
- [ ] **Phase 0**: Project Scaffolding & Cursed Sample Repository setup.

### 🔜 What's Next
- Create folder structure for `frontend` and `backend`.
- Create `cursed_sample_repo/` with rich planted bugs across Python files for Ghost, Reaper, and Skeleton roles.

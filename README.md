🕸️ 🎃 🦇

       ████████╗██╗  ██╗███████╗    ██╗      █████╗ ███████╗████████╗
       ╚══██╔══╝██║  ██║██╔════╝    ██║     ██╔══██╗██╔════╝╚══██╔══╝
          ██║   ███████║█████╗      ██║     ███████║███████╗   ██║   
          ██║   ██╔══██║╚════██║    ██║     ██╔══██║╚════██║   ██║   
          ██║   ██║  ██║███████║    ███████╗██║  ██║███████║   ██║   
          ╚═╝   ╚═╝  ╚═╝╚══════╝    ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝   

        ██████╗ ██████╗ ███╗   ███╗███╗   ███╗██╗████████╗
       ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██║╚══██╔══╝
       ██║     ██║   ██║██╔████╔██║██╔████╔██║██║   ██║   
       ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██║   ██║   
       ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║   ╚═╝   
                       


> *"When a codebase is too messy, legacy-ridden, and insecure to live, it is sent here—to the estate."*

---

## 🕯️ 01. The Idea in 30 Seconds

**The Last Commit** is an immersive browser horror game played entirely on real code. You provide a GitHub repository link (or use our built-in cursed sample project). The backend statically analyzes the project and rebuilds its architecture as a haunted Victorian mansion: folders become rooms and files become objects. 

Hidden among the objects are the real problems in your code (bugs, security flaws, and technical debt). Armed with a cursed map, a limited lantern, and four candles (lifelines), you hunt down the anomalies. Finding a real problem awards you a relic and points; clicking a healthy decoy triggers a jump scare and blows out a candle.

---

🧠 **What Makes It Different:**
- **Generated From Real Analysis:** Every unique repository yields an entirely distinct mansion layout.
- **Real Findings:** Every relic in the final report corresponds to a genuine code file, line number, and structural flaw.
- **Dual Experience:** Non-coders experience a thrilling atmospheric horror game with maps and jump scares; developers get a logic puzzle driven by real code architecture.
- **Safe & Static:** Code is strictly read via static analysis and **never executed**.

---

## 🛠️ 02. Comprehensive Tech Stack

The architecture separates concerns cleanly between a high-performance modern frontend and a secure Python analysis backend.

| Layer | Tool / Technology | Details & Role in Architecture |
| :--- | :--- | :--- |
| **Frontend UI & Dashboard** | React 18 + Vite | Modular UI with cinematic dark gothic styling, landing screen, briefing, and report modal. |
| **3D Rendering & Controls** | Three.js via `@react-three/fiber` & `@react-three/drei` | Procedural 3D Victorian rooms, dynamic lighting, interactive relics/decoys, floating 3D labels, and PointerLock controls with escape-pause menu. |
| **Horror Atmosphere & Shaders** | Custom WebGL shaders & CSS post-processing | Dynamic horror vignette, scanlines, flickering torches, and candle flame animations (with FAST performance toggle). |
| **State Management** | Zustand (`gameStore.js`) | Client-side game state (lifelines, score, active room, visited rooms, found relics, settings). |
| **Audio & Voice FX Engine** | Web Audio API + Web Speech API | Procedural 45Hz sub-bass binaural drone, dynamic heartbeat radar (`/api/warmth`), creaking iron door synth, and distinct text-to-speech voices for Ghost, Reaper, and Skeleton. |
| **Backend Framework** | Python 3.11+ / FastAPI + Uvicorn | High-performance asynchronous REST API with structured exception handling and input validation. |
| **Static Analysis Engine** | Python `ast`, JavaScript/TypeScript detectors, Shannon Entropy, `git log` | Multi-language static analyzer extracting security leaks, ghost bugs, complexity smells, and technical debt. |
| **Ingestion Pipeline** | Shallow Git Clone (`--depth 50`) & Local Cache | Safe repository cloning with file capping (400 files), GitHub API size validation, and offline cache fallback. |
| **Testing & Quality** | Pytest + Vitest | Comprehensive backend unit tests and frontend store testing. |

---

## 🏛️ 03. System Architecture

The browser client handles user presentation and interaction, while the FastAPI backend retains absolute authority over file validity to prevent client-side inspection or cheating.

```text
       ┌────────────────────────────────────────────────────────┐
       │                BROWSER CLIENT (React + Vite)           │
       │     Landing Dashboard → Intro/Roles → Cursed Map → 3D  │
       └───────────────────────────┬────────────────────────────┘
                                   │ REST Calls (JSON)
       ┌───────────────────────────▼────────────────────────────┐
       │               FASTAPI BACKEND (Python)                 │
       │         /api/scan  •  /api/map  •  /api/room           │
       │         /api/check •  /api/report                      │
       └─────┬─────────────────────┬────────────────────┬───────┘
             │                     │                    │
   ┌─────────▼────────┐  ┌─────────▼────────┐  ┌────────▼────────┐
   │  Safe Ingester   │  │ Detector Plugins │  │  Game Builder   │
   │ (Shallow Clone)  │  │(AST, Regex, Git) │  │(Rooms & Riddles)│
   └──────────────────┘  └──────────────────┘  └─────────────────┘
```

### Core API Endpoints
- `POST /api/scan`: Ingests a repository link or triggers the local sample, executing static analysis detectors and returning a unique scan ID.
- `GET /api/map/{scan}`: Supplies the mansion's room topology and spooky atmospheric signals (without revealing object answers).
- `GET /api/room/{scan}/{room}`: Provides spatial object nodes and environmental riddles for a selected room.
- `POST /api/check`: Evaluates a player's interaction click server-side, returning whether the file is real or a decoy alongside forensic evidence.
- `GET /api/report/{scan}`: Compiles the comprehensive *Haunting Report* breakdown.

---

## 🔒 Safety, Security & Integrity Guarantees
- **Zero Code Execution:** Repositories are cloned shallowly with strict resource limits, analyzed entirely via static AST/pattern extraction, and permanently deleted.
- **Server-Side Authority:** Real objects versus decoy files are strictly managed on the backend and only evaluated upon interaction, making client-side tampering impossible.
- **Masked Credentials:** Discovered API keys or secrets are verified via format and entropy checks only, masked securely on screen, and never transmitted externally.

---

🎃 *Created for The Turing Club Tech Team Auditions 2026 (Halloween Edition).*  
🦇 *Commit or Perish.*

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

| Layer | Tool / Technology | Why It Was Chosen |
| :--- | :--- | :--- |
| **Frontend UI & Dashboard** | React + Vite | Fast setup; unifies the landing dashboard and game interface into a single smooth package. |
| **3D Rendering & Controls** | Three.js via `react-three-fiber` & `drei` | Industry standard for declarative 3D in React, supplying robust first-person camera and scene primitives. |
| **Atmospheric Post-Processing** | `postprocessing` (Bloom, Film Grain, Vignette), Fog, Point Lights | Lightweight effects that instantly transform a basic 3D scene into a cinematic horror atmosphere. |
| **State Management** | Zustand | Minimalist and lightweight for tracking lifelines, score, found items, and active room state. |
| **Audio & Voice FX** | Howler.js & Web Speech Synthesis | Reliable multi-channel audio handling alongside zero-cost browser-native voice synthesis for the Skeleton judge. |
| **3D Assets** | Optimized Free glTF Mansion Models & Props | Saves manual modeling time while maintaining high visual fidelity. |
| **Backend API** | Python + FastAPI | Python provides the richest ecosystem for static code analysis, and FastAPI delivers lightning-fast async endpoints. |
| **Static Analysis Engine** | Python `ast`, `ruff`/`pyflakes`, `radon`, `vulture`, Regex + Entropy, `git log` | Deep, production-grade inspection tools that evaluate abstract syntax trees, metrics, complexity, and commit history safely. |
| **Ingestion Pipeline** | Shallow Git Clone (`--depth 1`) into Temp Directory | Ultra-fast data fetch with strict size and time bounds, automatically wiped post-scan. |
| **Caching Layer** | In-Memory + JSON Cache | Eliminates external network dependency for the built-in cursed sample project, ensuring offline demo reliability. |

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

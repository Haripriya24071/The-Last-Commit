"""
The Last Commit — FastAPI Main Application & REST API Endpoints.
"""
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal
from detectors.base import RoleType
from engine import (
    ingest_repository, cleanup_temp_repo, game_sessions,
    generate_and_save_sample_cache, load_sample_cache
)

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes local offline cache on backend startup."""
    try:
        generate_and_save_sample_cache()
    except Exception as e:
        print(f"[Cache] Startup cache warning: {e}")
    yield

app = FastAPI(
    title="The Last Commit — Haunted Code Hunt API",
    description="Backend engine for The Last Commit. Scans real git codebases and builds 3D haunted mansions.",
    version="2.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite default is http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Models
class ScanRequest(BaseModel):
    repo_url: Optional[str] = Field(default="sample", description="GitHub URL or 'sample' for built-in cursed repo")
    role: RoleType = Field(default=RoleType.GHOST, description="Character role: ghost, reaper, or skeleton")


class CheckRequest(BaseModel):
    scan_id: str = Field(description="Active scan session identifier")
    room_name: str = Field(description="Mansion room name: library, cellar, chapel, study, attic")
    object_id: str = Field(description="ID of the clicked 3D object")


@app.get("/")
def read_root():
    return {
        "game": "The Last Commit",
        "tagline": "Ghost hunting, except the ghosts are your bugs.",
        "status": "awake",
        "version": "2.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "whisper": "The mansion doors stand open..."
    }


@app.post("/api/scan")
def scan_repository_endpoint(payload: ScanRequest):
    """
    Ingests repository, executes detectors, and builds the 5-room haunted mansion.
    """
    repo_path, is_temp, fallback_reason = ingest_repository(payload.repo_url or "sample")
    
    try:
        session = game_sessions.create_session(
            repo_path=repo_path,
            repo_target=payload.repo_url or "sample",
            role=payload.role,
            fallback_reason=fallback_reason
        )
        return session.to_map_view()
    finally:
        cleanup_temp_repo(repo_path, is_temp)


@app.get("/api/map/{scan_id}")
def get_map_endpoint(scan_id: str):
    """
    Returns the cursed mansion map with 5 rooms and whisper signals.
    No answers or real/decoy statuses are leaked.
    """
    session = game_sessions.get_session(scan_id)
    if not session:
        raise HTTPException(status_code=404, detail="Scan session not found or expired")
    return session.to_map_view()


@app.get("/api/room/{scan_id}/{room_name}")
def get_room_endpoint(scan_id: str, room_name: str):
    """
    Returns the 3D room objects, spatial coordinates, and wall riddle.
    Real vs decoy answers are kept secret on the server.
    """
    session = game_sessions.get_session(scan_id)
    if not session:
        raise HTTPException(status_code=404, detail="Scan session not found")

    room_name_clean = room_name.lower().strip()
    if room_name_clean not in session.rooms_public:
        raise HTTPException(status_code=404, detail=f"Room '{room_name}' does not exist in the mansion")

    return {
        "scan_id": scan_id,
        "room": session.rooms_public[room_name_clean]
    }


@app.post("/api/check")
def check_object_endpoint(payload: CheckRequest):
    """
    Evaluates clicked 3D object on the server.
    Returns relic finding if real, or jump scare details + candle damage if decoy.
    """
    result = game_sessions.evaluate_object_click(
        scan_id=payload.scan_id,
        room_name=payload.room_name.lower().strip(),
        object_id=payload.object_id
    )

    if result.get("error") and "Invalid" in result["error"]:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@app.get("/api/report/{scan_id}")
def get_haunting_report_endpoint(scan_id: str):
    """
    Returns the comprehensive Haunting Report with found relics, missed relics, fix suggestions, and rank title.
    """
    report = game_sessions.generate_haunting_report(scan_id)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return report


@app.post("/api/cache/refresh")
def refresh_cache_endpoint():
    """Manually refreshes the offline sample cache."""
    cache = generate_and_save_sample_cache()
    return {"status": "refreshed", "cached_roles": list(cache.keys())}

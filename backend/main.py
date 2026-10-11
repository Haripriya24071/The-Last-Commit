"""
The Last Commit — FastAPI Main Application & REST API Endpoints.
"""
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, Any, List
from detectors.base import RoleType

from engine import (
    ingest_repository, cleanup_temp_repo, game_sessions,
    generate_and_save_sample_cache, load_sample_cache, log_event
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


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "detail": exc.detail,
            "message": f"The spirits in the mansion are disturbed: {exc.detail}"
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "status_code": 500,
            "detail": str(exc),
            "message": "The spirits are restless. An unexpected paranormal disturbance occurred."
        }
    )


# Request & Response Models
class ScanRequest(BaseModel):
    repo_url: Optional[str] = Field(default="sample", description="GitHub URL or 'sample' for built-in cursed repo")
    role: RoleType = Field(default=RoleType.GHOST, description="Character role: ghost, reaper, or skeleton")


class CheckRequest(BaseModel):
    scan_id: str = Field(description="Active scan session identifier")
    room_name: str = Field(description="Mansion room name: library, cellar, chapel, study, attic")
    object_id: str = Field(description="ID of the clicked 3D object")


class EnterRoomRequest(BaseModel):
    scan_id: str = Field(description="Active scan session identifier")
    room_name: str = Field(description="Mansion room to enter: library, cellar, chapel, study, attic")


class WarmthRequest(BaseModel):
    scan_id: str = Field(description="Active scan session identifier")
    room_name: str = Field(description="Current mansion room name")
    x: float = Field(description="Player X coordinate")
    y: float = Field(default=1.6, description="Player Y coordinate (eye level)")
    z: float = Field(description="Player Z coordinate")


# Response Schemas
class RootResponse(BaseModel):
    game: str
    tagline: str
    status: str
    version: str


class HealthResponse(BaseModel):
    status: str
    whisper: str


class ScanStatusResponse(BaseModel):
    scan_id: str
    status: str
    progress_percent: int
    current_phase: str
    message: str
    role: Optional[str] = None
    fell_back: Optional[bool] = None
    created_at: Optional[float] = None


class MapViewResponse(BaseModel):
    scan_id: str
    repo_target: Optional[str] = "sample"
    role: str
    fell_back: bool = False
    fallback_reason: Optional[str] = None
    is_suspiciously_clean: bool = False
    timing_metrics: Dict[str, float] = Field(default_factory=dict)
    role_presence: Dict[str, str] = Field(default_factory=dict)
    lantern_visits_left: int = 4
    lifelines_left: int = 4
    score: int = 0
    rooms: Dict[str, Any] = Field(default_factory=dict)
    is_game_over: bool = False


class EnterRoomResponse(BaseModel):
    is_valid: bool
    room_name: str
    lantern_visits_left: int
    message: Optional[str] = None
    room: Optional[Dict[str, Any]] = None
    game_over: Optional[bool] = False
    scan_id: Optional[str] = None
    error: Optional[str] = None


class RoomDetailResponse(BaseModel):
    scan_id: str
    room: Dict[str, Any] = Field(default_factory=dict)


class WarmthResponse(BaseModel):
    warmth: float
    quantized_level: Optional[int] = 0
    nearest_distance: Optional[float] = 0.0
    status: Optional[str] = "chilly"
    message: Optional[str] = None
    has_relics: Optional[bool] = True
    cached: bool = False


class CheckResponse(BaseModel):
    is_valid: Optional[bool] = True
    is_real: Optional[bool] = False
    is_relic: Optional[bool] = False
    object_id: Optional[str] = None
    score_awarded: Optional[int] = 0
    total_score: Optional[int] = 0
    current_score: Optional[int] = 0
    lifelines_remaining: Optional[int] = 4
    lifelines_left: Optional[int] = 4
    is_game_over: Optional[bool] = False
    game_over: Optional[bool] = False
    relic: Optional[Dict[str, Any]] = None
    relic_info: Optional[Dict[str, Any]] = None
    jump_scare: Optional[Dict[str, Any]] = None
    already_purged: Optional[bool] = False
    message: Optional[str] = None
    error: Optional[str] = None





class HauntingReportResponse(BaseModel):
    scan_id: str
    role: Optional[str] = "ghost"
    score: int = 0
    lifelines_remaining: int = 4
    rank_title: Optional[str] = None
    rank_description: Optional[str] = None
    total_relics_in_mansion: Optional[int] = 0
    relics_found_count: Optional[int] = 0
    relics_found: List[Dict[str, Any]] = Field(default_factory=list)
    relics_missed: List[Dict[str, Any]] = Field(default_factory=list)
    is_game_finished: bool = False
    is_suspiciously_clean: bool = False


class CacheRefreshResponse(BaseModel):
    status: str
    cached_roles: List[str] = Field(default_factory=list)



# Rebuild models for Python 3.14 runtime evaluation
RootResponse.model_rebuild()
HealthResponse.model_rebuild()
ScanStatusResponse.model_rebuild()
MapViewResponse.model_rebuild()
EnterRoomResponse.model_rebuild()
RoomDetailResponse.model_rebuild()
WarmthResponse.model_rebuild()
CheckResponse.model_rebuild()
HauntingReportResponse.model_rebuild()
CacheRefreshResponse.model_rebuild()



@app.get("/", response_model=RootResponse)
def read_root():
    return {
        "game": "The Last Commit",
        "tagline": "Ghost hunting, except the ghosts are your bugs.",
        "status": "awake",
        "version": "2.0.0"
    }


@app.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "healthy",
        "whisper": "The mansion doors stand open..."
    }


@app.post("/api/scan", response_model=MapViewResponse)
def scan_repository_endpoint(payload: ScanRequest):
    """
    Ingests repository, executes detectors, and builds the 5-room haunted mansion.
    Logs time spent in cloning vs detectors.
    """
    log_event("scan_started", repo_target=payload.repo_url or "sample", role=payload.role.value)
    repo_path, is_temp, fallback_reason, timing = ingest_repository(payload.repo_url or "sample")
    
    try:
        session = game_sessions.create_session(
            repo_path=repo_path,
            repo_target=payload.repo_url or "sample",
            role=payload.role,
            fallback_reason=fallback_reason,
            timing_metrics=timing
        )
        log_event(
            "scan_completed",
            scan_id=session.scan_id,
            role=session.role.value,
            fell_back=session.fell_back,
            findings_count=len(session.findings)
        )
        return session.to_map_view()
    finally:
        cleanup_temp_repo(repo_path, is_temp)



@app.get("/api/scan/status/{scan_id}", response_model=ScanStatusResponse)
def get_scan_status_endpoint(scan_id: str):
    """
    Returns the real-time progress status and pipeline stage of a scan session.
    """
    session = game_sessions.get_session(scan_id)
    if not session:
        return {
            "scan_id": scan_id,
            "status": "not_found",
            "progress_percent": 0,
            "current_phase": "unknown",
            "message": "Session not found or expired"
        }

    return {
        "scan_id": scan_id,
        "status": "ready",
        "progress_percent": 100,
        "current_phase": "mansion_constructed",
        "role": session.role.value,
        "fell_back": session.fell_back,
        "created_at": session.created_at,
        "message": "The cursed estate is ready for investigation."
    }


@app.get("/api/map/{scan_id}", response_model=MapViewResponse)


def get_map_endpoint(scan_id: str):
    """
    Returns the cursed mansion map with 5 rooms and whisper signals.
    No answers or real/decoy statuses are leaked.
    """
    session = game_sessions.get_session(scan_id)
    if not session:
        raise HTTPException(status_code=404, detail="Scan session not found or expired")
    return session.to_map_view()


@app.post("/api/enter-room", response_model=EnterRoomResponse)
def enter_room_endpoint(payload: EnterRoomRequest):
    """
    Spends one lantern visit and enters the requested 3D room.
    Rejects if lantern visits are depleted.
    """
    session = game_sessions.get_session(payload.scan_id)
    if not session:
        raise HTTPException(status_code=404, detail="Scan session not found")

    room_name_clean = payload.room_name.lower().strip()
    result = session.spend_lantern_visit(room_name_clean)
    if not result.get("is_valid"):
        raise HTTPException(status_code=400, detail=result.get("error", "Cannot enter room"))

    return result


@app.get("/api/room/{scan_id}/{room_name}", response_model=RoomDetailResponse)
def get_room_endpoint(scan_id: str, room_name: str):
    """
    Returns the 3D room objects, spatial coordinates, and wall riddle without spending a visit (e.g. for inspection).
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


@app.post("/api/warmth", response_model=WarmthResponse)
def get_warmth_endpoint(payload: WarmthRequest):
    """
    Throttled warmth calculation endpoint.
    Takes player (x, y, z) position and returns proximity warmth (0.0 to 1.0)
    to drive the dynamic heartbeat pulse without leaking object identity or location.
    """
    session = game_sessions.get_session(payload.scan_id)
    if not session:
        raise HTTPException(status_code=404, detail="Scan session not found")

    room_name_clean = payload.room_name.lower().strip()
    return session.calculate_warmth(
        room_name=room_name_clean,
        x=payload.x,
        y=payload.y,
        z=payload.z
    )


@app.post("/api/check", response_model=CheckResponse)
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


@app.get("/api/report/{scan_id}", response_model=HauntingReportResponse)
def get_haunting_report_endpoint(scan_id: str):
    """
    Returns the comprehensive Haunting Report with found relics, missed relics, fix suggestions, and rank title.
    """
    report = game_sessions.generate_haunting_report(scan_id)
    if "error" in report:
        raise HTTPException(status_code=404, detail=report["error"])
    return report


@app.post("/api/cache/refresh", response_model=CacheRefreshResponse)
def refresh_cache_endpoint():
    """Manually refreshes the offline sample cache."""
    cache = generate_and_save_sample_cache()
    return {"status": "refreshed", "cached_roles": list(cache.keys())}


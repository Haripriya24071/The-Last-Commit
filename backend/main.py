from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="The Last Commit — Ghost Hunting API",
    description="Haunted code scanner backend that reconstructs Git repositories as 3D haunted mansions.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default is http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "game": "The Last Commit",
        "tagline": "Ghost hunting, except the ghosts are your bugs.",
        "status": "awake",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "whisper": "The mansion doors stand open..."
    }

"""
Quiztopia Backend - FastAPI + Supabase (PostgreSQL)
Production-ready API
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn

from routes import quizzes, users, gamification, notes

app = FastAPI(
    title="Quiztopia API",
    version="1.0.0",
    description="Quiztopia - Modern Eğitim Platformu API"
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://quiztopia.app",          # production domain
        "https://www.quiztopia.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(quizzes.router,       prefix="/api/quizzes",        tags=["Quizzes"])
app.include_router(users.router,         prefix="/api/users",           tags=["Users"])
app.include_router(gamification.router,  prefix="/api/gamification",    tags=["Gamification"])
app.include_router(notes.router,         prefix="/api/notes",           tags=["Notes"])


@app.get("/")
async def root():
    return {"message": "Quiztopia API v1.0 — çalışıyor 🚀"}


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

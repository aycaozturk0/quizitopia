from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ── Enums ────────────────────────────────────────────────────────────────────
class Difficulty(str, Enum):
    kolay = "Kolay"
    orta  = "Orta"
    zor   = "Zor"


class UserLevel(str, Enum):
    caylak    = "Çaylak"
    acemi     = "Acemi"
    orta      = "Orta Seviye"
    uzman     = "Uzman"
    usta      = "Usta"
    efsane    = "Efsane"


# ── Quiz ─────────────────────────────────────────────────────────────────────
class QuestionBase(BaseModel):
    kategori:     str
    zorluk:       Difficulty
    soru:         str
    secenekler:   List[str]
    dogru_cevap:  str


class Question(QuestionBase):
    id: int


class QuizSubmitRequest(BaseModel):
    user_id:     str
    question_id: int
    answer:      str          # "A", "B", "C", "D"
    time_spent:  int = 0      # seconds


class QuizSubmitResponse(BaseModel):
    correct:       bool
    correct_answer: str
    xp_earned:     int
    badges_earned: List[str]
    current_xp:    int
    current_level: str


# ── User ─────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    id:       str
    email:    str
    username: str


class UserProfile(BaseModel):
    id:            str
    email:         str
    username:      str
    total_xp:      int
    level:         UserLevel
    badges:        List[str] = []
    quiz_count:    int = 0
    correct_count: int = 0
    created_at:    Optional[datetime] = None


class UserStats(BaseModel):
    total_xp:        int
    current_level:   str
    level_progress:  float          # 0.0 – 1.0
    quiz_count:      int
    correct_count:   int
    accuracy:        float
    topic_breakdown: dict           # {kategori: {total, correct, pct}}
    recent_badges:   List[str] = []


# ── Gamification ─────────────────────────────────────────────────────────────
class LeaderboardEntry(BaseModel):
    rank:      int
    username:  str
    xp:        int
    level:     str
    badges:    List[str] = []


class BadgeInfo(BaseModel):
    id:          str
    name:        str
    description: str
    icon:        str
    xp_reward:   int


# ── Notes ────────────────────────────────────────────────────────────────────
class NoteContent(BaseModel):
    baslik: str
    metin:  str


class DersNotu(BaseModel):
    ders_adi:  str
    icerikler: List[NoteContent]

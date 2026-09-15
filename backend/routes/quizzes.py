"""
Quiz endpoint'leri
GET  /api/quizzes/                     → tüm sorular (filtre destekli)
GET  /api/quizzes/categories           → kategori listesi
GET  /api/quizzes/{id}                 → tek soru
POST /api/quizzes/submit               → cevap gönder + XP + rozet
GET  /api/quizzes/history/{user_id}    → kullanıcı geçmişi
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, List
import json, os, random

from database import get_supabase
from models import QuizSubmitRequest, QuizSubmitResponse
from gamification_engine import calculate_xp, get_level, check_badges, BADGES

router = APIRouter()

# ── Local JSON fallback (tablolar boşken) ────────────────────────────────────
_DATA_PATH = os.path.join(os.path.dirname(__file__), "yeni_veritabani.json")
with open(_DATA_PATH, encoding="utf-8") as f:
    LOCAL_QUESTIONS = json.load(f)

# Assign IDs
for i, q in enumerate(LOCAL_QUESTIONS):
    q["id"] = i + 1


# ── Helpers ──────────────────────────────────────────────────────────────────
def _normalize_answer(ans: str) -> str:
    """'a)', 'A', 'a' → 'A'"""
    return ans.strip().upper().replace(")", "").replace(".", "")


def _check_answer(question: dict, user_answer: str) -> bool:
    correct = _normalize_answer(question["dogru_cevap"])
    given   = _normalize_answer(user_answer)
    return correct == given


# ── Routes ───────────────────────────────────────────────────────────────────
@router.get("/")
async def get_questions(
    kategori:  Optional[str] = None,
    zorluk:    Optional[str] = None,
    limit:     int = Query(20, le=100),
    shuffle:   bool = True,
    db=Depends(get_supabase),
):
    try:
        query = db.table("questions").select("*")
        if kategori:
            query = query.eq("kategori", kategori.upper())
        if zorluk:
            query = query.eq("zorluk", zorluk)
        result = query.limit(limit).execute()
        data = result.data

        # Supabase boşsa local JSON kullan
        if not data:
            data = LOCAL_QUESTIONS.copy()
            if kategori:
                data = [q for q in data if q["kategori"].upper() == kategori.upper()]
            if zorluk:
                data = [q for q in data if q["zorluk"] == zorluk]
            if shuffle:
                random.shuffle(data)
            data = data[:limit]
    except Exception:
        data = LOCAL_QUESTIONS.copy()
        if kategori:
            data = [q for q in data if q["kategori"].upper() == kategori.upper()]
        if zorluk:
            data = [q for q in data if q["zorluk"] == zorluk]
        if shuffle:
            random.shuffle(data)
        data = data[:limit]

    return {"questions": data, "total": len(data)}


@router.get("/categories")
async def get_categories():
    cats = list(set(q["kategori"] for q in LOCAL_QUESTIONS))
    return {"categories": sorted(cats)}


@router.get("/{question_id}")
async def get_question(question_id: int, db=Depends(get_supabase)):
    try:
        result = db.table("questions").select("*").eq("id", question_id).single().execute()
        if result.data:
            return result.data
    except Exception:
        pass

    for q in LOCAL_QUESTIONS:
        if q["id"] == question_id:
            return q
    raise HTTPException(status_code=404, detail="Soru bulunamadı")


@router.post("/submit", response_model=QuizSubmitResponse)
async def submit_answer(payload: QuizSubmitRequest, db=Depends(get_supabase)):
    # Soruyu bul
    question = None
    try:
        res = db.table("questions").select("*").eq("id", payload.question_id).single().execute()
        question = res.data
    except Exception:
        pass
    if not question:
        for q in LOCAL_QUESTIONS:
            if q["id"] == payload.question_id:
                question = q
                break
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")

    is_correct = _check_answer(question, payload.answer)

    # Kullanıcı durumunu çek
    user_xp        = 0
    quiz_count     = 0
    correct_count  = 0
    streak         = 0
    existing_badges: List[str] = []
    category_correct = 0

    try:
        u = db.table("users").select("*").eq("id", payload.user_id).single().execute()
        if u.data:
            user_xp       = u.data.get("total_xp", 0)
            quiz_count    = u.data.get("quiz_count", 0)
            correct_count = u.data.get("correct_count", 0)
            streak        = u.data.get("streak", 0)
            existing_badges = u.data.get("badges", []) or []
    except Exception:
        pass

    # XP hesapla
    xp_earned   = 0
    new_badges  = []
    badge_xp    = 0

    if is_correct:
        streak        += 1
        correct_count += 1
        xp_earned = calculate_xp(question["zorluk"], payload.time_spent, streak)

        # Kategori doğru sayısı
        try:
            cat_res = (
                db.table("test_history")
                .select("id", count="exact")
                .eq("user_id", payload.user_id)
                .eq("kategori", question["kategori"])
                .eq("is_correct", True)
                .execute()
            )
            category_correct = cat_res.count or 0
        except Exception:
            category_correct = 0

        new_badges, badge_xp = check_badges(
            existing_badges,
            user_xp + xp_earned,
            quiz_count + 1,
            correct_count,
            streak,
            payload.time_spent,
            question["kategori"],
            category_correct + 1,
        )
    else:
        streak = 0

    total_xp_earned = xp_earned + badge_xp
    new_total_xp    = user_xp + total_xp_earned
    new_level       = get_level(new_total_xp)

    # DB güncelle
    try:
        db.table("users").update({
            "total_xp":     new_total_xp,
            "level":        new_level,
            "quiz_count":   quiz_count + 1,
            "correct_count": correct_count,
            "streak":       streak,
            "badges":       existing_badges + new_badges,
        }).eq("id", payload.user_id).execute()

        db.table("test_history").insert({
            "user_id":     payload.user_id,
            "question_id": payload.question_id,
            "kategori":    question["kategori"],
            "zorluk":      question["zorluk"],
            "is_correct":  is_correct,
            "time_spent":  payload.time_spent,
            "xp_earned":   total_xp_earned,
        }).execute()

        if new_badges:
            for b in new_badges:
                db.table("user_achievements").insert({
                    "user_id":  payload.user_id,
                    "badge_id": b,
                }).execute()
    except Exception:
        pass  # local-only mode

    return QuizSubmitResponse(
        correct=is_correct,
        correct_answer=question["dogru_cevap"],
        xp_earned=total_xp_earned,
        badges_earned=[BADGES[b]["name"] for b in new_badges],
        current_xp=new_total_xp,
        current_level=new_level,
    )


@router.get("/history/{user_id}")
async def get_history(user_id: str, limit: int = 50, db=Depends(get_supabase)):
    try:
        result = (
            db.table("test_history")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return {"history": result.data}
    except Exception:
        return {"history": []}

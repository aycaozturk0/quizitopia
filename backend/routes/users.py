"""
Kullanıcı endpoint'leri
POST /api/users/            → kullanıcı oluştur / upsert
GET  /api/users/{id}        → profil
GET  /api/users/{id}/stats  → istatistik + konu bazlı analiz
"""

from fastapi import APIRouter, Depends, HTTPException
from database import get_supabase
from models import UserCreate, UserProfile, UserStats
from gamification_engine import get_level, get_level_progress, BADGES

router = APIRouter()


@router.post("/", response_model=UserProfile)
async def create_or_update_user(user: UserCreate, db=Depends(get_supabase)):
    try:
        existing = db.table("users").select("*").eq("id", user.id).execute()
        if existing.data:
            return existing.data[0]

        new_user = {
            "id":            user.id,
            "email":         user.email,
            "username":      user.username,
            "total_xp":      0,
            "level":         "Çaylak",
            "badges":        [],
            "quiz_count":    0,
            "correct_count": 0,
            "streak":        0,
        }
        result = db.table("users").insert(new_user).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}", response_model=UserProfile)
async def get_user(user_id: str, db=Depends(get_supabase)):
    try:
        result = db.table("users").select("*").eq("id", user_id).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        return result.data
    except Exception as e:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")


@router.get("/{user_id}/stats", response_model=UserStats)
async def get_user_stats(user_id: str, db=Depends(get_supabase)):
    try:
        u = db.table("users").select("*").eq("id", user_id).single().execute()
        if not u.data:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        user = u.data

        # Konu bazlı analiz
        history = (
            db.table("test_history")
            .select("kategori, is_correct")
            .eq("user_id", user_id)
            .execute()
        )

        topic_breakdown: dict = {}
        for row in (history.data or []):
            cat = row["kategori"]
            if cat not in topic_breakdown:
                topic_breakdown[cat] = {"total": 0, "correct": 0, "pct": 0.0}
            topic_breakdown[cat]["total"] += 1
            if row["is_correct"]:
                topic_breakdown[cat]["correct"] += 1

        for cat in topic_breakdown:
            t = topic_breakdown[cat]["total"]
            c = topic_breakdown[cat]["correct"]
            topic_breakdown[cat]["pct"] = round(c / t * 100, 1) if t else 0

        total_xp    = user.get("total_xp", 0)
        quiz_count  = user.get("quiz_count", 0)
        correct_cnt = user.get("correct_count", 0)
        badges      = user.get("badges", []) or []

        return UserStats(
            total_xp=total_xp,
            current_level=get_level(total_xp),
            level_progress=get_level_progress(total_xp),
            quiz_count=quiz_count,
            correct_count=correct_cnt,
            accuracy=round(correct_cnt / quiz_count * 100, 1) if quiz_count else 0,
            topic_breakdown=topic_breakdown,
            recent_badges=badges[-5:],
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

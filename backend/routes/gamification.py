"""
Oyunlaştırma endpoint'leri
GET /api/gamification/leaderboard   → haftalık/aylık liderlik tablosu
GET /api/gamification/badges        → tüm rozet tanımları
GET /api/gamification/badges/{uid}  → kullanıcı rozetleri
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional
from database import get_supabase
from gamification_engine import BADGES, get_level

router = APIRouter()


@router.get("/leaderboard")
async def get_leaderboard(
    period: str = Query("weekly", regex="^(weekly|monthly|alltime)$"),
    limit:  int = Query(10, le=50),
    db=Depends(get_supabase),
):
    try:
        result = (
            db.table("users")
            .select("username, total_xp, level, badges")
            .order("total_xp", desc=True)
            .limit(limit)
            .execute()
        )
        board = []
        for rank, row in enumerate(result.data or [], start=1):
            board.append({
                "rank":     rank,
                "username": row["username"],
                "xp":       row["total_xp"],
                "level":    row.get("level", get_level(row["total_xp"])),
                "badges":   row.get("badges", []) or [],
            })
        return {"leaderboard": board, "period": period}
    except Exception:
        return {"leaderboard": [], "period": period}


@router.get("/badges")
async def get_all_badges():
    return {
        "badges": [
            {"id": k, **v} for k, v in BADGES.items()
        ]
    }


@router.get("/badges/{user_id}")
async def get_user_badges(user_id: str, db=Depends(get_supabase)):
    try:
        result = (
            db.table("user_achievements")
            .select("badge_id, earned_at")
            .eq("user_id", user_id)
            .order("earned_at", desc=True)
            .execute()
        )
        earned = []
        for row in (result.data or []):
            bid = row["badge_id"]
            if bid in BADGES:
                earned.append({
                    "id":          bid,
                    "earned_at":   row.get("earned_at"),
                    **BADGES[bid],
                })
        return {"badges": earned}
    except Exception:
        return {"badges": []}

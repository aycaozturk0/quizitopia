"""
XP hesaplama, seviye belirleme ve rozet tetikleme motoru.
"""

from typing import List, Tuple

# ── XP Tablosu ───────────────────────────────────────────────────────────────
XP_CORRECT = {"Kolay": 10, "Orta": 20, "Zor": 35}
XP_SPEED_BONUS = 5          # 10 sn altında cevaplama
XP_STREAK_BONUS = 15        # 5 doğru arka arkaya

# ── Seviye Eşikleri ──────────────────────────────────────────────────────────
LEVELS = [
    (0,    "Çaylak"),
    (100,  "Acemi"),
    (300,  "Orta Seviye"),
    (700,  "Uzman"),
    (1500, "Usta"),
    (3000, "Efsane"),
]

# ── Rozet Tanımları ──────────────────────────────────────────────────────────
BADGES = {
    "ilk_cevap": {
        "name": "İlk Adım",
        "description": "İlk soruyu cevapladın!",
        "icon": "🎯",
        "xp_reward": 25,
    },
    "ilk_100": {
        "name": "İlk 100",
        "description": "100 XP'ye ulaştın!",
        "icon": "💯",
        "xp_reward": 50,
    },
    "hatasiz_5": {
        "name": "Hatasız Seri",
        "description": "5 soruyu arka arkaya doğru yanıtladın!",
        "icon": "🔥",
        "xp_reward": 40,
    },
    "hatasiz_10": {
        "name": "Demir Zihin",
        "description": "10 soruyu arka arkaya doğru yanıtladın!",
        "icon": "🧠",
        "xp_reward": 80,
    },
    "sql_uzman": {
        "name": "SQL Uzmanı",
        "description": "SQL kategorisinde 20 soruyu doğru yanıtladın!",
        "icon": "🗄️",
        "xp_reward": 100,
    },
    "bilgi_uzman": {
        "name": "Bilgi Güvenliği Uzmanı",
        "description": "Bilgi Güvenliği kategorisinde 20 soruyu doğru yanıtladın!",
        "icon": "🛡️",
        "xp_reward": 100,
    },
    "cpp_uzman": {
        "name": "C++ Gurusu",
        "description": "C++ kategorisinde 20 soruyu doğru yanıtladın!",
        "icon": "⚡",
        "xp_reward": 100,
    },
    "java_uzman": {
        "name": "Java Ustası",
        "description": "Java kategorisinde 20 soruyu doğru yanıtladın!",
        "icon": "☕",
        "xp_reward": 100,
    },
    "hiz_yildizi": {
        "name": "Hız Yıldızı",
        "description": "10 saniyenin altında doğru cevap verdin!",
        "icon": "⚡",
        "xp_reward": 20,
    },
    "efsane": {
        "name": "Efsane",
        "description": "3000 XP'ye ulaştın!",
        "icon": "👑",
        "xp_reward": 200,
    },
}

CATEGORY_BADGE_MAP = {
    "SQL":   "sql_uzman",
    "BILGI": "bilgi_uzman",
    "C++":   "cpp_uzman",
    "JAVA":  "java_uzman",
}


def calculate_xp(difficulty: str, time_spent: int, streak: int) -> int:
    base = XP_CORRECT.get(difficulty, 10)
    bonus = 0
    if time_spent < 10:
        bonus += XP_SPEED_BONUS
    if streak > 0 and streak % 5 == 0:
        bonus += XP_STREAK_BONUS
    return base + bonus


def get_level(total_xp: int) -> str:
    level = LEVELS[0][1]
    for threshold, name in LEVELS:
        if total_xp >= threshold:
            level = name
    return level


def get_level_progress(total_xp: int) -> float:
    """Returns 0.0 – 1.0 for UI progress bar."""
    for i in range(len(LEVELS) - 1):
        low_xp, _ = LEVELS[i]
        high_xp, _ = LEVELS[i + 1]
        if low_xp <= total_xp < high_xp:
            return (total_xp - low_xp) / (high_xp - low_xp)
    return 1.0


def check_badges(
    existing_badges: List[str],
    total_xp: int,
    quiz_count: int,
    correct_count: int,
    streak: int,
    time_spent: int,
    category: str,
    category_correct: int,
) -> Tuple[List[str], int]:
    """
    Returns: (newly_earned_badge_ids, bonus_xp_from_badges)
    """
    new_badges = []
    bonus_xp   = 0

    def award(badge_id: str):
        nonlocal bonus_xp
        if badge_id not in existing_badges and badge_id not in new_badges:
            new_badges.append(badge_id)
            bonus_xp += BADGES[badge_id]["xp_reward"]

    if quiz_count == 1:
        award("ilk_cevap")
    if total_xp >= 100:
        award("ilk_100")
    if streak >= 5:
        award("hatasiz_5")
    if streak >= 10:
        award("hatasiz_10")
    if time_spent < 10 and correct_count > 0:
        award("hiz_yildizi")
    if total_xp >= 3000:
        award("efsane")
    if category in CATEGORY_BADGE_MAP and category_correct >= 20:
        award(CATEGORY_BADGE_MAP[category])

    return new_badges, bonus_xp

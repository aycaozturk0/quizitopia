"""
Ders notları endpoint'leri
GET /api/notes/                 → tüm dersler
GET /api/notes/{ders_adi}       → tek ders içerikleri
"""

from fastapi import APIRouter, HTTPException
import json, os

router = APIRouter()

_NOTES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ders_notlari.json")
with open(_NOTES_PATH, encoding="utf-8") as f:
    DERS_NOTLARI = json.load(f)


@router.get("/")
async def get_all_notes():
    return {
        "dersler": [
            {"ders_adi": d["ders_adi"], "konu_sayisi": len(d["icerikler"])}
            for d in DERS_NOTLARI
        ]
    }


@router.get("/{ders_adi}")
async def get_note(ders_adi: str):
    for ders in DERS_NOTLARI:
        if ders["ders_adi"].lower().replace(" ", "") == ders_adi.lower().replace(" ", ""):
            return ders
    raise HTTPException(status_code=404, detail=f"'{ders_adi}' dersi bulunamadı")

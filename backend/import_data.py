"""
Quiztopia — JSON verilerini Supabase'e aktar.
Kullanım: python import_data.py
"""

import json
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

sb = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

# ── Quiz Soruları ────────────────────────────────────────────────────────────
with open("yeni_veritabani.json", encoding="utf-8") as f:
    questions = json.load(f)

rows = [
    {
        "kategori":    q["kategori"],
        "zorluk":      q["zorluk"],
        "soru":        q["soru"],
        "secenekler":  q["secenekler"],
        "dogru_cevap": q["dogru_cevap"],
    }
    for q in questions
]

# Batch insert (100'er)
batch_size = 100
total = 0
for i in range(0, len(rows), batch_size):
    batch = rows[i : i + batch_size]
    sb.table("questions").upsert(batch, on_conflict="soru").execute()
    total += len(batch)
    print(f"  {total}/{len(rows)} soru aktarıldı...")

print(f"✅ {total} soru Supabase'e aktarıldı.")

# ── Ders Notları (ayrı tablo isterseniz) ─────────────────────────────────────
# Şu an local JSON ile servis ediliyor; gerekirse:
# with open("ders_notlari.json", ...) as f: ...
# sb.table("ders_notlari").upsert(...).execute()

print("✅ Import tamamlandı.")

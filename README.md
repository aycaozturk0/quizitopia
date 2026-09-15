# Quiztopia 🚀

Modern, oyunlaştırılmış quiz platformu. FastAPI + Supabase backend, React + Tailwind frontend.

---

## Proje Yapısı

```
quiztopia/
├── backend/
│   ├── main.py                  # FastAPI uygulaması
│   ├── database.py              # Supabase bağlantısı
│   ├── models.py                # Pydantic şemaları
│   ├── gamification_engine.py   # XP + rozet mantığı
│   ├── import_data.py           # JSON → Supabase aktarım
│   ├── supabase_schema.sql      # Tablo tanımları
│   ├── routes/
│   │   ├── quizzes.py           # Quiz endpoint'leri
│   │   ├── users.py             # Kullanıcı endpoint'leri
│   │   ├── gamification.py      # Liderlik + rozetler
│   │   └── notes.py             # Ders notları
│   ├── yeni_veritabani.json     # 300 quiz sorusu
│   └── ders_notlari.json        # 7 ders notu
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ZenMode.jsx       # Tam ekran odaklı test arayüzü
    │   │   ├── CodeBlock.jsx     # Syntax highlighting
    │   │   ├── QuizConfig.jsx    # Quiz yapılandırma
    │   │   ├── XPBadge.jsx       # XP bar + rozet grid
    │   │   ├── Navbar.jsx        # Navigasyon
    │   │   ├── TimerRing.jsx     # Dairesel geri sayım
    │   │   └── SessionStats.jsx  # Oturum istatistikleri
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── QuizPage.jsx      # Quiz oturumu yönetimi
    │   │   ├── DashboardPage.jsx # Analitik + grafikler
    │   │   ├── NotesPage.jsx     # Ders notları okuyucu
    │   │   └── LeaderboardPage.jsx
    │   ├── hooks/
    │   │   ├── useQuiz.js        # Quiz state makinesi
    │   │   └── useTimer.js       # Geri sayım hook'u
    │   ├── context/
    │   │   └── UserContext.jsx   # Global kullanıcı + toast state
    │   └── utils/
    │       └── api.js            # Backend iletişimi + local fallback
    └── ...
```

---

## Kurulum

### 1. Supabase

1. [supabase.com](https://supabase.com) → yeni proje oluştur
2. SQL Editor'a `backend/supabase_schema.sql` içeriğini yapıştır → çalıştır
3. Project Settings → API → URL ve service_role key'i kopyala

### 2. Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# .env dosyasını Supabase bilgileriyle doldur

# Soruları Supabase'e aktar (isteğe bağlı — local JSON fallback var)
python import_data.py

# Sunucuyu başlat
uvicorn main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### 4. Production

**Backend (Render / Railway / Fly.io):**
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Frontend (Vercel / Netlify):**
```bash
npm run build
# dist/ klasörünü deploy et
# VITE_API_URL=https://api.quiztopia.app ortam değişkenini ekle
```

---

## API Endpoint'leri

| Method | Endpoint                         | Açıklama                        |
|--------|----------------------------------|---------------------------------|
| GET    | `/api/quizzes/`                  | Sorular (filtre: kategori, zorluk) |
| GET    | `/api/quizzes/categories`        | Kategori listesi                |
| POST   | `/api/quizzes/submit`            | Cevap gönder → XP + rozet       |
| GET    | `/api/users/{id}/stats`          | Kullanıcı istatistikleri        |
| GET    | `/api/gamification/leaderboard`  | Liderlik tablosu                |
| GET    | `/api/notes/`                    | Ders listesi                    |
| GET    | `/api/notes/{ders_adi}`          | Ders içeriği                    |

---

## XP Sistemi

| Durum            | XP   |
|-----------------|------|
| Kolay doğru      | +10  |
| Orta doğru       | +20  |
| Zor doğru        | +35  |
| Hız bonusu (<10s)| +5   |
| 5'li seri bonusu | +15  |

**Seviyeler:** Çaylak → Acemi → Orta Seviye → Uzman → Usta → Efsane

---

## Özellikler

- **Zen Modu** — dikkat dağıtıcısız tam ekran quiz, klavye kısayolları (A/B/C/D, 1/2/3/4, Enter)
- **Dinamik Kod Vurgulama** — C++, Java, Python, SQL, HTML sorularında otomatik syntax highlight
- **Dairesel Zamanlayıcı** — 60 saniyelik geri sayım, renk geçişli
- **XP & Rozetler** — anlık toast bildirimleri, 10 farklı rozet
- **Konu Analizi** — radar ve çubuk grafik, zayıf konu tespiti
- **Liderlik Tablosu** — haftalık / aylık / tüm zamanlar
- **Ders Notları** — 7 ders, arama destekli akordeon
- **Offline-first** — Supabase'e ulaşamazsa local JSON ile çalışır

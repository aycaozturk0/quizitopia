-- ============================================================
-- Quiztopia — Supabase (PostgreSQL) Şeması
-- Supabase SQL Editor'a kopyala ve çalıştır.
-- ============================================================

-- 1. USERS
create table if not exists public.users (
  id            text primary key,          -- Supabase Auth UID
  email         text not null unique,
  username      text not null,
  total_xp      integer not null default 0,
  level         text    not null default 'Çaylak',
  quiz_count    integer not null default 0,
  correct_count integer not null default 0,
  streak        integer not null default 0,
  badges        text[]           default '{}',
  created_at    timestamptz not null default now()
);

-- 2. QUESTIONS
create table if not exists public.questions (
  id          serial primary key,
  kategori    text   not null,
  zorluk      text   not null check (zorluk in ('Kolay','Orta','Zor')),
  soru        text   not null,
  secenekler  jsonb  not null,   -- ["a) ...", "b) ...", ...]
  dogru_cevap text   not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_questions_kategori on public.questions(kategori);
create index if not exists idx_questions_zorluk   on public.questions(zorluk);

-- 3. TEST_HISTORY
create table if not exists public.test_history (
  id          bigserial primary key,
  user_id     text        not null references public.users(id) on delete cascade,
  question_id integer     not null references public.questions(id) on delete cascade,
  kategori    text        not null,
  zorluk      text        not null,
  is_correct  boolean     not null default false,
  time_spent  integer     not null default 0,   -- saniye
  xp_earned   integer     not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_history_user    on public.test_history(user_id);
create index if not exists idx_history_kategori on public.test_history(user_id, kategori);

-- 4. USER_ACHIEVEMENTS (rozetler)
create table if not exists public.user_achievements (
  id        bigserial primary key,
  user_id   text        not null references public.users(id) on delete cascade,
  badge_id  text        not null,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

-- ============================================================
-- RLS (Row Level Security) — production için açılmalı
-- ============================================================

alter table public.users           enable row level security;
alter table public.questions       enable row level security;
alter table public.test_history    enable row level security;
alter table public.user_achievements enable row level security;

-- Kullanıcılar kendi verilerini okuyabilir/yazabilir
create policy "users_own_data" on public.users
  for all using (auth.uid()::text = id);

-- Sorular herkese açık (okunabilir)
create policy "questions_public_read" on public.questions
  for select using (true);

-- Test geçmişi: sadece kendi
create policy "history_own" on public.test_history
  for all using (auth.uid()::text = user_id);

-- Rozetler: sadece kendi
create policy "achievements_own" on public.user_achievements
  for all using (auth.uid()::text = user_id);

-- ============================================================
-- JSON'dan toplu soru import fonksiyonu
-- ============================================================
create or replace function import_questions_from_json(questions_json jsonb)
returns integer
language plpgsql
as $$
declare
  q     jsonb;
  cnt   integer := 0;
begin
  for q in select * from jsonb_array_elements(questions_json)
  loop
    insert into public.questions (kategori, zorluk, soru, secenekler, dogru_cevap)
    values (
      q->>'kategori',
      q->>'zorluk',
      q->>'soru',
      q->'secenekler',
      q->>'dogru_cevap'
    )
    on conflict do nothing;
    cnt := cnt + 1;
  end loop;
  return cnt;
end;
$$;

-- Kullanımı:
-- select import_questions_from_json(:'json_content');

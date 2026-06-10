-- ─────────────────────────────────────────────
-- 동네벚꽃 초기 스키마 + RLS (설계서 v1.0 §7·§8)
-- 적용: Supabase SQL Editor에 붙여넣기, 또는 `supabase db push`
--
-- 프라이버시 설계(§8 "생년월일시·사주 원본 절대 노출 금지"):
--   · profiles        = 매칭 상대가 볼 수 있는 공개 정보 + saju_summary(일간/오행/요약)만
--   · saju_private    = 생년월일시 + 전체 팔자(원본). 본인만. 매칭 상대도 불가.
--   · daily-match 등 서버 로직은 service role로 RLS 우회해 saju_private 접근.
-- ─────────────────────────────────────────────

create extension if not exists pgcrypto;

-- ── 공개 프로필 ──────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  nickname text not null,
  gender text not null check (gender in ('M', 'F')),
  sido text not null,
  gu text not null,
  gu_verified_at timestamptz,
  purposes text[] not null default '{}',
  intro text,
  avatar_url text,
  saju_summary jsonb,                       -- 일간/오행/요약 (원본 아님)
  flower_temperature numeric(4,1) not null default 36.5,  -- 벚꽃온도
  points int not null default 0,
  phone_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_region_idx on public.profiles (sido, gu);

-- ── 사주 원본 (본인 전용) ───────────────────
create table public.saju_private (
  user_id uuid primary key references public.profiles on delete cascade,
  birth_date date not null,
  birth_time smallint,                      -- 0~23, 시 모름이면 null
  is_lunar boolean not null default false,
  is_leap_month boolean not null default false,
  chart jsonb not null,                     -- 전체 팔자/오행/십신
  created_at timestamptz not null default now()
);

-- ── 매칭 ────────────────────────────────────
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles on delete cascade,
  user_b uuid not null references public.profiles on delete cascade,
  match_date date not null,
  gunghap_score smallint not null,
  gunghap_summary text,
  deep_reading text,                        -- AI 깊은풀이 캐시(1회 생성)
  status text not null default 'pending',   -- pending|accepted|passed|expired
  is_paid_extra boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_a, user_b, match_date)
);
create index matches_user_a_idx on public.matches (user_a, match_date);
create index matches_user_b_idx on public.matches (user_b, match_date);

-- ── 채팅 ────────────────────────────────────
create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches on delete cascade,
  created_at timestamptz not null default now()
);

create table public.messages (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.chat_rooms on delete cascade,
  sender uuid not null references public.profiles on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index messages_room_idx on public.messages (room_id, created_at);

-- ── 약속 · 후기 · 벚꽃온도 ──────────────────
create table public.meetups (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms on delete cascade,
  meet_at timestamptz not null,
  place text,
  status text not null default 'scheduled'  -- scheduled|done|noshow|canceled
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  meetup_id uuid not null references public.meetups on delete cascade,
  reviewer uuid not null references public.profiles on delete cascade,
  rating text not null,
  praises text[] default '{}',
  temp_delta numeric(3,1) not null,
  created_at timestamptz not null default now(),
  unique (meetup_id, reviewer)
);

-- ── 포인트 원장 (증감은 service role만) ─────
create table public.point_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles on delete cascade,
  delta int not null,
  reason text not null,
  ref_id text,
  created_at timestamptz not null default now()
);
create index point_ledger_user_idx on public.point_ledger (user_id, created_at);

-- ── 차단 · 신고 ─────────────────────────────
create table public.blocks (
  blocker uuid not null references public.profiles on delete cascade,
  blocked uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid not null references public.profiles on delete cascade,
  target uuid not null references public.profiles on delete cascade,
  category text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 헬퍼 함수 (RLS 재귀 방지 위해 security definer)
-- ─────────────────────────────────────────────
create or replace function public.is_matched(other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.matches m
    where (m.user_a = auth.uid() and m.user_b = other)
       or (m.user_b = auth.uid() and m.user_a = other)
  );
$$;

create or replace function public.is_room_participant(room uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.chat_rooms r
    join public.matches m on m.id = r.match_id
    where r.id = room and (m.user_a = auth.uid() or m.user_b = auth.uid())
  );
$$;

-- ─────────────────────────────────────────────
-- 트리거
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- 포인트 원장 → profiles.points 동기화
create or replace function public.apply_point_delta() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set points = points + new.delta where id = new.user_id;
  return new;
end; $$;
create trigger point_ledger_apply after insert on public.point_ledger
  for each row execute function public.apply_point_delta();

-- 후기 → 상대의 벚꽃온도 반영 (0~99 클램프)
create or replace function public.apply_review_temp() returns trigger
language plpgsql security definer set search_path = public as $$
declare target_id uuid;
begin
  select case when m.user_a = new.reviewer then m.user_b else m.user_a end into target_id
  from public.meetups mt
  join public.chat_rooms r on r.id = mt.room_id
  join public.matches m on m.id = r.match_id
  where mt.id = new.meetup_id;

  if target_id is not null then
    update public.profiles
      set flower_temperature = greatest(0, least(99, flower_temperature + new.temp_delta))
      where id = target_id;
  end if;
  return new;
end; $$;
create trigger reviews_apply_temp after insert on public.reviews
  for each row execute function public.apply_review_temp();

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.saju_private  enable row level security;
alter table public.matches       enable row level security;
alter table public.chat_rooms    enable row level security;
alter table public.messages      enable row level security;
alter table public.meetups       enable row level security;
alter table public.reviews       enable row level security;
alter table public.point_ledger  enable row level security;
alter table public.blocks        enable row level security;
alter table public.reports       enable row level security;

-- profiles: 본인 + 매칭된 상대만 조회 / 본인만 생성·수정
create policy profiles_select_self    on public.profiles for select using (id = auth.uid());
create policy profiles_select_matched on public.profiles for select using (public.is_matched(id));
create policy profiles_insert_self    on public.profiles for insert with check (id = auth.uid());
create policy profiles_update_self    on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- saju_private: 본인만 (매칭 상대도 불가). 서버는 service role로 우회.
create policy saju_private_self on public.saju_private for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- matches: 당사자만 조회. insert/update(수락·패스)는 추후 service role/RPC로 처리.
create policy matches_select on public.matches for select
  using (user_a = auth.uid() or user_b = auth.uid());

-- chat / messages / meetups: 방 참여자만
create policy chat_rooms_select on public.chat_rooms for select using (public.is_room_participant(id));
create policy messages_select   on public.messages   for select using (public.is_room_participant(room_id));
create policy messages_insert   on public.messages   for insert with check (sender = auth.uid() and public.is_room_participant(room_id));
create policy meetups_select    on public.meetups    for select using (public.is_room_participant(room_id));
create policy meetups_insert    on public.meetups    for insert with check (public.is_room_participant(room_id));
create policy meetups_update    on public.meetups    for update using (public.is_room_participant(room_id));

-- reviews: 본인 작성/조회
create policy reviews_insert      on public.reviews for insert with check (reviewer = auth.uid());
create policy reviews_select_self on public.reviews for select using (reviewer = auth.uid());

-- point_ledger: 본인 조회만 (증감은 service role)
create policy point_ledger_select on public.point_ledger for select using (user_id = auth.uid());

-- blocks / reports: 본인 것만
create policy blocks_all     on public.blocks  for all    using (blocker = auth.uid()) with check (blocker = auth.uid());
create policy reports_insert on public.reports for insert  with check (reporter = auth.uid());

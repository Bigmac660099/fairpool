-- ════════════════════════════════════════════════════════════════════════
-- FAIRPOOL — initial schema, RLS policies, and SECURITY DEFINER vote RPC.
-- Apply with:  supabase db push --linked
-- ════════════════════════════════════════════════════════════════════════

-- ── Tables ───────────────────────────────────────────────────────────────
create table if not exists public.departments (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  code  text not null unique
);

create table if not exists public.profiles (
  id            uuid primary key default gen_random_uuid(),
  clerk_id      text unique,           -- Clerk user ID (null until Clerk is active)
  student_id    text unique check (student_id ~ '^[0-9]{14}$'),
  name          text not null,
  email         text,
  role          text not null default 'student' check (role in ('student','admin','trueAdmin')),
  department_id uuid references public.departments(id) on delete set null,
  semester      int,
  active        boolean not null default true,
  blocked       boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.elections (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text default '',
  status        text not null default 'draft' check (status in ('draft','active','closed')),
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  geo_required  boolean not null default false,
  geo_lat       double precision,
  geo_lon       double precision,
  geo_radius_m  int
);

create table if not exists public.candidates (
  id            uuid primary key default gen_random_uuid(),
  election_id   uuid not null references public.elections(id) on delete cascade,
  name          text not null,
  department_id uuid references public.departments(id) on delete set null,
  photo_url     text,
  symbol_url    text,
  promises      text[] not null default '{}'
);

create table if not exists public.votes (
  id          uuid primary key default gen_random_uuid(),
  election_id uuid not null references public.elections(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  voter_id    uuid not null references public.profiles(id) on delete cascade,
  cast_at     timestamptz not null default now(),
  unique (election_id, voter_id) -- one vote per person per election
);

create table if not exists public.vote_attempts (
  id          uuid primary key default gen_random_uuid(),
  voter_id    uuid not null references public.profiles(id) on delete cascade,
  election_id uuid not null references public.elections(id) on delete cascade,
  at          timestamptz not null default now(),
  ok          boolean not null,
  reason      text
);

create table if not exists public.site_settings (
  key   text primary key,
  value jsonb not null
);

create table if not exists public.audit_log (
  id        uuid primary key default gen_random_uuid(),
  actor_id  uuid,
  action    text not null,
  detail    jsonb,
  at        timestamptz not null default now()
);

-- ── Row-Level Security ─────────────────────────────────────────────────────
alter table public.departments  enable row level security;
alter table public.profiles     enable row level security;
alter table public.elections    enable row level security;
alter table public.candidates   enable row level security;
alter table public.votes        enable row level security;
alter table public.site_settings enable row level security;

-- Public read of reference data.
create policy "read departments" on public.departments for select using (true);
create policy "read elections"   on public.elections   for select using (true);
create policy "read candidates"  on public.candidates  for select using (true);
create policy "read settings"    on public.site_settings for select using (true);

-- Profiles: a user can read their own row.
create policy "read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Votes are NEVER writable directly — only via the cast_vote RPC below.
-- (No insert/update/delete policy is created, so direct writes are blocked.)
-- Aggregate tallies are exposed through a view that bypasses row exposure.

-- ── Live tally view ────────────────────────────────────────────────────────
create or replace view public.vote_tallies as
  select election_id, candidate_id, count(*)::int as count
  from public.votes
  group by election_id, candidate_id;

-- ── cast_vote: SECURITY DEFINER, all validation server-side ────────────────
create or replace function public.cast_vote(
  p_election_id uuid,
  p_candidate_id uuid,
  p_voter_id uuid,
  p_lat double precision default null,
  p_lon double precision default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.elections;
  c public.candidates;
  dist double precision;
begin
  select * into e from public.elections where id = p_election_id;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_candidate', 'message', 'নির্বাচন পাওয়া যায়নি');
  end if;

  -- Active window.
  if e.status <> 'active' or now() < e.starts_at or now() > e.ends_at then
    return jsonb_build_object('ok', false, 'code', 'election_inactive', 'message', 'নির্বাচন চলমান নয়');
  end if;

  -- Valid candidate.
  select * into c from public.candidates where id = p_candidate_id and election_id = p_election_id;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'invalid_candidate', 'message', 'প্রার্থী সঠিক নয়');
  end if;

  -- Geo (haversine in metres).
  if e.geo_required and e.geo_lat is not null and e.geo_lon is not null then
    if p_lat is null or p_lon is null then
      return jsonb_build_object('ok', false, 'code', 'outside_geo', 'message', 'অবস্থান পাওয়া যায়নি');
    end if;
    dist := 6371000 * 2 * asin(sqrt(
      power(sin(radians(p_lat - e.geo_lat) / 2), 2) +
      cos(radians(e.geo_lat)) * cos(radians(p_lat)) *
      power(sin(radians(p_lon - e.geo_lon) / 2), 2)
    ));
    if dist > coalesce(e.geo_radius_m, 1000) then
      return jsonb_build_object('ok', false, 'code', 'outside_geo', 'message', 'আপনি নির্ধারিত এলাকার বাইরে');
    end if;
  end if;

  -- Idempotent / one-vote-per-person.
  begin
    insert into public.votes (election_id, candidate_id, voter_id)
    values (p_election_id, p_candidate_id, p_voter_id);
  exception when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'already_voted', 'message', 'আপনি ইতিমধ্যে ভোট দিয়েছেন');
  end;

  insert into public.vote_attempts (voter_id, election_id, ok) values (p_voter_id, p_election_id, true);
  return jsonb_build_object('ok', true, 'code', 'ok', 'message', 'ভোট গৃহীত হয়েছে');
end;
$$;

-- Admin override (same checks minus identity), restricted to service role.
create or replace function public.cast_vote_as(
  p_election_id uuid, p_candidate_id uuid, p_voter_id uuid
) returns jsonb language plpgsql security definer set search_path = public as $$
begin
  return public.cast_vote(p_election_id, p_candidate_id, p_voter_id, null, null);
end; $$;

revoke all on function public.cast_vote_as(uuid, uuid, uuid) from public;

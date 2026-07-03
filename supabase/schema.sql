-- ============================================================
-- FX Unlock Risk Calculator — Supabase schema
-- Run this in the SQL Editor of project lkzgpxkyueazrnbugldj
-- Safe to re-run: everything is idempotent (IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
-- One row per auth user; created automatically by trigger on signup.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'trader', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that signed up before this schema existed.
insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;

-- ── Risk calculations ───────────────────────────────────────
create table if not exists public.risk_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  instrument text,
  direction text not null check (direction in ('buy', 'sell')),
  account_balance numeric not null check (account_balance >= 0),
  risk_percent numeric not null check (risk_percent > 0 and risk_percent <= 100),
  entry_price numeric not null check (entry_price > 0),
  stop_loss_price numeric not null check (stop_loss_price > 0),
  reward_ratio numeric not null check (reward_ratio > 0),
  position_size numeric not null,
  dollar_risk numeric not null,
  reward_amount numeric not null,
  target_price numeric not null,
  pips_at_risk numeric,
  created_at timestamptz not null default now()
);

create index if not exists risk_calculations_user_created_idx
  on public.risk_calculations (user_id, created_at desc);

alter table public.risk_calculations enable row level security;

drop policy if exists "risk_calculations_select_own" on public.risk_calculations;
create policy "risk_calculations_select_own"
  on public.risk_calculations for select
  using (auth.uid() = user_id);

drop policy if exists "risk_calculations_insert_own" on public.risk_calculations;
create policy "risk_calculations_insert_own"
  on public.risk_calculations for insert
  with check (auth.uid() = user_id);

drop policy if exists "risk_calculations_delete_own" on public.risk_calculations;
create policy "risk_calculations_delete_own"
  on public.risk_calculations for delete
  using (auth.uid() = user_id);

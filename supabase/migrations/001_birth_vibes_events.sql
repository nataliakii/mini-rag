-- Birth Vibes analytics (run in Supabase SQL Editor or via CLI migrate)

create table if not exists public.birth_vibes_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  birth_date text not null,
  birth_time text,
  song_title text not null,
  song_artist text not null,
  movie_title text,
  story text not null
);

comment on table public.birth_vibes_events is 'Server-side inserts only via service role; do not expose key to browser.';

-- Optional: tighten RLS — service role bypasses RLS anyway; block anon/authenticated if you add policies later
alter table public.birth_vibes_events enable row level security;

-- No policies for anon/authenticated = they cannot read/write; service_role still works.

create index if not exists birth_vibes_events_created_at_idx
  on public.birth_vibes_events (created_at desc);

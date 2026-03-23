-- Optional: if inserts work from Dashboard but not from API, your JWT role may be
-- `authenticated` instead of `anon` (depends on key type). Safe to run alongside 002.

drop policy if exists "birth_vibes_events_insert_authenticated" on public.birth_vibes_events;

create policy "birth_vibes_events_insert_authenticated"
  on public.birth_vibes_events
  for insert
  to authenticated
  with check (true);

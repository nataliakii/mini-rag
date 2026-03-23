-- Run ONLY if you insert with the publishable / anon key (no service_role).
-- Security: anyone who has the publishable key can INSERT rows into this table
-- (the key is public in the browser bundle if prefixed with NEXT_PUBLIC_).
-- Prefer service_role on the server when possible.

-- Allow anonymous API role to insert analytics rows only (no SELECT/UPDATE/DELETE).
drop policy if exists "birth_vibes_events_insert_anon" on public.birth_vibes_events;

create policy "birth_vibes_events_insert_anon"
  on public.birth_vibes_events
  for insert
  to anon
  with check (true);

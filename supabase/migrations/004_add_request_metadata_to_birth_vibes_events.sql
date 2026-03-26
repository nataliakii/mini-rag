alter table public.birth_vibes_events
  add column if not exists client_ip text,
  add column if not exists referrer text,
  add column if not exists request_origin text,
  add column if not exists user_agent text;

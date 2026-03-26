import { describeMissingSupabaseEnv, getSupabaseAdmin } from "@/lib/supabase/admin";

export type BirthVibesEventRow = {
  name: string;
  birthDate: string;
  birthTime: string;
  songTitle: string;
  songArtist: string;
  movieTitle: string;
  story: string;
  clientIp: string;
  referrer: string;
  requestOrigin: string;
  userAgent: string;
};

/**
 * Inserts one row into `birth_vibes_events` (see `supabase/migrations/001_birth_vibes_events.sql`).
 * No-op if Supabase env vars are missing (local dev without DB).
 */
export async function logBirthVibesToSupabase(row: BirthVibesEventRow): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      `[birth-vibes] Supabase analytics skipped on server (no URL/key in env). ${describeMissingSupabaseEnv()}`
    );
    return;
  }

  const { error } = await supabase.from("birth_vibes_events").insert({
    name: row.name.trim() ? row.name.trim() : null,
    birth_date: row.birthDate,
    birth_time: row.birthTime.trim() ? row.birthTime.trim() : null,
    song_title: row.songTitle,
    song_artist: row.songArtist,
    movie_title: row.movieTitle.trim() ? row.movieTitle.trim() : null,
    story: row.story,
    client_ip: row.clientIp.trim() ? row.clientIp.trim() : null,
    referrer: row.referrer.trim() ? row.referrer.trim() : null,
    request_origin: row.requestOrigin.trim() ? row.requestOrigin.trim() : null,
    user_agent: row.userAgent.trim() ? row.userAgent.trim() : null,
  });

  if (error) {
    console.error("[birth-vibes] Supabase error object:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    const msg = error.message;
    if (msg.includes("birth_vibes_events") && msg.includes("schema cache")) {
      throw new Error(
        `${msg} — create the table in Supabase: run SQL from supabase/migrations/001_birth_vibes_events.sql (then 002 if you use publishable key).`
      );
    }
    throw new Error(msg);
  }
}

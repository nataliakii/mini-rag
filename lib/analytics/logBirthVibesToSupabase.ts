import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type BirthVibesEventRow = {
  name: string;
  birthDate: string;
  birthTime: string;
  songTitle: string;
  songArtist: string;
  movieTitle: string;
  story: string;
};

/**
 * Inserts one row into `birth_vibes_events` (see `supabase/migrations/001_birth_vibes_events.sql`).
 * No-op if Supabase env vars are missing (local dev without DB).
 */
export async function logBirthVibesToSupabase(row: BirthVibesEventRow): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.warn(
      "[birth-vibes] Supabase analytics skipped: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and a key: SUPABASE_SERVICE_ROLE_KEY (best) or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY (then run migration 002_allow_anon_insert_birth_vibes.sql)"
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

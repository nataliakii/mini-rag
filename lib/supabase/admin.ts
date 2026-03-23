import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Prefer service role (bypasses RLS). If you only have a publishable key, run
 * `002_allow_anon_insert_birth_vibes.sql` and use NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.
 */
function resolveServerApiKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim()
  );
}

/**
 * Server-only Supabase client (elevated key — bypasses RLS when using service_role).
 * Never import this from client components.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url =
    process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const apiKey = resolveServerApiKey();
  if (!url || !apiKey) {
    return null;
  }
  if (!cached) {
    cached = createClient(url, apiKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return cached;
}

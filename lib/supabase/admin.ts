import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Prefer service role (bypasses RLS).
 * Anon / publishable keys need RLS policy `002_allow_anon_insert_birth_vibes.sql` (and optionally 003).
 */
function resolveServerApiKey(): string | undefined {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim()
  );
}

/** For logs only — what to set on Vercel if analytics is skipped. */
export function describeMissingSupabaseEnv(): string {
  const hasUrl = Boolean(
    process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  );
  const hasKey = Boolean(resolveServerApiKey());
  if (hasUrl && hasKey) return "";
  const missing: string[] = [];
  if (!hasUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)");
  if (!hasKey) {
    missing.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY, or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return `${missing.join(" + ")} — add in Vercel → Project → Settings → Environment Variables (Production), then Redeploy. For anon/publishable keys run SQL migration 002 (see README).`;
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

const DEFAULT_SITE_URL = "https://fun.bbqr.site";

/** Canonical site origin for metadata, sitemap, and JSON-LD (no trailing slash). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

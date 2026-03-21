import { getAccessToken } from "@/lib/spotify/getAccessToken";

export type SpotifyTrack = {
  id: string;
  name: string;
  artist: string;
};

type SpotifySearchResponse = {
  tracks?: {
    items?: Array<{
      id?: string;
      name?: string;
      artists?: Array<{ name?: string }>;
    }>;
  };
};

type CacheEntry = {
  value: SpotifyTrack | null;
  expiresAtMs: number;
};

const SUCCESS_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const MISS_TTL_MS = 1000 * 60 * 30; // 30 minutes
const cache = new Map<string, CacheEntry>();

function normalizeCacheKey(title: string, artist: string): string {
  return `${title.trim().toLowerCase()}::${artist.trim().toLowerCase()}`;
}

export async function searchTrack(title: string, artist: string): Promise<SpotifyTrack | null> {
  const query = `${title} ${artist}`.trim();
  if (!query) {
    return null;
  }

  const cacheKey = normalizeCacheKey(title, artist);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAtMs) {
    return cached.value;
  }

  try {
    const { access_token } = await getAccessToken();
    const url = new URL("https://api.spotify.com/v1/search");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "track");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const payload = (await res.json()) as SpotifySearchResponse;
    const item = payload.tracks?.items?.[0];
    if (!item?.id || !item?.name) {
      cache.set(cacheKey, {
        value: null,
        expiresAtMs: Date.now() + MISS_TTL_MS,
      });
      return null;
    }

    const result = {
      id: item.id,
      name: item.name,
      artist: item.artists?.[0]?.name ?? artist,
    };
    cache.set(cacheKey, {
      value: result,
      expiresAtMs: Date.now() + SUCCESS_TTL_MS,
    });
    return result;
  } catch {
    cache.set(cacheKey, {
      value: null,
      expiresAtMs: Date.now() + MISS_TTL_MS,
    });
    return null;
  }
}

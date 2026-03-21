export type YouTubeVideo = {
  videoId: string;
};

type YouTubeSearchResponse = {
  items?: Array<{
    id?: {
      videoId?: string;
    };
  }>;
};

type CacheEntry = {
  value: YouTubeVideo | null;
  expiresAtMs: number;
};

const SUCCESS_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const MISS_TTL_MS = 1000 * 60 * 30; // 30 minutes
const cache = new Map<string, CacheEntry>();

function normalizeCacheKey(title: string, artist: string): string {
  return `${title.trim().toLowerCase()}::${artist.trim().toLowerCase()}`;
}

export async function searchYouTube(title: string, artist: string): Promise<YouTubeVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const query = `${title} ${artist} official`.trim();
  if (!query) {
    return null;
  }

  const cacheKey = normalizeCacheKey(title, artist);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAtMs) {
    return cached.value;
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("q", query);
    url.searchParams.set("part", "snippet");
    url.searchParams.set("maxResults", "1");
    url.searchParams.set("type", "video");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return null;
    }

    const payload = (await res.json()) as YouTubeSearchResponse;
    const videoId = payload.items?.[0]?.id?.videoId;
    if (!videoId) {
      cache.set(cacheKey, {
        value: null,
        expiresAtMs: Date.now() + MISS_TTL_MS,
      });
      return null;
    }

    const result = { videoId };
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

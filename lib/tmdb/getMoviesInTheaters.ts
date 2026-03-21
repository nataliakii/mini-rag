export type Movie = {
  title: string;
  release_date: string;
  poster_path: string | null;
};

type TmdbDiscoverResponse = {
  results?: Array<{
    title?: string;
    release_date?: string;
    poster_path?: string | null;
  }>;
};

type CacheEntry = {
  createdAt: number;
  movies: Movie[];
};

const TMDB_DISCOVER_URL = "https://api.themoviedb.org/3/discover/movie";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const cache = new Map<string, CacheEntry>();

function formatYmd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function subtractDaysUtc(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() - days);
  return copy;
}

export async function getMoviesInTheaters(birthDate: string): Promise<Movie[]> {
  const parsed = new Date(birthDate);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("TMDb lookup failed: invalid birth date format");
  }

  const cached = cache.get(birthDate);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return cached.movies;
  }

  const startDate = formatYmd(subtractDaysUtc(parsed, 60));
  const endDate = formatYmd(parsed);

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDb lookup failed: TMDB_API_KEY is not configured");
  }

  const url = new URL(TMDB_DISCOVER_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("primary_release_date.gte", startDate);
  url.searchParams.set("primary_release_date.lte", endDate);
  url.searchParams.set("sort_by", "popularity.desc");
  url.searchParams.set("vote_count.gte", "100");
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `TMDb lookup failed: ${res.status} ${res.statusText}${body ? ` - ${body.slice(0, 200)}` : ""}`
    );
  }

  const payload = (await res.json()) as TmdbDiscoverResponse;
  const results = payload.results ?? [];

  if (results.length === 0) {
    cache.set(birthDate, { createdAt: Date.now(), movies: [] });
    return [];
  }

  const movies: Movie[] = results
    .filter((item) => item.title && item.release_date)
    .slice(0, 10)
    .map((item) => ({
      title: item.title as string,
      release_date: item.release_date as string,
      poster_path: item.poster_path ?? null,
    }));

  cache.set(birthDate, { createdAt: Date.now(), movies });
  return movies;
}

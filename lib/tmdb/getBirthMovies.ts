export type BirthMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

export type SelectedBirthMovie = BirthMovie & {
  actors: string[];
  director: string;
};

export type BirthMoviesResult = {
  selectedMovie: SelectedBirthMovie | null;
  movies: BirthMovie[];
};

type DiscoverMovieItem = {
  id?: number;
  title?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  vote_average?: number;
};

type DiscoverResponse = {
  results?: DiscoverMovieItem[];
};

type MovieDetailsResponse = {
  credits?: {
    crew?: Array<{ job?: string; department?: string; name?: string }>;
    cast?: Array<{ name?: string }>;
  };
};

const DISCOVER_URL = "https://api.themoviedb.org/3/discover/movie";
const MOVIE_URL = "https://api.themoviedb.org/3/movie";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours
const cache = new Map<string, { createdAt: number; value: BirthMoviesResult }>();

function asYmd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDaysUtc(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function toBirthMovie(item: DiscoverMovieItem): BirthMovie | null {
  if (
    typeof item.id !== "number" ||
    !item.title ||
    !item.release_date ||
    typeof item.vote_average !== "number"
  ) {
    return null;
  }

  return {
    id: item.id,
    title: item.title,
    overview: item.overview ?? "",
    poster_path: item.poster_path ?? null,
    release_date: item.release_date,
    vote_average: item.vote_average,
  };
}

async function discoverMovies(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<BirthMovie[]> {
  const url = new URL(DISCOVER_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("primary_release_date.gte", startDate);
  url.searchParams.set("primary_release_date.lte", endDate);
  url.searchParams.set("sort_by", "vote_average.desc");
  url.searchParams.set("vote_count.gte", "200");
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `TMDb discover failed: ${res.status} ${res.statusText}${body ? ` - ${body.slice(0, 200)}` : ""}`
    );
  }

  const payload = (await res.json()) as DiscoverResponse;
  const movies = (payload.results ?? [])
    .map(toBirthMovie)
    .filter((movie): movie is BirthMovie => movie !== null)
    .slice(0, 10);

  return movies;
}

async function enrichMovieWithCredits(
  apiKey: string,
  movie: BirthMovie
): Promise<SelectedBirthMovie> {
  const detailsUrl = new URL(`${MOVIE_URL}/${movie.id}`);
  detailsUrl.searchParams.set("api_key", apiKey);
  detailsUrl.searchParams.set("append_to_response", "credits");
  detailsUrl.searchParams.set("language", "en-US");

  const res = await fetch(detailsUrl.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `TMDb movie details failed: ${res.status} ${res.statusText}${body ? ` - ${body.slice(0, 200)}` : ""}`
    );
  }

  const payload = (await res.json()) as MovieDetailsResponse;
  const crew = payload.credits?.crew ?? [];
  const cast = payload.credits?.cast ?? [];

  const actors = cast
    .map((member) => member.name)
    .filter((name): name is string => Boolean(name))
    .slice(0, 3);

  const director =
    crew.find((member) => member.job === "Director")?.name ??
    crew.find((member) => member.department === "Directing")?.name ??
    "Unknown";

  return {
    ...movie,
    actors,
    director,
  };
}

export async function getBirthMovies(date: string): Promise<BirthMoviesResult> {
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("TMDb birth movies failed: invalid date format");
  }

  const cached = cache.get(date);
  if (cached && Date.now() - cached.createdAt < CACHE_TTL_MS) {
    return cached.value;
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error("TMDb birth movies failed: TMDB_API_KEY is not configured");
  }

  const narrowStart = asYmd(addDaysUtc(parsedDate, -7));
  const narrowEnd = asYmd(addDaysUtc(parsedDate, 7));

  let movies = await discoverMovies(apiKey, narrowStart, narrowEnd);

  if (movies.length === 0) {
    const wideStart = asYmd(addDaysUtc(parsedDate, -30));
    const wideEnd = asYmd(addDaysUtc(parsedDate, 30));
    movies = await discoverMovies(apiKey, wideStart, wideEnd);
  }

  if (movies.length === 0) {
    const empty: BirthMoviesResult = { selectedMovie: null, movies: [] };
    cache.set(date, { createdAt: Date.now(), value: empty });
    return empty;
  }

  const selectedBaseMovie = movies[Math.floor(Math.random() * movies.length)];
  const selectedMovie = await enrichMovieWithCredits(apiKey, selectedBaseMovie);
  const result: BirthMoviesResult = { selectedMovie, movies };

  cache.set(date, { createdAt: Date.now(), value: result });
  return result;
}

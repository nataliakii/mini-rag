import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getBirthMovies } from "@/lib/tmdb/getBirthMovies";
import { getPlayableTrack } from "@/lib/music/getPlayableTrack";
import { getSongsForWeek } from "@/lib/songs/getSongsForWeek";
import { logBirthVibesToSupabase } from "@/lib/analytics/logBirthVibesToSupabase";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "";
  }
  return req.headers.get("x-real-ip")?.trim() ?? "";
}

type StoryLanguage =
  | "english"
  | "russian"
  | "ukrainian"
  | "french"
  | "german"
  | "greek"
  | "spanish"
  | "italian"
  | "turkish";

const supportedStoryLanguages = new Set<StoryLanguage>([
  "english",
  "russian",
  "ukrainian",
  "french",
  "german",
  "greek",
  "spanish",
  "italian",
  "turkish",
]);

function getStyleInstruction(language: StoryLanguage): string {
  if (language === "russian") {
    return "Write in Russian. Literary tone inspired by Anton Chekhov, Joseph Brodsky, and Fyodor Dostoevsky: psychologically vivid, lyrical, and precise.";
  }
  if (language === "ukrainian") {
    return "Write in Ukrainian. Literary tone inspired by Lina Kostenko, Lesya Ukrainka, Serhiy Zhadan, Oksana Zabuzhko, and Lyubko Deresh: expressive, poetic, contemporary, and psychologically vivid.";
  }
  if (language === "english") {
    return "Write in English. Literary tone inspired by Charles Dickens, O. Henry, and Oscar Wilde: vivid, witty, and elegant.";
  }
  if (language === "german") {
    return "Write in German. Literary tone inspired by Goethe, Hermann Hesse, and Erich Maria Remarque: reflective, human, and emotionally restrained.";
  }
  if (language === "french") {
    return "Write in French. Literary tone inspired by Francoise Sagan and Stendhal: nuanced, intimate, and psychologically sharp.";
  }
  if (language === "spanish") {
    return "Write in Spanish. Literary tone inspired by Gabriel Garcia Marquez: atmospheric, sensual, and gently magical.";
  }
  if (language === "greek") {
    return "Write in Greek. Literary tone inspired by Constantine P. Cavafy: contemplative, restrained, and evocative.";
  }
  if (language === "italian") {
    return "Write in Italian. Literary cinematic tone with elegant rhythm and emotional clarity.";
  }
  return "Write in Turkish. Literary cinematic tone with vivid imagery and emotional warmth.";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const date = body?.date as string | undefined;
    const time = body?.time as string | undefined;
    const rawName = body?.name as string | undefined;
    const storyLanguageRaw = body?.storyLanguage as string | undefined;
    const storyLanguage = storyLanguageRaw?.toLowerCase().trim() as StoryLanguage | undefined;
    const name = rawName?.trim();
    const clientIp = getClientIp(req);
    const referrer = req.headers.get("referer")?.trim() ?? "";
    const requestOrigin = req.headers.get("origin")?.trim() ?? "";
    const userAgent = req.headers.get("user-agent")?.trim() ?? "";

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!storyLanguage || !supportedStoryLanguages.has(storyLanguage)) {
      return NextResponse.json({ error: "Unsupported story language" }, { status: 400 });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const songsData = getSongsForWeek(date);
    if (!songsData || !songsData.selectedSong) {
      return NextResponse.json({ error: "No song data found for this date yet 😢" }, { status: 404 });
    }

    const playable = await getPlayableTrack(songsData.selectedSong.title, songsData.selectedSong.artist);
    const moviesData = await getBirthMovies(date);
    const selectedMovie = moviesData.selectedMovie;

    const topSongsPreview = songsData.songs
      .slice(0, 3)
      .map((entry) => `${entry.title} by ${entry.artist}`)
      .join(", ");

    const topMoviesPreview = moviesData.movies
      .slice(0, 3)
      .map((entry) => `${entry.title} (${entry.release_date})`)
      .join(", ");

    const movieNarrative = selectedMovie
      ? `While you were being born, somewhere nearby people sat in dark cinemas watching "${selectedMovie.title}".
Movie snapshot: ${truncate(selectedMovie.overview, 220)}
Cast in focus: ${selectedMovie.actors.join(", ") || "Unknown cast"}.
Directed by: ${selectedMovie.director}.`
      : `Movie data for that birth window is unavailable, so focus more on the radio-side atmosphere.`;

    const movieListSection =
      moviesData.movies.length > 0
        ? `Movies around that birth window included:
${topMoviesPreview}
`
        : "";

    const subjectIntro = `A person named ${name} was born on ${date}${time ? ` at ${time}` : ""}.`;

    const birthMomentInstruction = time
      ? `Explicitly mention both the birth date (${date}) and exact birth time (${time}) in the story.`
      : `Explicitly mention the birth date (${date}) in the story.`;
    const styleInstruction = getStyleInstruction(storyLanguage);

    const prompt = `${subjectIntro}

During that birth week, the world was listening to songs like:
${topSongsPreview}

The song that defines this birth vibe:
"${songsData.selectedSong.title}" by ${songsData.selectedSong.artist}

${movieListSection}${movieNarrative}

Write a short, vivid birth-moment story (2-4 sentences).
Tone: emotional, cinematic, and lightly funny.
Include two parallel scenes:
- cinema scene (movie world)
- hospital/radio scene (song world)
${birthMomentInstruction}
${styleInstruction}
Do not transliterate. Use natural native spelling and punctuation for the selected language.
Keep it to 2-4 sentences.
End with a dramatic, cinematic final sentence announcing the birth moment.
Include the provided name naturally in that final line.
Do not copy templates word-for-word; vary phrasing every time.
Examples of tone only (do not copy): "And just like that, NAME entered the world...", "a new story began — NAME."
No hashtags.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const storyText = completion.choices[0].message.content ?? "";

    // Must await: on Vercel/serverless the runtime often freezes right after the response is sent,
    // so fire-and-forget inserts frequently never complete.
    try {
      await logBirthVibesToSupabase({
        name: name ?? "",
        birthDate: date,
        birthTime: time?.trim() ?? "",
        songTitle: songsData.selectedSong.title,
        songArtist: songsData.selectedSong.artist,
        movieTitle: selectedMovie?.title ?? "",
        story: storyText,
        clientIp,
        referrer,
        requestOrigin,
        userAgent,
      });
    } catch (err) {
      console.error("[birth-vibes] Supabase analytics insert failed:", err);
    }

    return NextResponse.json({
      movie: selectedMovie
        ? {
            title: selectedMovie.title,
            overview: selectedMovie.overview,
            poster_path: selectedMovie.poster_path,
            actors: selectedMovie.actors,
            director: selectedMovie.director,
          }
        : null,
      song: {
        title: songsData.selectedSong.title,
        artist: songsData.selectedSong.artist,
      },
      playable,
      text: storyText,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

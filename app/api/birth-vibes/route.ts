import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getBirthMovies } from "@/lib/tmdb/getBirthMovies";
import { getPlayableTrack } from "@/lib/music/getPlayableTrack";
import { getSongsForWeek } from "@/lib/songs/getSongsForWeek";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 3)}...`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const date = body?.date as string | undefined;
    const time = body?.time as string | undefined;
    const rawName = body?.name as string | undefined;
    const name = rawName?.trim();

    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
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

    const subjectIntro =
      name && name.length > 0
        ? `A person named ${name} was born on ${date}${time ? ` at ${time}` : ""}.`
        : `A person was born on ${date}${time ? ` at ${time}` : ""}.`;

    const birthMomentInstruction = time
      ? `Explicitly mention both the birth date (${date}) and exact birth time (${time}) in the story.`
      : `Explicitly mention the birth date (${date}) in the story.`;

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
Keep it to 2-4 sentences.
End with a dramatic, cinematic final sentence announcing the birth moment.
If a name is provided, include it naturally in that final line.
If no name is provided, do not invent one and keep wording neutral.
Do not copy templates word-for-word; vary phrasing every time.
Examples of tone only (do not copy): "And just like that, NAME entered the world...", "a new story began — NAME."
No hashtags.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

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
      text: completion.choices[0].message.content ?? "",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

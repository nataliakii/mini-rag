import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeDateToWeek } from "../lib/normalizeDateToWeek";

type CsvRow = Record<string, string>;

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  out.push(current);
  return out;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const row: CsvRow = {};
    const cells = splitCsvLine(line);

    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim();
    });

    return row;
  });
}

function buildSongsDataset(
  rows: CsvRow[]
): Record<string, Array<{ title: string; artist: string; rank: number }>> {
  const output: Record<string, Array<{ title: string; artist: string; rank: number }>> = {};

  for (const row of rows) {
    const rank = Number(row.rank ?? row.current_position);
    if (!Number.isFinite(rank) || rank < 1 || rank > 10) {
      continue;
    }

    const date = normalizeDateToWeek(row.date ?? row.chart_date ?? "");
    const title = row.song || row.title;
    const artist = row.artist || row.performer;

    if (!date || !title || !artist) {
      continue;
    }

    if (!output[date]) {
      output[date] = [];
    }

    output[date].push({ title, artist, rank });
  }

  for (const date of Object.keys(output)) {
    output[date] = output[date]
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);
  }

  return output;
}

function buildMoviesDataset(rows: CsvRow[]): Record<string, { title: string }> {
  const output: Record<string, { title: string }> = {};

  for (const row of rows) {
    if ((row.rank ?? "") !== "1") {
      continue;
    }

    const date = normalizeDateToWeek(row.date ?? "");
    const title = row.title || row.movie;

    if (!date || !title) {
      continue;
    }

    output[date] = { title };
  }

  return output;
}

async function main() {
  const root = process.cwd();
  const songsCsvCandidates = [
    path.join(root, "data", "songs", "hot100_archive_1958_2021.csv"),
    path.join(root, "data", "raw", "songs.csv"),
  ];
  const moviesCsvPath = path.join(root, "data", "raw", "movies.csv");
  const songsOutPath = path.join(root, "data", "songs.json");
  const moviesOutPath = path.join(root, "data", "movies.json");

  let songsCsv: string | null = null;
  let songsSourcePath: string | null = null;
  for (const candidatePath of songsCsvCandidates) {
    try {
      songsCsv = await readFile(candidatePath, "utf8");
      songsSourcePath = candidatePath;
      break;
    } catch {
      // Try next candidate path.
    }
  }

  if (!songsCsv || !songsSourcePath) {
    throw new Error("Songs CSV not found. Expected data/songs/hot100_archive_1958_2021.csv or data/raw/songs.csv");
  }

  let moviesJson: Record<string, { title: string }> = {};
  try {
    const moviesCsv = await readFile(moviesCsvPath, "utf8");
    const moviesRows = parseCsv(moviesCsv);
    moviesJson = buildMoviesDataset(moviesRows);
  } catch {
    // Fallback to existing prebuilt movies dataset if raw CSV is unavailable.
    try {
      const existingMovies = await readFile(moviesOutPath, "utf8");
      moviesJson = JSON.parse(existingMovies) as Record<string, { title: string }>;
    } catch {
      moviesJson = {};
    }
  }

  const songsRows = parseCsv(songsCsv);

  const songsJson = buildSongsDataset(songsRows);

  await mkdir(path.join(root, "data"), { recursive: true });
  await Promise.all([
    writeFile(songsOutPath, `${JSON.stringify(songsJson, null, 2)}\n`, "utf8"),
    writeFile(moviesOutPath, `${JSON.stringify(moviesJson, null, 2)}\n`, "utf8"),
  ]);

  console.log(
    `Datasets prepared from ${path.basename(songsSourcePath)}: songs=${Object.keys(songsJson).length}, movies=${Object.keys(moviesJson).length}`
  );
}

main().catch((error) => {
  console.error("Failed to prepare datasets:", error);
  process.exit(1);
});

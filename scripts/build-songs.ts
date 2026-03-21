import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeDateToWeek } from "../lib/normalizeDateToWeek";

type CsvRow = Record<string, string>;
type RankedSong = { title: string; artist: string; rank: number };

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

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim();
    });

    return row;
  });
}

function buildTop10Songs(rows: CsvRow[]): Record<string, RankedSong[]> {
  const songs: Record<string, RankedSong[]> = {};

  for (const row of rows) {
    const rank = Number(row.rank);
    const dateRaw = row.chart_date || row.date;
    const weekDate = normalizeDateToWeek(dateRaw ?? "");
    const title = row.title || row.song;
    const artist = row.artist;

    if (!weekDate || !title || !artist || !Number.isFinite(rank) || rank < 1 || rank > 10) {
      continue;
    }

    if (!songs[weekDate]) {
      songs[weekDate] = [];
    }

    songs[weekDate].push({ title, artist, rank });
  }

  Object.keys(songs).forEach((weekDate) => {
    songs[weekDate] = songs[weekDate].sort((a, b) => a.rank - b.rank).slice(0, 10);
  });

  return songs;
}

async function main() {
  const root = process.cwd();
  const songsCsvPath = path.join(root, "data", "raw", "songs.csv");
  const songsOutPath = path.join(root, "data", "songs.json");

  const csvText = await readFile(songsCsvPath, "utf8");
  const rows = parseCsv(csvText);
  const songs = buildTop10Songs(rows);

  await writeFile(songsOutPath, `${JSON.stringify(songs, null, 2)}\n`, "utf8");
  console.log(`Songs (top 10) ready ✅ weeks=${Object.keys(songs).length}`);
}

main().catch((error) => {
  console.error("Failed to build top-10 songs dataset:", error);
  process.exit(1);
});

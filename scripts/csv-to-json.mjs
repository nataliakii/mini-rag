import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const rawDir = path.join(root, "data", "raw");
const outSongsPath = path.join(root, "data", "songs.json");
const outMoviesPath = path.join(root, "data", "movies.json");

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    return [];
  }

  const headers = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = (cells[index] ?? "").trim();
    });

    return row;
  });
}

function splitCsvLine(line) {
  const out = [];
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

function buildSongsJson(rows) {
  const output = {};

  for (const row of rows) {
    if ((row.rank ?? "") !== "1") {
      continue;
    }

    const date = row.date;
    const title = row.song || row.title;
    const artist = row.artist;

    if (!date || !title || !artist) {
      continue;
    }

    output[date] = { title, artist };
  }

  return output;
}

function buildMoviesJson(rows) {
  const output = {};

  for (const row of rows) {
    if ((row.rank ?? "") !== "1") {
      continue;
    }

    const date = row.date;
    const title = row.title || row.movie;

    if (!date || !title) {
      continue;
    }

    output[date] = { title };
  }

  return output;
}

async function main() {
  const songsCsvPath = path.join(rawDir, "songs.csv");
  const moviesCsvPath = path.join(rawDir, "movies.csv");

  const [songsCsv, moviesCsv] = await Promise.all([
    readFile(songsCsvPath, "utf8"),
    readFile(moviesCsvPath, "utf8"),
  ]);

  const songsRows = parseCsv(songsCsv);
  const moviesRows = parseCsv(moviesCsv);

  const songsJson = buildSongsJson(songsRows);
  const moviesJson = buildMoviesJson(moviesRows);

  await mkdir(path.dirname(outSongsPath), { recursive: true });
  await Promise.all([
    writeFile(outSongsPath, `${JSON.stringify(songsJson, null, 2)}\n`, "utf8"),
    writeFile(outMoviesPath, `${JSON.stringify(moviesJson, null, 2)}\n`, "utf8"),
  ]);

  console.log(
    `Built datasets: songs=${Object.keys(songsJson).length}, movies=${Object.keys(moviesJson).length}`
  );
}

main().catch((error) => {
  console.error("Failed to build JSON datasets from CSV:", error);
  process.exit(1);
});

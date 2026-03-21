import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_URL =
  "https://raw.githubusercontent.com/mhollingshead/billboard-hot-100/main/all.json";

function normalizeDateToWeek(dateString) {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) {
    return null;
  }

  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = local.getDay();
  local.setDate(local.getDate() - day);

  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

function parseSourceCharts(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.charts)) {
    return payload.charts;
  }
  return [];
}

function toTop10(weekEntries) {
  const byRank = new Map();

  for (const item of weekEntries ?? []) {
    const rank = Number(item.this_week ?? item.current_position ?? item.rank);
    const title = item.song ?? item.title;
    const artist = item.artist ?? item.performer;

    if (!Number.isFinite(rank) || rank < 1 || rank > 10 || !title || !artist) {
      continue;
    }

    if (!byRank.has(rank)) {
      byRank.set(rank, { title: String(title), artist: String(artist), rank });
    }
  }

  return [...byRank.values()].sort((a, b) => a.rank - b.rank).slice(0, 10);
}

async function main() {
  const root = process.cwd();
  const songsPath = path.join(root, "data", "songs.json");

  const currentSongs = JSON.parse(await readFile(songsPath, "utf8"));
  const existingWeeks = Object.keys(currentSongs).sort();
  const maxExistingWeek = existingWeeks[existingWeeks.length - 1];

  const res = await fetch(SOURCE_URL, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(
      `Failed to fetch Hot100 source: ${res.status} ${res.statusText}${txt ? ` - ${txt.slice(0, 200)}` : ""}`
    );
  }

  const payload = await res.json();
  const charts = parseSourceCharts(payload);

  let importedWeeks = 0;
  for (const chart of charts) {
    const chartDate = chart?.date;
    const week = normalizeDateToWeek(chartDate);
    if (!week) {
      continue;
    }

    // Import only newer weeks to avoid rewriting historical data.
    if (maxExistingWeek && week <= maxExistingWeek) {
      continue;
    }

    const top10 = toTop10(chart?.data);
    if (top10.length === 0) {
      continue;
    }

    currentSongs[week] = top10;
    importedWeeks += 1;
  }

  const sorted = Object.fromEntries(
    Object.entries(currentSongs).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  );

  await writeFile(songsPath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");

  const weeks = Object.keys(sorted);
  console.log(
    `Hot100 import complete: +${importedWeeks} weeks, total=${weeks.length}, range=${weeks[0]}..${weeks[weeks.length - 1]}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import songs from "@/data/songs.json";
import { findClosestDate } from "@/lib/findClosestDate";
import { getWeightedRandomSong } from "@/lib/getRandomSong";
import { normalizeDateToWeek } from "@/lib/normalizeDateToWeek";

export type Song = {
  title: string;
  artist: string;
  rank: number;
};

export type SongsForWeekResult = {
  weekDate: string;
  songs: Song[];
  selectedSong: Song | null;
};

const songsByWeek = songs as Record<string, Song[]>;

export function getSongsForWeek(date: string): SongsForWeekResult | null {
  const weekDate = normalizeDateToWeek(date);
  if (!weekDate) {
    return null;
  }

  const weekSongs = songsByWeek[weekDate] ?? findClosestDate(weekDate, songsByWeek);
  if (!weekSongs || weekSongs.length === 0) {
    return null;
  }

  const selectedSong = getWeightedRandomSong(weekSongs);
  return {
    weekDate,
    songs: weekSongs,
    selectedSong,
  };
}

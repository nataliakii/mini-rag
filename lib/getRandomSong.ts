type RankedSong = {
  title: string;
  artist: string;
  rank: number;
};

export function getRandomSong(songs: RankedSong[] | undefined | null): RankedSong | null {
  if (!songs || songs.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * songs.length);
  return songs[index];
}

export function getWeightedRandomSong(
  songs: RankedSong[] | undefined | null
): RankedSong | null {
  if (!songs || songs.length === 0) {
    return null;
  }

  const weighted: RankedSong[] = [];

  songs.forEach((song) => {
    const safeRank = Number.isFinite(song.rank) ? song.rank : 10;
    const clampedRank = Math.min(Math.max(Math.trunc(safeRank), 1), 10);
    const weight = 11 - clampedRank; // rank #1 -> weight 10

    for (let i = 0; i < weight; i += 1) {
      weighted.push(song);
    }
  });

  const index = Math.floor(Math.random() * weighted.length);
  return weighted[index] ?? songs[0];
}

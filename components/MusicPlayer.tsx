"use client";

import type { PlayableTrack } from "@/lib/music/getPlayableTrack";

type MusicPlayerProps = {
  playable: PlayableTrack | null | undefined;
};

export default function MusicPlayer({ playable }: MusicPlayerProps) {
  if (!playable) {
    return <p className="text-sm text-zinc-600">No audio available</p>;
  }

  if (playable.type === "spotify") {
    return (
      <iframe
        title="Spotify player"
        src={`https://open.spotify.com/embed/track/${playable.id}`}
        width="100%"
        height="80"
        allow="encrypted-media"
        loading="lazy"
        className="rounded-md border border-zinc-200"
      />
    );
  }

  return (
    <iframe
      title="YouTube player"
      src={`https://www.youtube.com/embed/${playable.id}`}
      width="100%"
      height="200"
      allow="autoplay; encrypted-media; picture-in-picture"
      loading="lazy"
      className="rounded-md border border-zinc-200"
    />
  );
}

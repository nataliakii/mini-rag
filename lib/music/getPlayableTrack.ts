import { searchTrack } from "@/lib/spotify/searchTrack";
import { searchYouTube } from "@/lib/youtube/searchVideo";

export type PlayableTrack =
  | {
      type: "spotify";
      id: string;
    }
  | {
      type: "youtube";
      id: string;
    };

export async function getPlayableTrack(
  title: string,
  artist: string
): Promise<PlayableTrack | null> {
  const spotifyTrack = await searchTrack(title, artist);
  if (spotifyTrack?.id) {
    return {
      type: "spotify",
      id: spotifyTrack.id,
    };
  }

  const youtubeVideo = await searchYouTube(title, artist);
  if (youtubeVideo?.videoId) {
    return {
      type: "youtube",
      id: youtubeVideo.videoId,
    };
  }

  return null;
}

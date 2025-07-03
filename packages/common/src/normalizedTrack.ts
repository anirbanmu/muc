import { SpotifyTrack } from './spotify.js';
import { DeezerTrack } from './deezer.js';
import { ItunesTrack } from './itunes.js';
import { YoutubeVideoDetails, YoutubeSearchResultItem } from './youtube.js';

export interface NormalizedTrack {
  platform: 'spotify' | 'deezer' | 'itunes' | 'youtube';
  id: string;
  title: string;
  artistName: string;
  sourceUrl: string;
}

export interface SpotifyNormalizedTrack extends NormalizedTrack {
  platform: 'spotify';
  albumName: string;
}

export interface DeezerNormalizedTrack extends NormalizedTrack {
  platform: 'deezer';
  albumName: string;
  artistUrl: string;
}

export interface ItunesNormalizedTrack extends NormalizedTrack {
  platform: 'itunes';
  artistUrl: string;
}

export interface YoutubeNormalizedTrack extends NormalizedTrack {
  platform: 'youtube';
}

export type AnyNormalizedTrack =
  | SpotifyNormalizedTrack
  | DeezerNormalizedTrack
  | ItunesNormalizedTrack
  | YoutubeNormalizedTrack;

export function mapSpotifyTrackToNormalizedTrack(track: SpotifyTrack): SpotifyNormalizedTrack {
  return {
    platform: 'spotify',
    id: track.id,
    title: track.name,
    artistName: track.artists[0]?.name || 'Unknown Artist',
    sourceUrl: track.external_urls.spotify,
    albumName: track.album.name,
  };
}

export function mapDeezerTrackToNormalizedTrack(track: DeezerTrack): DeezerNormalizedTrack {
  return {
    platform: 'deezer',
    id: track.id.toString(),
    title: track.title,
    artistName: track.artist.name,
    sourceUrl: track.link,
    albumName: track.album.title,
    artistUrl: track.artist.link,
  };
}

export function mapItunesTrackToNormalizedTrack(track: ItunesTrack): ItunesNormalizedTrack {
  return {
    platform: 'itunes',
    id: track.trackId.toString(),
    title: track.trackName,
    artistName: track.artistName,
    sourceUrl: track.trackViewUrl,
    artistUrl: track.artistViewUrl,
  };
}

function getYoutubeId(video: YoutubeVideoDetails | YoutubeSearchResultItem): string {
  if (typeof video.id === 'string') {
    return video.id;
  }
  if (
    typeof video.id === 'object' &&
    video.id !== null &&
    'videoId' in video.id &&
    typeof video.id.videoId === 'string'
  ) {
    return video.id.videoId;
  }
  throw new Error('Could not determine YouTube video ID from input object.');
}

export function mapYoutubeVideoToNormalizedTrack(
  video: YoutubeVideoDetails | YoutubeSearchResultItem,
): YoutubeNormalizedTrack {
  const videoId = getYoutubeId(video);
  const title = video.snippet.title;

  const artistName =
    'channelTitle' in video.snippet ? video.snippet.channelTitle : 'Unknown Creator';

  return {
    platform: 'youtube',
    id: videoId,
    title: title,
    artistName: artistName,
    sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

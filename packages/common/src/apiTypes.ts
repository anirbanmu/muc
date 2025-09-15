import {
  SpotifyNormalizedTrack,
  YoutubeNormalizedTrack,
  ItunesNormalizedTrack,
  DeezerNormalizedTrack,
} from './normalizedTrack.js';

export interface UriRequestBody {
  uri: string;
}

export interface QueryRequestBody {
  query: string;
}

export type GetSpotifyTrackDetailsResponse = SpotifyNormalizedTrack;
export type SearchSpotifyTracksResponse = SpotifyNormalizedTrack[];

export type GetYoutubeVideoDetailsResponse = YoutubeNormalizedTrack;
export type SearchYoutubeVideosResponse = YoutubeNormalizedTrack[];

export type GetItunesTrackDetailsResponse = ItunesNormalizedTrack;
export type SearchItunesTracksResponse = ItunesNormalizedTrack[];

export type GetDeezerTrackDetailsResponse = DeezerNormalizedTrack;
export type SearchDeezerTracksResponse = DeezerNormalizedTrack[];

export interface ErrorResponse {
  message: string;
}

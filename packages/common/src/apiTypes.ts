import { SpotifyNormalizedTrack, YoutubeNormalizedTrack } from './normalizedTrack.js';

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

export interface ErrorResponse {
  message: string;
}

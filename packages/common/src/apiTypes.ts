import {
  SpotifyNormalizedTrack,
  YoutubeNormalizedTrack,
  ItunesNormalizedTrack,
  DeezerNormalizedTrack,
  AnyNormalizedTrack,
} from './normalizedTrack.js';
import { MediaPlatform } from './mediaService.js';

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

export interface SearchRequest {
  uri: string;
}

export interface TrackIdentifierData {
  platform: MediaPlatform;
  platformId: string;
  uniqueId: string;
}

export interface SearchResponse {
  results: AnyNormalizedTrack[];
  sourceTrack: TrackIdentifierData;
}

export interface ErrorResponse {
  message: string;
}

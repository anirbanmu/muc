import { AnyNormalizedTrack } from './normalizedTrack.js';
import { MediaPlatform } from './mediaService.js';

export interface UriRequestBody {
  uri: string;
}

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

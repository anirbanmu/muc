export function sharedFunction(): string {
  return 'This is a shared function.';
}

export {
  SpotifyClient,
  SpotifyClientInterface,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyExternalUrls,
} from './spotify.js';
export { YoutubeClient, YoutubeClientInterface, YoutubeVideoSnippet, YoutubeVideoDetails } from './youtube.js';

export { DeezerTrack, DeezerClient, DeezerClientInterface } from './deezer.js';

export { ItunesClient, ItunesClientInterface, ItunesTrack } from './itunes.js';

export { CachedSpotifyClient, CachedYoutubeClient, CachedDeezerClient, CachedItunesClient } from './cachedClient.js';

export {
  ConcurrencyLimitedSpotifyClient,
  ConcurrencyLimitedYoutubeClient,
  ConcurrencyLimitedDeezerClient,
  ConcurrencyLimitedItunesClient,
} from './concurrencyLimitedClient.js';

export {
  NormalizedTrack,
  SpotifyNormalizedTrack,
  DeezerNormalizedTrack,
  ItunesNormalizedTrack,
  YoutubeNormalizedTrack,
  AnyNormalizedTrack,
} from './normalizedTrack.js';

export { BackendMediaService } from './backendMediaService.js';
export { CacheAccessor } from './cacheAccessor.js';

export { MediaPlatform, MediaService } from './mediaService.js';
export { getNextId } from './idGenerator.js';
export { TrackIdentifier } from './trackIdentifier.js';

export { ApiClient } from './apiClient.js';
export { API_ROUTES } from './apiRoutes.js';
export { UriRequestBody, SearchRequest, SearchResponse, TrackIdentifierData, ErrorResponse } from './apiTypes.js';

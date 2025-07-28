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
export { CachedSpotifyClient } from './cachedSpotifyClient.js';

export { YoutubeClient, YoutubeClientInterface, YoutubeVideoSnippet, YoutubeVideoDetails } from './youtube.js';
export { CachedYoutubeClient } from './cachedYoutubeClient.js';

export { DeezerTrack, DeezerClient } from './deezer.js';

export { ItunesClient, ItunesTrack } from './itunes.js';

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

export { ClientMediaService } from './clientMediaService.js';
export { MediaPlatform, MediaService } from './mediaService.js';
export { getNextId } from './idGenerator.js';
export { TrackIdentifier } from './trackIdentifier.js';

export { ApiClient } from './apiClient.js';
export { API_ROUTES } from './apiRoutes.js';
export {
  UriRequestBody,
  QueryRequestBody,
  GetSpotifyTrackDetailsResponse,
  SearchSpotifyTracksResponse,
  GetYoutubeVideoDetailsResponse,
  SearchYoutubeVideosResponse,
  ErrorResponse,
} from './apiTypes.js';

export function sharedFunction(): string {
  return 'This is a shared function.';
}

export {
  SpotifyClient,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyAlbum,
  SpotifyExternalUrls,
} from './spotify.js';

export { YoutubeClient, YoutubeVideoSnippet, YoutubeVideoDetails } from './youtube.js';

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

export { MediaPlatform, MediaService } from './mediaService.js';
export { getNextId } from './idGenerator.js';

export { ApiClient } from './apiClient.js';
export { API_ROUTES } from './apiRoutes.js';
export { UriRequestBody, QueryRequestBody } from './apiTypes.js';

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

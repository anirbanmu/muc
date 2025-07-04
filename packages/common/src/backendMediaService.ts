import { MediaService } from './mediaService.js';
import { SpotifyClient, SpotifyTrack, SpotifyClientCredentials } from './spotify.js';
import { YoutubeClient, YoutubeVideoDetails, YoutubeSearchResultItem } from './youtube.js';
import {
  mapSpotifyTrackToNormalizedTrack,
  mapYoutubeVideoToNormalizedTrack,
  SpotifyNormalizedTrack,
  YoutubeNormalizedTrack,
} from './normalizedTrack.js';

export class BackendMediaService extends MediaService {
  private spotifyClientId: string | undefined;
  private spotifyClientSecret: string | undefined;
  private youtubeApiKey: string | undefined;

  // Spotify token caching
  private spotifyAccessToken: string | undefined;
  private spotifyTokenExpiry: number | undefined; // Unix timestamp in milliseconds
  private readonly TOKEN_REFRESH_BUFFER_MS = 300 * 1000; // Refresh buffer: 5 minutes (300 * 1000 ms)

  // Cached client instances
  private spotifyClientInstance: SpotifyClient | undefined;
  private youtubeClientInstance: YoutubeClient | undefined;

  constructor() {
    super();

    this.spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    this.spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY;

    if (!this.spotifyClientId || !this.spotifyClientSecret) {
      console.warn(
        'Warning: SPOTIFY_CLIENT_ID and/or SPOTIFY_CLIENT_SECRET environment variables not set. Spotify features may not work.',
      );
    }
    if (!this.youtubeApiKey) {
      console.warn(
        'Warning: YOUTUBE_API_KEY environment variable not set. YouTube features may not work.',
      );
    }

    if (this.youtubeApiKey) {
      this.youtubeClientInstance = new YoutubeClient(this.youtubeApiKey);
    }
  }

  private async ensureSpotifyAccessTokenAndClient(): Promise<void> {
    if (
      this.spotifyAccessToken &&
      this.spotifyTokenExpiry &&
      Date.now() < this.spotifyTokenExpiry - this.TOKEN_REFRESH_BUFFER_MS
    ) {
      return; // Token is valid, nothing to do
    }

    // Token is expired or needs refreshing, or doesn't exist
    if (!this.spotifyClientId || !this.spotifyClientSecret) {
      console.error('Error: Spotify client ID and/or secret not configured. Cannot obtain token.');
      return;
    }

    try {
      console.log('Refreshing Spotify access token...');
      const auth: SpotifyClientCredentials = await SpotifyClient.getClientCredentialsToken(
        this.spotifyClientId,
        this.spotifyClientSecret,
      );
      this.spotifyAccessToken = auth.access_token;
      this.spotifyTokenExpiry = Date.now() + auth.expires_in * 1000; // expires_in is in seconds, convert to ms

      // Update the cached Spotify client instance with the new token
      this.spotifyClientInstance = new SpotifyClient(this.spotifyAccessToken);
    } catch (error) {
      console.error('Failed to obtain Spotify access token:', error);
      this.spotifyAccessToken = undefined;
      this.spotifyTokenExpiry = undefined;
      this.spotifyClientInstance = undefined;
      throw new Error('Failed to acquire Spotify access token.');
    }
  }

  private async getSpotifyClient(): Promise<SpotifyClient> {
    await this.ensureSpotifyAccessTokenAndClient();
    return this.spotifyClientInstance as SpotifyClient;
  }

  protected async getSpotifyTrackDetails(uri: string): Promise<SpotifyNormalizedTrack> {
    let spotifyClient: SpotifyClient;
    try {
      spotifyClient = await this.getSpotifyClient();
    } catch (error) {
      throw new Error('SpotifyClient could not be initialized. Cannot fetch track details.');
    }
    const track: SpotifyTrack = await spotifyClient.getTrackDetails(uri);
    return mapSpotifyTrackToNormalizedTrack(track);
  }

  protected async searchSpotifyTracks(query: string): Promise<SpotifyNormalizedTrack | null> {
    let spotifyClient: SpotifyClient;
    try {
      spotifyClient = await this.getSpotifyClient();
    } catch (error) {
      console.warn('SpotifyClient could not be initialized. Skipping Spotify search.');
      return null;
    }
    const track: SpotifyTrack | null = await spotifyClient.searchTracks(query);
    return track ? mapSpotifyTrackToNormalizedTrack(track) : null;
  }

  protected async getYoutubeVideoDetails(uri: string): Promise<YoutubeNormalizedTrack> {
    if (!this.youtubeClientInstance) {
      throw new Error(
        'YouTube client not initialized. Check API key configuration. Cannot fetch video details.',
      );
    }
    const video: YoutubeVideoDetails = await this.youtubeClientInstance.getVideoDetails(uri);
    return mapYoutubeVideoToNormalizedTrack(video);
  }

  protected async searchYoutubeVideos(query: string): Promise<YoutubeNormalizedTrack | null> {
    if (!this.youtubeClientInstance) {
      console.warn(
        'YouTube client not initialized. Check API key configuration. Skipping YouTube search.',
      );
      return null;
    }
    const video: YoutubeSearchResultItem | null =
      await this.youtubeClientInstance.searchVideos(query);
    return video ? mapYoutubeVideoToNormalizedTrack(video) : null;
  }
}

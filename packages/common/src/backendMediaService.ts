import { MediaService } from './mediaService.js';
import { SpotifyTrack, SpotifyClient } from './spotify.js';
import { YoutubeClient, YoutubeVideoDetails, YoutubeSearchResultItem } from './youtube.js';
import {
  mapSpotifyTrackToNormalizedTrack,
  mapYoutubeVideoToNormalizedTrack,
  SpotifyNormalizedTrack,
  YoutubeNormalizedTrack,
} from './normalizedTrack.js';

export class BackendMediaService extends MediaService {
  private spotifyConfig: { clientId: string; clientSecret: string } | undefined;
  private youtubeApiKey: string | undefined;

  private youtubeClient: YoutubeClient | undefined;
  private spotifyClient: SpotifyClient | undefined;

  constructor(spotifyConfig?: { clientId: string; clientSecret: string }, youtubeApiKey?: string) {
    super();
    this.spotifyConfig = spotifyConfig;
    this.youtubeApiKey = youtubeApiKey;
    if (this.youtubeApiKey) {
      this.youtubeClient = new YoutubeClient(this.youtubeApiKey);
    }
  }

  private async getManagedSpotifyClient(): Promise<SpotifyClient> {
    if (!this.spotifyConfig?.clientId || !this.spotifyConfig?.clientSecret) {
      throw new Error('Spotify client ID and/or secret not configured.');
    }
    if (!this.spotifyClient) {
      console.log('Initializing SpotifyClient...');
      this.spotifyClient = await SpotifyClient.create(
        this.spotifyConfig.clientId,
        this.spotifyConfig.clientSecret,
      );
    }
    return this.spotifyClient;
  }

  public async getSpotifyTrackDetails(uri: string): Promise<SpotifyNormalizedTrack> {
    let spotifyClient: SpotifyClient;
    try {
      spotifyClient = await this.getManagedSpotifyClient();
    } catch (error) {
      throw new Error('SpotifyClient could not be initialized. Cannot fetch track details.');
    }
    const track: SpotifyTrack = await spotifyClient.getTrackDetails(uri);
    return mapSpotifyTrackToNormalizedTrack(track);
  }

  public async searchSpotifyTracks(query: string): Promise<SpotifyNormalizedTrack | null> {
    let spotifyClient: SpotifyClient;
    try {
      spotifyClient = await this.getManagedSpotifyClient();
    } catch (error) {
      console.warn('SpotifyClient could not be initialized. Skipping Spotify search.');
      return null;
    }
    const track: SpotifyTrack | null = await spotifyClient.searchTracks(query);
    return track ? mapSpotifyTrackToNormalizedTrack(track) : null;
  }

  public async getYoutubeVideoDetails(uri: string): Promise<YoutubeNormalizedTrack> {
    if (!this.youtubeClient) {
      throw new Error(
        'YouTube client not initialized. Check API key configuration. Cannot fetch video details.',
      );
    }
    const video: YoutubeVideoDetails = await this.youtubeClient.getVideoDetails(uri);
    return mapYoutubeVideoToNormalizedTrack(video);
  }

  public async searchYoutubeVideos(query: string): Promise<YoutubeNormalizedTrack | null> {
    if (!this.youtubeClient) {
      console.warn(
        'YouTube client not initialized. Check API key configuration. Skipping YouTube search.',
      );
      return null;
    }
    const video: YoutubeSearchResultItem | null = await this.youtubeClient.searchVideos(query);
    return video ? mapYoutubeVideoToNormalizedTrack(video) : null;
  }
}

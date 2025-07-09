import { MediaService } from './mediaService.js';
import { SpotifyTrack, SpotifyClient, SpotifyClientCredentials } from './spotify.js';
import { YoutubeClient, YoutubeVideoDetails, YoutubeSearchResultItem } from './youtube.js';
import {
  mapSpotifyTrackToNormalizedTrack,
  mapYoutubeVideoToNormalizedTrack,
  SpotifyNormalizedTrack,
  YoutubeNormalizedTrack,
} from './normalizedTrack.js';
import { ItunesClient } from './itunes.js';
import { DeezerClient } from './deezer.js';

export class BackendMediaService extends MediaService {
  private readonly youtubeClient: YoutubeClient | undefined;
  private readonly spotifyClient: SpotifyClient | undefined;

  private constructor(
    deezerClient?: DeezerClient,
    itunesClient?: ItunesClient,
    spotifyClient?: SpotifyClient,
    youtubeClient?: YoutubeClient,
  ) {
    super(deezerClient, itunesClient);
    this.spotifyClient = spotifyClient;
    this.youtubeClient = youtubeClient;
  }

  public static async create(
    spotifyCredentials?: SpotifyClientCredentials,
    youtubeApiKey?: string,
  ): Promise<BackendMediaService> {
    const spotifyClient = spotifyCredentials
      ? await SpotifyClient.create(spotifyCredentials)
      : undefined;

    const youtubeClient = youtubeApiKey ? new YoutubeClient(youtubeApiKey) : undefined;
    return new BackendMediaService(
      new DeezerClient(),
      new ItunesClient(),
      spotifyClient,
      youtubeClient,
    );
  }

  public static createWithClients(
    deezerClient?: DeezerClient,
    itunesClient?: ItunesClient,
    spotifyClient?: SpotifyClient,
    youtubeClient?: YoutubeClient,
  ): BackendMediaService {
    return new BackendMediaService(deezerClient, itunesClient, spotifyClient, youtubeClient);
  }

  public async getSpotifyTrackDetails(uri: string): Promise<SpotifyNormalizedTrack> {
    if (!this.spotifyClient) {
      throw new Error(
        'Spotify client ID and/or secret not configured. Cannot fetch track details.',
      );
    }
    const track: SpotifyTrack = await this.spotifyClient.getTrackDetails(uri);
    return mapSpotifyTrackToNormalizedTrack(track);
  }

  public async searchSpotifyTracks(query: string): Promise<SpotifyNormalizedTrack | null> {
    if (!this.spotifyClient) {
      console.warn('Spotify client ID and/or secret not configured. Skipping Spotify search..');
      return null;
    }
    const track: SpotifyTrack | null = await this.spotifyClient.searchTracks(query);
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

import { MediaService } from './mediaService.js';
import { SpotifyTrack, SpotifyClient, SpotifyClientCredentials, SpotifyClientInterface } from './spotify.js';
import { YoutubeClient, YoutubeVideoDetails, YoutubeSearchResultItem, YoutubeClientInterface } from './youtube.js';
import {
  mapSpotifyTrackToNormalizedTrack,
  mapYoutubeVideoToNormalizedTrack,
  SpotifyNormalizedTrack,
  YoutubeNormalizedTrack,
  mapDeezerTrackToNormalizedTrack,
  mapItunesTrackToNormalizedTrack,
  DeezerNormalizedTrack,
  ItunesNormalizedTrack,
} from './normalizedTrack.js';
import { ItunesClient, ItunesClientInterface, ItunesTrack } from './itunes.js';
import { DeezerClient, DeezerTrack } from './deezer.js';

export class BackendMediaService extends MediaService {
  private readonly youtubeClient: YoutubeClientInterface | undefined;
  private readonly spotifyClient: SpotifyClientInterface | undefined;
  private readonly deezerClient: DeezerClient;
  private readonly itunesClient: ItunesClientInterface;

  private constructor(
    deezerClient: DeezerClient,
    itunesClient: ItunesClientInterface,
    spotifyClient?: SpotifyClientInterface,
    youtubeClient?: YoutubeClientInterface,
  ) {
    super();
    this.deezerClient = deezerClient;
    this.itunesClient = itunesClient;
    this.spotifyClient = spotifyClient;
    this.youtubeClient = youtubeClient;
  }

  public static async create(
    spotifyCredentials?: SpotifyClientCredentials,
    youtubeApiKey?: string,
  ): Promise<BackendMediaService> {
    const spotifyClient = spotifyCredentials ? await SpotifyClient.create(spotifyCredentials) : undefined;

    const youtubeClient = youtubeApiKey ? new YoutubeClient(youtubeApiKey) : undefined;
    return new BackendMediaService(new DeezerClient(), new ItunesClient(), spotifyClient, youtubeClient);
  }

  public static createWithClients(
    deezerClient?: DeezerClient,
    itunesClient?: ItunesClientInterface,
    spotifyClient?: SpotifyClientInterface,
    youtubeClient?: YoutubeClientInterface,
  ): BackendMediaService {
    return new BackendMediaService(
      deezerClient ?? new DeezerClient(),
      itunesClient ?? new ItunesClient(),
      spotifyClient,
      youtubeClient,
    );
  }

  public async getSpotifyTrackDetails(uri: string): Promise<SpotifyNormalizedTrack> {
    if (!this.spotifyClient) {
      throw new Error('Spotify client ID and/or secret not configured. Cannot fetch track details.');
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
      throw new Error('YouTube client not initialized. Check API key configuration. Cannot fetch video details.');
    }
    const video: YoutubeVideoDetails = await this.youtubeClient.getVideoDetails(uri);
    return mapYoutubeVideoToNormalizedTrack(video);
  }

  public async searchYoutubeVideos(query: string): Promise<YoutubeNormalizedTrack | null> {
    if (!this.youtubeClient) {
      console.warn('YouTube client not initialized. Check API key configuration. Skipping YouTube search.');
      return null;
    }
    const video: YoutubeSearchResultItem | null = await this.youtubeClient.searchVideos(query);
    return video ? mapYoutubeVideoToNormalizedTrack(video) : null;
  }

  public async getDeezerTrackDetails(uri: string): Promise<DeezerNormalizedTrack> {
    const track: DeezerTrack = await this.deezerClient.getTrackDetails(uri);
    return mapDeezerTrackToNormalizedTrack(track);
  }

  public async searchDeezerTracks(query: string): Promise<DeezerNormalizedTrack | null> {
    const track: DeezerTrack | null = await this.deezerClient.searchTracks(query);
    return track ? mapDeezerTrackToNormalizedTrack(track) : null;
  }

  public async getItunesTrackDetails(uri: string): Promise<ItunesNormalizedTrack> {
    const track: ItunesTrack = await this.itunesClient.getTrackDetails(uri);
    return mapItunesTrackToNormalizedTrack(track);
  }

  public async searchItunesTracks(query: string): Promise<ItunesNormalizedTrack | null> {
    const track: ItunesTrack | null = await this.itunesClient.searchTracks(query);
    return track ? mapItunesTrackToNormalizedTrack(track) : null;
  }
}

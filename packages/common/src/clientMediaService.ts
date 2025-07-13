import { ApiClient } from './apiClient.js';
import { MediaService } from './mediaService.js';
import {
  SpotifyNormalizedTrack,
  YoutubeNormalizedTrack,
  DeezerNormalizedTrack,
  ItunesNormalizedTrack,
  mapDeezerTrackToNormalizedTrack,
  mapItunesTrackToNormalizedTrack,
} from './normalizedTrack.js';
import { DeezerClient, DeezerTrack } from './deezer.js';
import { ItunesClient, ItunesTrack } from './itunes.js';

export class ClientMediaService extends MediaService {
  private readonly apiClient: ApiClient;
  private readonly deezerClient: DeezerClient;
  private readonly itunesClient: ItunesClient;

  constructor(apiClient: ApiClient) {
    super();
    this.apiClient = apiClient;
    this.deezerClient = new DeezerClient();
    this.itunesClient = new ItunesClient();
  }

  public async getSpotifyTrackDetails(uri: string): Promise<SpotifyNormalizedTrack> {
    return this.apiClient.getSpotifyTrackDetails(uri);
  }

  public async searchSpotifyTracks(query: string): Promise<SpotifyNormalizedTrack | null> {
    const results = await this.apiClient.searchSpotifyTracks(query);
    return results[0] || null;
  }

  public async getYoutubeVideoDetails(uri: string): Promise<YoutubeNormalizedTrack> {
    return this.apiClient.getYoutubeVideoDetails(uri);
  }

  public async searchYoutubeVideos(query: string): Promise<YoutubeNormalizedTrack | null> {
    const results = await this.apiClient.searchYoutubeVideos(query);
    return results[0] || null;
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

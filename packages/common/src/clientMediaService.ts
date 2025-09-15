import { ApiClient } from './apiClient.js';
import { MediaService } from './mediaService.js';
import {
  SpotifyNormalizedTrack,
  YoutubeNormalizedTrack,
  DeezerNormalizedTrack,
  ItunesNormalizedTrack,
} from './normalizedTrack.js';

export class ClientMediaService extends MediaService {
  private readonly apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    super();
    this.apiClient = apiClient;
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
    return this.apiClient.getDeezerTrackDetails(uri);
  }

  public async searchDeezerTracks(query: string): Promise<DeezerNormalizedTrack | null> {
    const results = await this.apiClient.searchDeezerTracks(query);
    return results[0] || null;
  }

  public async getItunesTrackDetails(uri: string): Promise<ItunesNormalizedTrack> {
    return this.apiClient.getItunesTrackDetails(uri);
  }

  public async searchItunesTracks(query: string): Promise<ItunesNormalizedTrack | null> {
    const results = await this.apiClient.searchItunesTracks(query);
    return results[0] || null;
  }
}

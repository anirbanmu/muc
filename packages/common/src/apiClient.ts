import axios from 'axios';
import { SpotifyNormalizedTrack, YoutubeNormalizedTrack } from './normalizedTrack.js';
import { API_ROUTES } from './apiRoutes.js';
import { QueryRequestBody, UriRequestBody } from './apiTypes.js';

export class ApiClient {
  private readonly client: Axios.AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async getSpotifyTrackDetails(uri: string): Promise<SpotifyNormalizedTrack> {
    const response = await this.client.post<SpotifyNormalizedTrack>(API_ROUTES.spotify.track, {
      uri,
    } as UriRequestBody);
    return response.data;
  }

  public async searchSpotifyTracks(query: string): Promise<SpotifyNormalizedTrack[]> {
    const response = await this.client.post<SpotifyNormalizedTrack[]>(API_ROUTES.spotify.search, {
      query,
    } as QueryRequestBody);
    return response.data;
  }

  public async getYoutubeVideoDetails(uri: string): Promise<YoutubeNormalizedTrack> {
    const response = await this.client.post<YoutubeNormalizedTrack>(API_ROUTES.youtube.video, {
      uri,
    } as UriRequestBody);
    return response.data;
  }

  public async searchYoutubeVideos(query: string): Promise<YoutubeNormalizedTrack[]> {
    const response = await this.client.post<YoutubeNormalizedTrack[]>(API_ROUTES.youtube.search, {
      query,
    } as QueryRequestBody);
    return response.data;
  }
}

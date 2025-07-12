import axios from 'axios';
import { API_ROUTES } from './apiRoutes.js';
import {
  QueryRequestBody,
  UriRequestBody,
  GetSpotifyTrackDetailsResponse,
  SearchSpotifyTracksResponse,
  GetYoutubeVideoDetailsResponse,
  SearchYoutubeVideosResponse,
} from './apiTypes.js';

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

  public async getSpotifyTrackDetails(uri: string): Promise<GetSpotifyTrackDetailsResponse> {
    const response = await this.client.post<GetSpotifyTrackDetailsResponse>(
      API_ROUTES.spotify.track,
      {
        uri,
      } as UriRequestBody,
    );
    return response.data;
  }

  public async searchSpotifyTracks(query: string): Promise<SearchSpotifyTracksResponse> {
    const response = await this.client.post<SearchSpotifyTracksResponse>(
      API_ROUTES.spotify.search,
      {
        query,
      } as QueryRequestBody,
    );
    return response.data;
  }

  public async getYoutubeVideoDetails(uri: string): Promise<GetYoutubeVideoDetailsResponse> {
    const response = await this.client.post<GetYoutubeVideoDetailsResponse>(
      API_ROUTES.youtube.video,
      {
        uri,
      } as UriRequestBody,
    );
    return response.data;
  }

  public async searchYoutubeVideos(query: string): Promise<SearchYoutubeVideosResponse> {
    const response = await this.client.post<SearchYoutubeVideosResponse>(
      API_ROUTES.youtube.search,
      {
        query,
      } as QueryRequestBody,
    );
    return response.data;
  }
}

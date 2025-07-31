import ky from 'ky';
import { API_ROUTES } from './apiRoutes.js';
import {
  QueryRequestBody,
  UriRequestBody,
  GetSpotifyTrackDetailsResponse,
  SearchSpotifyTracksResponse,
  GetYoutubeVideoDetailsResponse,
  SearchYoutubeVideosResponse,
} from './apiTypes.js';
import { isHTTPError, isTimeoutError } from './kyErrorUtils.js';

export class ApiClient {
  private readonly client: typeof ky;

  constructor(baseURL: string) {
    this.client = ky.create({
      prefixUrl: baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async getSpotifyTrackDetails(uri: string): Promise<GetSpotifyTrackDetailsResponse> {
    try {
      return await this.client
        .post(API_ROUTES.spotify.track, {
          json: {
            uri,
          } as UriRequestBody,
        })
        .json<GetSpotifyTrackDetailsResponse>();
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw error;
      }
      throw new Error(
        `Failed to get Spotify track details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  public async searchSpotifyTracks(query: string): Promise<SearchSpotifyTracksResponse> {
    try {
      return await this.client
        .post(API_ROUTES.spotify.search, {
          json: {
            query,
          } as QueryRequestBody,
        })
        .json<SearchSpotifyTracksResponse>();
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw error;
      }
      throw new Error(`Failed to search Spotify tracks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getYoutubeVideoDetails(uri: string): Promise<GetYoutubeVideoDetailsResponse> {
    try {
      return await this.client
        .post(API_ROUTES.youtube.video, {
          json: {
            uri,
          } as UriRequestBody,
        })
        .json<GetYoutubeVideoDetailsResponse>();
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw error;
      }
      throw new Error(
        `Failed to get YouTube video details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  public async searchYoutubeVideos(query: string): Promise<SearchYoutubeVideosResponse> {
    try {
      return await this.client
        .post(API_ROUTES.youtube.search, {
          json: {
            query,
          } as QueryRequestBody,
        })
        .json<SearchYoutubeVideosResponse>();
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw error;
      }
      throw new Error(`Failed to search YouTube videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

import ky from 'ky';
import { API_ROUTES } from './apiRoutes.js';
import {
  QueryRequestBody,
  UriRequestBody,
  GetSpotifyTrackDetailsResponse,
  SearchSpotifyTracksResponse,
  GetYoutubeVideoDetailsResponse,
  SearchYoutubeVideosResponse,
  GetItunesTrackDetailsResponse,
  SearchItunesTracksResponse,
  GetDeezerTrackDetailsResponse,
  SearchDeezerTracksResponse,
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

  public async getItunesTrackDetails(uri: string): Promise<GetItunesTrackDetailsResponse> {
    try {
      return await this.client
        .post(API_ROUTES.itunes.track, {
          json: {
            uri,
          } as UriRequestBody,
        })
        .json<GetItunesTrackDetailsResponse>();
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw error;
      }
      throw new Error(
        `Failed to get iTunes track details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  public async searchItunesTracks(query: string): Promise<SearchItunesTracksResponse> {
    try {
      return await this.client
        .post(API_ROUTES.itunes.search, {
          json: {
            query,
          } as QueryRequestBody,
        })
        .json<SearchItunesTracksResponse>();
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw error;
      }
      throw new Error(`Failed to search iTunes tracks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async getDeezerTrackDetails(uri: string): Promise<GetDeezerTrackDetailsResponse> {
    try {
      return await this.client
        .post(API_ROUTES.deezer.track, {
          json: {
            uri,
          } as UriRequestBody,
        })
        .json<GetDeezerTrackDetailsResponse>();
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw error;
      }
      throw new Error(
        `Failed to get Deezer track details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  public async searchDeezerTracks(query: string): Promise<SearchDeezerTracksResponse> {
    try {
      return await this.client
        .post(API_ROUTES.deezer.search, {
          json: {
            query,
          } as QueryRequestBody,
        })
        .json<SearchDeezerTracksResponse>();
    } catch (error) {
      if (isHTTPError(error) || isTimeoutError(error)) {
        throw error;
      }
      throw new Error(`Failed to search Deezer tracks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

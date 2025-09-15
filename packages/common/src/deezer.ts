import ky from 'ky';
import { isHTTPError, extractApiErrorMessage } from './kyErrorUtils.js';

export interface DeezerArtist {
  name: string;
  link: string;
}

export interface DeezerAlbum {
  title: string;
}

export interface DeezerTrack {
  id: number;
  title: string;
  link: string;
  artist: DeezerArtist;
  album: DeezerAlbum;
}

const DEEZER_BASE_URI = 'https://api.deezer.com';
const DEEZER_TRACK_URI = DEEZER_BASE_URI + '/track';
const DEEZER_TRACK_SEARCH_URI = DEEZER_BASE_URI + '/search/track';

export interface DeezerClientInterface {
  getTrackDetails(uri: string): Promise<DeezerTrack>;
  searchTracks(query: string): Promise<DeezerTrack | null>;
}

export class DeezerClient implements DeezerClientInterface {
  constructor() {}

  public async getTrackDetails(uri: string): Promise<DeezerTrack> {
    const id = DeezerClient.parseId(uri);
    if (id === null) {
      throw new Error('Invalid Deezer track URI format.');
    }
    const deezerUri = `${DEEZER_TRACK_URI}/${id}`;

    try {
      const response = await ky.get(deezerUri).json<DeezerTrack & { error?: { message: string } }>();

      if (response.error) {
        throw new Error(`Bad Deezer URI: ${extractApiErrorMessage(response, 'Unknown error')}`);
      }
      return response;
    } catch (error) {
      if (isHTTPError(error)) {
        throw new Error(`Failed to get Deezer track details: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  }

  public async searchTracks(query: string): Promise<DeezerTrack | null> {
    const params = {
      q: query,
      limit: 1,
    };

    try {
      const response = await ky
        .get(DEEZER_TRACK_SEARCH_URI, {
          searchParams: params,
        })
        .json<{
          data: DeezerTrack[];
          total: number;
          error?: { message: string };
        }>();

      if (response.error) {
        throw new Error(`Deezer search error: ${extractApiErrorMessage(response, 'Unknown error')}`);
      }

      return response.total > 0 ? response.data[0] : null;
    } catch (error) {
      if (isHTTPError(error)) {
        throw new Error(`Failed to search Deezer tracks: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  }

  public static parseId(uri: string): string | null {
    const re = /track\/(\d+)/;
    const parsed = re.exec(uri);
    if (parsed === null || !parsed[1]) {
      return null;
    }
    return parsed[1];
  }

  public static isUriParsable(uri: string): boolean {
    return DeezerClient.parseId(uri) !== null;
  }

  public static reconstructUri(trackId: string): string {
    if (!trackId || trackId.trim() === '') {
      throw new Error('Track ID cannot be empty');
    }
    return `https://www.deezer.com/track/${trackId.trim()}`;
  }
}

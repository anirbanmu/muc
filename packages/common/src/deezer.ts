import axios from 'axios';
import qs from 'qs';
import { isBrowser } from 'browser-or-node';

// using jsonp on browsers because deezer doesn't work with CORS
import jsonp from 'jsonp';

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

export class DeezerClient {
  constructor() {}

  public async getTrackDetails(uri: string): Promise<DeezerTrack> {
    const id = DeezerClient.parseId(uri);
    if (id === null) {
      throw new Error('Invalid Deezer track URI format.');
    }
    const deezerUri = `${DEEZER_TRACK_URI}/${id}`;

    if (isBrowser) {
      return DeezerClient.getUriDetailsJsonp(deezerUri);
    }

    const response = await axios.get<DeezerTrack & { error?: { message: string } }>(deezerUri);

    if (response.data.error) {
      throw new Error(`Bad Deezer URI: ${response.data.error.message ?? 'Unknown error'}`);
    }
    return response.data;
  }

  public async searchTracks(query: string): Promise<DeezerTrack | null> {
    const params = {
      q: query,
      limit: 1,
    };

    if (isBrowser) {
      return DeezerClient.searchJsonp(params);
    }

    const response = await axios.request<{
      data: DeezerTrack[];
      total: number;
      error?: { message: string };
    }>({
      url: DEEZER_TRACK_SEARCH_URI,
      params: params,
    });

    if (response.data.error) {
      throw new Error(`Deezer search error: ${response.data.error.message ?? 'Unknown error'}`);
    }

    return response.data.total > 0 ? response.data.data[0] : null;
  }

  private static getUriDetailsJsonp(uri: string): Promise<DeezerTrack> {
    return new Promise((resolve, reject) => {
      jsonp(
        `${uri}&output=jsonp`,
        { timeout: 2000 }, // ms
        (error: Error | null, data: DeezerTrack & { error?: { message: string } }) => {
          if (error || data.error) {
            reject(
              new Error(
                `Bad Deezer URI: ${error?.message ?? data.error?.message ?? 'Unknown error'}`,
              ),
            );
          } else {
            resolve(data);
          }
        },
      );
    });
  }

  private static searchJsonp(params: { q: string; limit: number }): Promise<DeezerTrack | null> {
    const queryString = qs.stringify(Object.assign({ output: 'jsonp' }, params));
    return new Promise((resolve, reject) => {
      jsonp(
        `${DEEZER_TRACK_SEARCH_URI}?${queryString}`,
        { timeout: 2000 }, // ms
        (
          error: Error | null,
          data: { data: DeezerTrack[]; total: number; error?: { message: string } },
        ) => {
          if (error || data.error) {
            reject(
              new Error(
                `Deezer search error: ${error?.message ?? data.error?.message ?? 'Unknown error'}`,
              ),
            );
          } else {
            const found = data.total < 1 ? null : data.data[0];
            resolve(found);
          }
        },
      );
    });
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

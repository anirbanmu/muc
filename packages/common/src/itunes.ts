import ky from 'ky';
import qs from 'qs';
import { isHTTPError } from './kyErrorUtils.js';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Using jsonp on browsers because itunes doesn't work with CORS
import jsonp from 'jsonp';

const ITUNES_BASE_URI = 'https://itunes.apple.com';
const ITUNES_LOOKUP_URI = `${ITUNES_BASE_URI}/lookup`;
const ITUNES_SEARCH_URI = `${ITUNES_BASE_URI}/search`;

export interface ItunesTrack {
  artistName: string;
  artistViewUrl: string;
  trackName: string;
  trackViewUrl: string;
  trackId: number;
  collectionName: string;
  collectionId: number;
  collectionViewUrl: string;
  artworkUrl100: string;
}

interface ItunesLookupResponse {
  resultCount: number;
  results: ItunesTrack[];
}

interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrack[];
}

export class ItunesClient {
  constructor() {}

  public async getTrackDetails(uri: string): Promise<ItunesTrack> {
    const id = ItunesClient.parseId(uri);
    if (id === null) {
      throw new Error('Invalid iTunes track URI format.');
    }
    const params = { id };

    if (isBrowser) {
      return ItunesClient.getUriDetailsJsonp(params);
    }

    try {
      const response = await ky
        .get(ITUNES_LOOKUP_URI, {
          searchParams: params,
        })
        .json<ItunesLookupResponse>();

      if (response.resultCount < 1) {
        throw new Error('Bad iTunes URI: No track found for the given ID.');
      }
      return response.results[0];
    } catch (error) {
      if (isHTTPError(error)) {
        throw new Error(`Failed to get iTunes track details: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  }

  private static getUriDetailsJsonp(params: { id: string }): Promise<ItunesTrack> {
    const queryString = qs.stringify(params);
    return new Promise((resolve, reject) => {
      jsonp(
        `${ITUNES_LOOKUP_URI}?${queryString}`,
        { timeout: 2000 }, // ms
        (error: Error | null, data: ItunesLookupResponse) => {
          if (error || data.resultCount < 1) {
            reject(new Error(`Bad iTunes URI: ${error?.message ?? 'No track found'}`));
          } else {
            resolve(data.results[0]);
          }
        },
      );
    });
  }

  public async searchTracks(query: string): Promise<ItunesTrack | null> {
    const params = {
      term: query,
      limit: 1,
      media: 'music',
      entity: 'song',
    };

    if (isBrowser) {
      return ItunesClient.searchJsonp(params);
    }

    try {
      const response = await ky
        .get(ITUNES_SEARCH_URI, {
          searchParams: params,
        })
        .json<ItunesSearchResponse>();

      return response.resultCount < 1 ? null : response.results[0];
    } catch (error) {
      if (isHTTPError(error)) {
        throw new Error(`Failed to search iTunes tracks: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  }

  private static searchJsonp(params: {
    term: string;
    limit: number;
    media: string;
    entity: string;
  }): Promise<ItunesTrack | null> {
    const queryString = qs.stringify(params);
    return new Promise((resolve, reject) => {
      jsonp(
        `${ITUNES_SEARCH_URI}?${queryString}`,
        { timeout: 2000 }, // ms
        (error: Error | null, data: ItunesSearchResponse) => {
          if (error) {
            reject(new Error(`iTunes search failed: ${error.message}`));
          } else {
            const found = data.resultCount < 1 ? null : data.results[0];
            resolve(found);
          }
        },
      );
    });
  }

  public static parseId(uri: string): string | null {
    const re = /album\/.+i=(\d+)/;
    const parsed = re.exec(uri);
    if (parsed === null || !parsed[1]) {
      return null;
    }
    return parsed[1];
  }

  public static isUriParsable(uri: string): boolean {
    return ItunesClient.parseId(uri) !== null;
  }

  public static reconstructUri(trackId: string, albumId: string): string {
    if (!trackId || !albumId) {
      throw new Error('Both trackId and albumId are required to reconstruct the URI');
    }
    return `https://music.apple.com/us/album/${albumId}?i=${trackId}`;
  }
}

import ky from 'ky';
import { isHTTPError } from './kyErrorUtils.js';

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

export interface ItunesClientInterface {
  getTrackDetails(uri: string): Promise<ItunesTrack>;
  searchTracks(query: string): Promise<ItunesTrack | null>;
}

export class ItunesClient implements ItunesClientInterface {
  constructor() {}

  public async getTrackDetails(uri: string): Promise<ItunesTrack> {
    const id = ItunesClient.parseId(uri);
    if (id === null) {
      throw new Error('Invalid iTunes track URI format.');
    }
    const params = { id };

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

  public async searchTracks(query: string): Promise<ItunesTrack | null> {
    const params = {
      term: query,
      limit: 1,
      media: 'music',
      entity: 'song',
    };

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

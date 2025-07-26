import axios from 'axios';
import { isBrowser } from 'browser-or-node';
import qs from 'qs';

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
  // Album-related fields from iTunes API
  collectionName: string; // album name
  collectionId: number; // album id
  collectionViewUrl: string; // album url
  artworkUrl100: string; // album artwork (100x100)
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

    const response = await axios.request<ItunesLookupResponse>({
      url: ITUNES_LOOKUP_URI,
      params: params,
    });

    if (response.data.resultCount < 1) {
      throw new Error('Bad iTunes URI: No track found for the given ID.');
    }
    return response.data.results[0];
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

    const response = await axios.request<ItunesSearchResponse>({
      url: ITUNES_SEARCH_URI,
      params: params,
    });

    return response.data.resultCount < 1 ? null : response.data.results[0];
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

  public static reconstructUri(trackId: string): string {
    if (!trackId || trackId.trim() === '') {
      throw new Error('Track ID cannot be empty');
    }
    return `https://music.apple.com/album/id${trackId.trim()}`;
  }
}

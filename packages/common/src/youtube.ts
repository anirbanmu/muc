import ky from 'ky';
import { isHTTPError } from './kyErrorUtils.js';

const YOUTUBE_BASE_URI = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_VIDEOS_URI = YOUTUBE_BASE_URI + '/videos';
const YOUTUBE_SEARCH_URI = YOUTUBE_BASE_URI + '/search';

export interface YoutubeVideoSnippet {
  title: string;
  channelTitle: string;
}

export interface YoutubeVideoDetails {
  id: string;
  snippet: YoutubeVideoSnippet;
}

export interface YoutubeSearchResultItem {
  id: {
    videoId?: string;
  };
  snippet: {
    title: string;
  };
}

export interface YoutubeClientInterface {
  getVideoDetails(uri: string): Promise<YoutubeVideoDetails>;
  searchVideos(query: string): Promise<YoutubeSearchResultItem | null>;
}

export class YoutubeClient implements YoutubeClientInterface {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private addKey<T extends object>(params: T): T & { key: string } {
    return { ...params, key: this.apiKey };
  }

  public async getVideoDetails(uri: string): Promise<YoutubeVideoDetails> {
    const id = YoutubeClient.parseId(uri);
    if (id === null) {
      throw new Error('Invalid YouTube URI format.');
    }

    try {
      const response = await ky
        .get(YOUTUBE_VIDEOS_URI, {
          searchParams: this.addKey({ id: id, part: 'snippet' }),
        })
        .json<{ items: YoutubeVideoDetails[] }>();

      if (response.items.length < 1) {
        throw new Error('Bad YouTube URI: No video found for the given ID.');
      }
      return response.items[0];
    } catch (error) {
      if (isHTTPError(error)) {
        throw new Error(`Failed to get YouTube video details: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  }

  public async searchVideos(query: string): Promise<YoutubeSearchResultItem | null> {
    const params = this.addKey({
      q: query,
      type: 'video',
      maxResults: 1,
      part: 'snippet', // 'snippet' part is required to get the title for the search result item
    });

    try {
      const response = await ky
        .get(YOUTUBE_SEARCH_URI, {
          searchParams: params,
        })
        .json<{ items: YoutubeSearchResultItem[] }>();

      return response.items.length > 0 ? response.items[0] : null;
    } catch (error) {
      if (isHTTPError(error)) {
        throw new Error(`Failed to search YouTube videos: ${error.response.status} ${error.response.statusText}`);
      }
      throw error;
    }
  }

  public static parseId(uri: string): string | null {
    let id = YoutubeClient.parseRegularLinkId(uri);
    if (id) {
      return id;
    }
    id = YoutubeClient.parseShortLinkId(uri);
    if (id) {
      return id;
    }
    return null;
  }

  private static parseRegularLinkId(uri: string): string | null {
    const queryString = uri.split('?', 2);
    if (queryString.length === 2) {
      const parsedQs = new URLSearchParams(queryString[1]);
      const v = parsedQs.get('v');
      if (v) {
        return v;
      }
    }
    return null;
  }

  private static parseShortLinkId(uri: string): string | null {
    const parts = uri.split('youtu.be/', 2);
    if (parts.length === 2) {
      const idWithParams = parts[1];
      const id = idWithParams.split(/[?#]/)[0];
      if (id) {
        return id;
      }
    }
    return null;
  }

  public static async getToken(apiKey: string): Promise<string> {
    return apiKey;
  }

  public static isUriParsable(uri: string): boolean {
    return YoutubeClient.parseId(uri) !== null;
  }

  public static reconstructUri(trackId: string): string {
    if (!trackId || trackId.trim() === '') {
      throw new Error('Track ID cannot be empty');
    }
    return `https://www.youtube.com/watch?v=${trackId.trim()}`;
  }
}

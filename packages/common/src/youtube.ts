import axios from 'axios';
import qs from 'qs';

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

export class YoutubeClient {
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
    const response = await axios.request<{ items: YoutubeVideoDetails[] }>({
      url: YOUTUBE_VIDEOS_URI,
      params: this.addKey({ id: id, part: 'snippet' }),
    });

    if (response.data.items.length < 1) {
      throw new Error('Bad YouTube URI: No video found for the given ID.');
    }
    return response.data.items[0];
  }

  public async searchVideos(query: string): Promise<YoutubeSearchResultItem | null> {
    const params = this.addKey({
      q: query,
      type: 'video',
      maxResults: 1,
      part: 'snippet', // 'snippet' part is required to get the title for the search result item
    });
    const response = await axios.request<{ items: YoutubeSearchResultItem[] }>({
      url: YOUTUBE_SEARCH_URI,
      params: params,
    });

    return response.data.items.length > 0 ? response.data.items[0] : null;
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
      const parsedQs = qs.parse(queryString[1]);
      if (typeof parsedQs.v === 'string') {
        return parsedQs.v;
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

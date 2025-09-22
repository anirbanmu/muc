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

    const url = new URL(YOUTUBE_VIDEOS_URI);
    const params = this.addKey({ id: id, part: 'snippet' });
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to get YouTube video details: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { items: YoutubeVideoDetails[] };

    if (data.items.length < 1) {
      throw new Error('Bad YouTube URI: No video found for the given ID.');
    }

    return data.items[0];
  }

  public async searchVideos(query: string): Promise<YoutubeSearchResultItem | null> {
    const url = new URL(YOUTUBE_SEARCH_URI);
    const params = this.addKey({
      q: query,
      type: 'video',
      maxResults: 1,
      part: 'snippet', // 'snippet' part is required to get the title for the search result item
    });

    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to search YouTube videos: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { items: YoutubeSearchResultItem[] };
    return data.items.length > 0 ? data.items[0] : null;
  }

  public static parseId(uri: string): string | null {
    return YoutubeClient.parseRegularLinkId(uri) || YoutubeClient.parseShortLinkId(uri);
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

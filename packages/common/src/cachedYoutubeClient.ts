import { YoutubeClientInterface, YoutubeClient, YoutubeVideoDetails, YoutubeSearchResultItem } from './youtube.js';
import { CacheAccessor } from './cacheAccessor.js';
import NodeCache from 'node-cache';

export class CachedYoutubeClient implements YoutubeClientInterface {
  private readonly videoCache: CacheAccessor<YoutubeVideoDetails>;
  private readonly searchCache: CacheAccessor<YoutubeSearchResultItem | null>;

  constructor(
    private readonly client: YoutubeClientInterface,
    cache: NodeCache,
  ) {
    this.videoCache = new CacheAccessor(cache, 'youtube:video');
    this.searchCache = new CacheAccessor(cache, 'youtube:search');
  }

  public async getVideoDetails(uri: string): Promise<YoutubeVideoDetails> {
    const videoId = YoutubeClient.parseId(uri);
    if (!videoId) {
      throw new Error('Invalid YouTube URI format.');
    }

    const cached = this.videoCache.get(videoId);
    if (cached) {
      return cached;
    }

    const video = await this.client.getVideoDetails(uri);
    if (!video) {
      throw new Error('YouTube API returned invalid video data');
    }

    this.videoCache.set(videoId, video);
    return video;
  }

  public async searchVideos(query: string): Promise<YoutubeSearchResultItem | null> {
    if (this.searchCache.has(query)) {
      return this.searchCache.get(query) ?? null;
    }

    const video = await this.client.searchVideos(query);
    this.searchCache.set(query, video);
    return video;
  }
}

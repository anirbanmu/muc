import NodeCache from 'node-cache';
import { CacheAccessor } from './cacheAccessor.js';
import { SpotifyClientInterface, SpotifyClient, SpotifyTrack } from './spotify.js';
import { YoutubeClientInterface, YoutubeClient, YoutubeVideoDetails, YoutubeSearchResultItem } from './youtube.js';
import { DeezerClient, DeezerClientInterface, DeezerTrack } from './deezer.js';
import { ItunesClient, ItunesClientInterface, ItunesTrack } from './itunes.js';

function createCacheAccessors<TrackType, SearchType>(cache: NodeCache, platform: string) {
  return {
    trackCache: new CacheAccessor<TrackType>(cache, `${platform}:track`),
    searchCache: new CacheAccessor<SearchType | null>(cache, `${platform}:search`),
  };
}

abstract class CachedClient<T> {
  constructor(
    protected readonly client: T,
    protected readonly cache: NodeCache,
  ) {}
}

export class CachedSpotifyClient extends CachedClient<SpotifyClientInterface> implements SpotifyClientInterface {
  private readonly trackCache: CacheAccessor<SpotifyTrack>;
  private readonly searchCache: CacheAccessor<SpotifyTrack | null>;

  constructor(client: SpotifyClientInterface, cache: NodeCache) {
    super(client, cache);
    const caches = createCacheAccessors<SpotifyTrack, SpotifyTrack>(cache, 'spotify');
    this.trackCache = caches.trackCache;
    this.searchCache = caches.searchCache;
  }

  async getTrackDetails(uri: string): Promise<SpotifyTrack> {
    const trackId = SpotifyClient.parseTrackId(uri);
    if (!trackId) {
      throw new Error('Invalid Spotify track URI format.');
    }

    const cached = this.trackCache.get(trackId);
    if (cached) {
      return cached;
    }

    const track = await this.client.getTrackDetails(uri);
    if (!track) {
      throw new Error('Spotify API returned invalid track data');
    }

    this.trackCache.set(trackId, track);
    return track;
  }

  async searchTracks(query: string): Promise<SpotifyTrack | null> {
    if (this.searchCache.has(query)) {
      return this.searchCache.get(query) ?? null;
    }

    const track = await this.client.searchTracks(query);
    this.searchCache.set(query, track);
    return track;
  }
}

export class CachedYoutubeClient extends CachedClient<YoutubeClientInterface> implements YoutubeClientInterface {
  private readonly videoCache: CacheAccessor<YoutubeVideoDetails>;
  private readonly searchCache: CacheAccessor<YoutubeSearchResultItem | null>;

  constructor(client: YoutubeClientInterface, cache: NodeCache) {
    super(client, cache);
    const caches = createCacheAccessors<YoutubeVideoDetails, YoutubeSearchResultItem>(cache, 'youtube');
    this.videoCache = caches.trackCache;
    this.searchCache = caches.searchCache;
  }

  async getVideoDetails(uri: string): Promise<YoutubeVideoDetails> {
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

  async searchVideos(query: string): Promise<YoutubeSearchResultItem | null> {
    if (this.searchCache.has(query)) {
      return this.searchCache.get(query) ?? null;
    }

    const video = await this.client.searchVideos(query);
    this.searchCache.set(query, video);
    return video;
  }
}

export class CachedDeezerClient extends CachedClient<DeezerClientInterface> implements DeezerClientInterface {
  private readonly trackCache: CacheAccessor<DeezerTrack>;
  private readonly searchCache: CacheAccessor<DeezerTrack | null>;

  constructor(client: DeezerClientInterface, cache: NodeCache) {
    super(client, cache);
    const caches = createCacheAccessors<DeezerTrack, DeezerTrack>(cache, 'deezer');
    this.trackCache = caches.trackCache;
    this.searchCache = caches.searchCache;
  }

  async getTrackDetails(uri: string): Promise<DeezerTrack> {
    const trackId = DeezerClient.parseId(uri);
    if (!trackId) {
      throw new Error('Invalid Deezer track URI format.');
    }

    const cached = this.trackCache.get(trackId);
    if (cached) {
      return cached;
    }

    const track = await this.client.getTrackDetails(uri);
    if (!track) {
      throw new Error('Deezer API returned invalid track data');
    }

    this.trackCache.set(trackId, track);
    return track;
  }

  async searchTracks(query: string): Promise<DeezerTrack | null> {
    if (this.searchCache.has(query)) {
      return this.searchCache.get(query) ?? null;
    }

    const track = await this.client.searchTracks(query);
    this.searchCache.set(query, track);
    return track;
  }
}

export class CachedItunesClient extends CachedClient<ItunesClientInterface> implements ItunesClientInterface {
  private readonly trackCache: CacheAccessor<ItunesTrack>;
  private readonly searchCache: CacheAccessor<ItunesTrack | null>;

  constructor(client: ItunesClientInterface, cache: NodeCache) {
    super(client, cache);
    const caches = createCacheAccessors<ItunesTrack, ItunesTrack>(cache, 'itunes');
    this.trackCache = caches.trackCache;
    this.searchCache = caches.searchCache;
  }

  async getTrackDetails(uri: string): Promise<ItunesTrack> {
    const trackId = ItunesClient.parseId(uri);
    if (!trackId) {
      throw new Error('Invalid iTunes track URI format.');
    }

    const cached = this.trackCache.get(trackId);
    if (cached) {
      return cached;
    }

    const track = await this.client.getTrackDetails(uri);
    if (!track) {
      throw new Error('iTunes API returned invalid track data');
    }

    this.trackCache.set(trackId, track);
    return track;
  }

  async searchTracks(query: string): Promise<ItunesTrack | null> {
    if (this.searchCache.has(query)) {
      return this.searchCache.get(query) ?? null;
    }

    const track = await this.client.searchTracks(query);
    this.searchCache.set(query, track);
    return track;
  }
}

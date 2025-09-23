import { Cache } from './cache.js';
import { SpotifyClientInterface, SpotifyClient, SpotifyTrack } from './spotify.js';
import { YoutubeClientInterface, YoutubeClient, YoutubeVideoDetails, YoutubeSearchResultItem } from './youtube.js';
import { DeezerClient, DeezerClientInterface, DeezerTrack } from './deezer.js';
import { ItunesClient, ItunesClientInterface, ItunesTrack } from './itunes.js';

export type CacheStorageValue = object | null;

class CacheAccessor<T extends object> {
  constructor(
    private readonly cache: Cache<CacheStorageValue>,
    private readonly keyPrefix: string,
  ) {}

  public get(key: string): T | null | undefined {
    return this.cache.get(`${this.keyPrefix}:${key}`) as T | null | undefined;
  }

  public set(key: string, value: T | null): void {
    this.cache.set(`${this.keyPrefix}:${key}`, value);
  }

  public has(key: string): boolean {
    return this.cache.has(`${this.keyPrefix}:${key}`);
  }

  public delete(key: string): void {
    this.cache.delete(`${this.keyPrefix}:${key}`);
  }
}

// Utility functions for common caching patterns
async function cachedGetOperation<T extends object>(
  cache: CacheAccessor<T>,
  key: string,
  operation: () => Promise<T>,
  errorMessage: string,
): Promise<T> {
  const cached = cache.get(key);

  // Return cached result if available
  if (cached !== undefined) {
    if (cached === null) {
      throw new Error(errorMessage);
    }
    return cached;
  }

  // Execute operation and handle result
  let result: T;
  try {
    result = await operation();
  } catch (error) {
    cache.set(key, null);
    throw error;
  }

  // Check if result is valid
  if (!result) {
    cache.set(key, null);
    throw new Error(errorMessage);
  }

  cache.set(key, result);
  return result;
}

async function cachedSearchOperation<T extends object>(
  cache: CacheAccessor<T>,
  key: string,
  operation: () => Promise<T | null>,
): Promise<T | null> {
  const cached = cache.get(key);
  if (cached !== undefined) {
    return cached;
  }

  const result = await operation();
  cache.set(key, result);
  return result;
}

abstract class CachedClient<T> {
  constructor(
    protected readonly client: T,
    protected readonly cache: Cache<CacheStorageValue>,
  ) {}
}

export class CachedSpotifyClient extends CachedClient<SpotifyClientInterface> implements SpotifyClientInterface {
  private readonly trackCache: CacheAccessor<SpotifyTrack>;
  private readonly searchCache: CacheAccessor<SpotifyTrack>;

  constructor(client: SpotifyClientInterface, cache: Cache<CacheStorageValue>) {
    super(client, cache);
    this.trackCache = new CacheAccessor<SpotifyTrack>(cache, 'spotify:track');
    this.searchCache = new CacheAccessor<SpotifyTrack>(cache, 'spotify:search');
  }

  async getTrackDetails(uri: string): Promise<SpotifyTrack> {
    const trackId = SpotifyClient.parseTrackId(uri);
    if (!trackId) {
      throw new Error('Invalid Spotify track URI format.');
    }

    return cachedGetOperation(
      this.trackCache,
      trackId,
      () => this.client.getTrackDetails(uri),
      'Spotify API returned invalid track data',
    );
  }

  async searchTracks(query: string): Promise<SpotifyTrack | null> {
    return cachedSearchOperation(this.searchCache, query, () => this.client.searchTracks(query));
  }
}

export class CachedYoutubeClient extends CachedClient<YoutubeClientInterface> implements YoutubeClientInterface {
  private readonly videoCache: CacheAccessor<YoutubeVideoDetails>;
  private readonly searchCache: CacheAccessor<YoutubeSearchResultItem>;

  constructor(client: YoutubeClientInterface, cache: Cache<CacheStorageValue>) {
    super(client, cache);
    this.videoCache = new CacheAccessor<YoutubeVideoDetails>(cache, 'youtube:video');
    this.searchCache = new CacheAccessor<YoutubeSearchResultItem>(cache, 'youtube:search');
  }

  async getVideoDetails(uri: string): Promise<YoutubeVideoDetails> {
    const videoId = YoutubeClient.parseId(uri);
    if (!videoId) {
      throw new Error('Invalid YouTube URI format.');
    }

    return cachedGetOperation(
      this.videoCache,
      videoId,
      () => this.client.getVideoDetails(uri),
      'YouTube API returned invalid video data',
    );
  }

  async searchVideos(query: string): Promise<YoutubeSearchResultItem | null> {
    return cachedSearchOperation(this.searchCache, query, () => this.client.searchVideos(query));
  }
}

export class CachedDeezerClient extends CachedClient<DeezerClientInterface> implements DeezerClientInterface {
  private readonly trackCache: CacheAccessor<DeezerTrack>;
  private readonly searchCache: CacheAccessor<DeezerTrack>;

  constructor(client: DeezerClientInterface, cache: Cache<CacheStorageValue>) {
    super(client, cache);
    this.trackCache = new CacheAccessor<DeezerTrack>(cache, 'deezer:track');
    this.searchCache = new CacheAccessor<DeezerTrack>(cache, 'deezer:search');
  }

  async getTrackDetails(uri: string): Promise<DeezerTrack> {
    const trackId = DeezerClient.parseId(uri);
    if (!trackId) {
      throw new Error('Invalid Deezer track URI format.');
    }

    return cachedGetOperation(
      this.trackCache,
      trackId,
      () => this.client.getTrackDetails(uri),
      'Deezer API returned invalid track data',
    );
  }

  async searchTracks(query: string): Promise<DeezerTrack | null> {
    return cachedSearchOperation(this.searchCache, query, () => this.client.searchTracks(query));
  }
}

export class CachedItunesClient extends CachedClient<ItunesClientInterface> implements ItunesClientInterface {
  private readonly trackCache: CacheAccessor<ItunesTrack>;
  private readonly searchCache: CacheAccessor<ItunesTrack>;

  constructor(client: ItunesClientInterface, cache: Cache<CacheStorageValue>) {
    super(client, cache);
    this.trackCache = new CacheAccessor<ItunesTrack>(cache, 'itunes:track');
    this.searchCache = new CacheAccessor<ItunesTrack>(cache, 'itunes:search');
  }

  async getTrackDetails(uri: string): Promise<ItunesTrack> {
    const trackId = ItunesClient.parseId(uri);
    if (!trackId) {
      throw new Error('Invalid iTunes track URI format.');
    }

    return cachedGetOperation(
      this.trackCache,
      trackId,
      () => this.client.getTrackDetails(uri),
      'iTunes API returned invalid track data',
    );
  }

  async searchTracks(query: string): Promise<ItunesTrack | null> {
    return cachedSearchOperation(this.searchCache, query, () => this.client.searchTracks(query));
  }
}

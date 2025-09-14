import { ItunesClient, ItunesClientInterface, ItunesTrack } from './itunes.js';
import { CacheAccessor } from './cacheAccessor.js';
import NodeCache from 'node-cache';

export class CachedItunesClient implements ItunesClientInterface {
  private readonly trackCache: CacheAccessor<ItunesTrack>;
  private readonly searchCache: CacheAccessor<ItunesTrack | null>;

  constructor(
    private readonly client: ItunesClientInterface,
    cache: NodeCache,
  ) {
    this.trackCache = new CacheAccessor(cache, 'itunes:track');
    this.searchCache = new CacheAccessor(cache, 'itunes:search');
  }

  public async getTrackDetails(uri: string): Promise<ItunesTrack> {
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

  public async searchTracks(query: string): Promise<ItunesTrack | null> {
    if (this.searchCache.has(query)) {
      return this.searchCache.get(query) ?? null;
    }

    const track = await this.client.searchTracks(query);
    this.searchCache.set(query, track);
    return track;
  }
}

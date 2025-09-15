import { DeezerClient, DeezerClientInterface, DeezerTrack } from './deezer.js';
import { CacheAccessor } from './cacheAccessor.js';
import NodeCache from 'node-cache';

export class CachedDeezerClient implements DeezerClientInterface {
  private readonly trackCache: CacheAccessor<DeezerTrack>;
  private readonly searchCache: CacheAccessor<DeezerTrack | null>;

  constructor(
    private readonly client: DeezerClientInterface,
    cache: NodeCache,
  ) {
    this.trackCache = new CacheAccessor(cache, 'deezer:track');
    this.searchCache = new CacheAccessor(cache, 'deezer:search');
  }

  public async getTrackDetails(uri: string): Promise<DeezerTrack> {
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

  public async searchTracks(query: string): Promise<DeezerTrack | null> {
    if (this.searchCache.has(query)) {
      return this.searchCache.get(query) ?? null;
    }

    const track = await this.client.searchTracks(query);
    this.searchCache.set(query, track);
    return track;
  }
}

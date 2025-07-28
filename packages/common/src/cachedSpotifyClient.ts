import { SpotifyClientInterface, SpotifyClient, SpotifyTrack } from './spotify.js';
import { CacheAccessor } from './cacheAccessor.js';
import NodeCache from 'node-cache';

export class CachedSpotifyClient implements SpotifyClientInterface {
  private readonly trackCache: CacheAccessor<SpotifyTrack>;
  private readonly searchCache: CacheAccessor<SpotifyTrack | null>;

  constructor(
    private readonly client: SpotifyClientInterface,
    cache: NodeCache,
  ) {
    this.trackCache = new CacheAccessor(cache, 'spotify:track');
    this.searchCache = new CacheAccessor(cache, 'spotify:search');
  }

  public async getTrackDetails(uri: string): Promise<SpotifyTrack> {
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

  public async searchTracks(query: string): Promise<SpotifyTrack | null> {
    if (this.searchCache.has(query)) {
      return this.searchCache.get(query) ?? null;
    }

    const track = await this.client.searchTracks(query);
    this.searchCache.set(query, track);
    return track;
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CachedSpotifyClient } from '../cachedClient.js';
import { SpotifyClientInterface, SpotifyClient, SpotifyTrack } from '../spotify.js';
import NodeCache from 'node-cache';

describe('CachedSpotifyClient', () => {
  let mockClient: SpotifyClientInterface;
  let mockCache: NodeCache;
  let cachedClient: CachedSpotifyClient;

  const mockTrack: SpotifyTrack = {
    id: 'track123',
    name: 'Test Track',
    artists: [{ name: 'Test Artist', external_urls: { spotify: 'https://spotify.com/artist' } }],
    album: { name: 'Test Album', external_urls: { spotify: 'https://spotify.com/album' } },
    external_urls: { spotify: 'https://spotify.com/track' },
  };

  beforeEach(() => {
    mockClient = {
      getTrackDetails: vi.fn(),
      searchTracks: vi.fn(),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
      del: vi.fn(),
    } as unknown as NodeCache;

    cachedClient = new CachedSpotifyClient(mockClient, mockCache);
  });

  describe('getTrackDetails', () => {
    it('returns cached track when available', async () => {
      vi.mocked(mockCache.get).mockReturnValue(mockTrack);
      vi.spyOn(SpotifyClient, 'parseTrackId').mockReturnValue('track123');

      const result = await cachedClient.getTrackDetails('spotify:track:track123');

      expect(result).toBe(mockTrack);
      expect(mockCache.get).toHaveBeenCalledWith('spotify:track:track123');
      expect(mockClient.getTrackDetails).not.toHaveBeenCalled();
    });

    it('fetches and caches track when not cached', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.getTrackDetails).mockResolvedValue(mockTrack);
      vi.spyOn(SpotifyClient, 'parseTrackId').mockReturnValue('track123');

      const result = await cachedClient.getTrackDetails('spotify:track:track123');

      expect(result).toBe(mockTrack);
      expect(mockClient.getTrackDetails).toHaveBeenCalledWith('spotify:track:track123');
      expect(mockCache.set).toHaveBeenCalledWith('spotify:track:track123', mockTrack);
    });

    it('throws error and does not cache when API returns null', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.getTrackDetails).mockResolvedValue(null as unknown as SpotifyTrack);
      vi.spyOn(SpotifyClient, 'parseTrackId').mockReturnValue('track123');

      await expect(cachedClient.getTrackDetails('spotify:track:track123')).rejects.toThrow();

      expect(mockCache.set).not.toHaveBeenCalled();
    });
  });

  describe('searchTracks', () => {
    it('returns cached search result when available', async () => {
      vi.mocked(mockCache.has).mockReturnValue(true);
      vi.mocked(mockCache.get).mockReturnValue(mockTrack);

      const result = await cachedClient.searchTracks('test query');

      expect(result).toBe(mockTrack);
      expect(mockCache.get).toHaveBeenCalledWith('spotify:search:test query');
      expect(mockClient.searchTracks).not.toHaveBeenCalled();
    });

    it('fetches and caches search result when not cached', async () => {
      vi.mocked(mockCache.has).mockReturnValue(false);
      vi.mocked(mockClient.searchTracks).mockResolvedValue(mockTrack);

      const result = await cachedClient.searchTracks('test query');

      expect(result).toBe(mockTrack);
      expect(mockClient.searchTracks).toHaveBeenCalledWith('test query');
      expect(mockCache.set).toHaveBeenCalledWith('spotify:search:test query', mockTrack);
    });
  });
});

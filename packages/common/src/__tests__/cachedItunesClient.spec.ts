import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CachedItunesClient, CacheStorageValue, NULL_MARKER } from '../cachedClient.js';
import { ItunesClientInterface, ItunesTrack } from '../itunes.js';
import { LRUCache } from 'lru-cache';

describe('CachedItunesClient', () => {
  let mockClient: ItunesClientInterface;
  let mockCache: LRUCache<string, CacheStorageValue>;
  let cachedClient: CachedItunesClient;

  const mockTrack: ItunesTrack = {
    artistName: 'Test Artist',
    artistViewUrl: 'https://music.apple.com/artist/123',
    trackName: 'Test Track',
    trackViewUrl: 'https://music.apple.com/us/album/test-album/123?i=456',
    trackId: 456,
    collectionName: 'Test Album',
    collectionId: 123,
    collectionViewUrl: 'https://music.apple.com/us/album/test-album/123',
    artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music/test.jpg',
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
      delete: vi.fn(),
    } as unknown as LRUCache<string, CacheStorageValue>;

    cachedClient = new CachedItunesClient(mockClient, mockCache);
  });

  describe('getTrackDetails', () => {
    it('should return cached track if available', async () => {
      const uri = 'https://music.apple.com/us/album/test-album/123?i=456';
      vi.mocked(mockCache.get).mockReturnValue(mockTrack);

      const result = await cachedClient.getTrackDetails(uri);

      expect(result).toBe(mockTrack);
      expect(mockCache.get).toHaveBeenCalledWith('itunes:track:456');
      expect(mockClient.getTrackDetails).not.toHaveBeenCalled();
    });

    it('should throw error when cached negative result is found', async () => {
      const uri = 'https://music.apple.com/us/album/test-album/123?i=456';
      vi.mocked(mockCache.get).mockReturnValue(NULL_MARKER);

      await expect(cachedClient.getTrackDetails(uri)).rejects.toThrow();

      expect(mockCache.get).toHaveBeenCalledWith('itunes:track:456');
      expect(mockClient.getTrackDetails).not.toHaveBeenCalled();
    });

    it('should fetch and cache track if not in cache', async () => {
      const uri = 'https://music.apple.com/us/album/test-album/123?i=456';
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.getTrackDetails).mockResolvedValue(mockTrack);

      const result = await cachedClient.getTrackDetails(uri);

      expect(result).toBe(mockTrack);
      expect(mockClient.getTrackDetails).toHaveBeenCalledWith(uri);
      expect(mockCache.set).toHaveBeenCalledWith('itunes:track:456', mockTrack);
    });

    it('should cache negative result when API returns null', async () => {
      const uri = 'https://music.apple.com/us/album/test-album/123?i=456';
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.getTrackDetails).mockResolvedValue(null as unknown as ItunesTrack);

      await expect(cachedClient.getTrackDetails(uri)).rejects.toThrow();

      expect(mockCache.set).toHaveBeenCalledWith('itunes:track:456', NULL_MARKER);
    });

    it('should cache negative result when API throws error', async () => {
      const apiError = new Error('API Error');
      const uri = 'https://music.apple.com/us/album/test-album/123?i=456';
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.getTrackDetails).mockRejectedValue(apiError);

      await expect(cachedClient.getTrackDetails(uri)).rejects.toThrow();

      expect(mockCache.set).toHaveBeenCalledWith('itunes:track:456', NULL_MARKER);
    });

    it('should throw error for invalid URI', async () => {
      const uri = 'invalid-uri';

      await expect(cachedClient.getTrackDetails(uri)).rejects.toThrow();
    });
  });

  describe('searchTracks', () => {
    it('should return cached search result if available', async () => {
      const query = 'test query';
      vi.mocked(mockCache.get).mockReturnValue(mockTrack);

      const result = await cachedClient.searchTracks(query);

      expect(result).toBe(mockTrack);
      expect(mockCache.get).toHaveBeenCalledWith('itunes:search:test query');
      expect(mockClient.searchTracks).not.toHaveBeenCalled();
    });

    it('should return cached null result if available', async () => {
      const query = 'test query';
      vi.mocked(mockCache.get).mockReturnValue(NULL_MARKER);

      const result = await cachedClient.searchTracks(query);

      expect(result).toBe(null);
      expect(mockCache.get).toHaveBeenCalledWith('itunes:search:test query');
      expect(mockClient.searchTracks).not.toHaveBeenCalled();
    });

    it('should fetch and cache search result if not in cache', async () => {
      const query = 'test query';
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.searchTracks).mockResolvedValue(mockTrack);

      const result = await cachedClient.searchTracks(query);

      expect(result).toBe(mockTrack);
      expect(mockClient.searchTracks).toHaveBeenCalledWith(query);
      expect(mockCache.set).toHaveBeenCalledWith('itunes:search:test query', mockTrack);
    });

    it('should fetch and cache null result if not in cache', async () => {
      const query = 'test query';
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.searchTracks).mockResolvedValue(null);

      const result = await cachedClient.searchTracks(query);

      expect(result).toBe(null);
      expect(mockClient.searchTracks).toHaveBeenCalledWith(query);
      expect(mockCache.set).toHaveBeenCalledWith('itunes:search:test query', NULL_MARKER);
    });
  });
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CachedDeezerClient } from '../cachedClient.js';
import { DeezerClientInterface, DeezerTrack } from '../deezer.js';
import NodeCache from 'node-cache';

describe('CachedDeezerClient', () => {
  let mockClient: DeezerClientInterface;
  let cache: NodeCache;
  let cachedClient: CachedDeezerClient;

  const mockTrack: DeezerTrack = {
    id: 123456,
    title: 'Test Song',
    link: 'https://www.deezer.com/track/123456',
    artist: {
      name: 'Test Artist',
      link: 'https://www.deezer.com/artist/789',
    },
    album: {
      title: 'Test Album',
    },
  };

  beforeEach(() => {
    mockClient = {
      getTrackDetails: vi.fn(),
      searchTracks: vi.fn(),
    };
    cache = new NodeCache();
    cachedClient = new CachedDeezerClient(mockClient, cache);
  });

  describe('getTrackDetails', () => {
    it('should return cached track if available', async () => {
      const uri = 'https://www.deezer.com/track/123456';

      // First call - should cache the result
      vi.mocked(mockClient.getTrackDetails).mockResolvedValue(mockTrack);
      const result1 = await cachedClient.getTrackDetails(uri);

      // Second call - should return cached result
      const result2 = await cachedClient.getTrackDetails(uri);

      expect(result1).toEqual(mockTrack);
      expect(result2).toEqual(mockTrack);
      expect(mockClient.getTrackDetails).toHaveBeenCalledTimes(1);
    });

    it('should call client if not cached', async () => {
      const uri = 'https://www.deezer.com/track/123456';
      vi.mocked(mockClient.getTrackDetails).mockResolvedValue(mockTrack);

      const result = await cachedClient.getTrackDetails(uri);

      expect(result).toEqual(mockTrack);
      expect(mockClient.getTrackDetails).toHaveBeenCalledWith(uri);
    });

    it('should throw error for invalid URI', async () => {
      const uri = 'invalid-uri';

      await expect(cachedClient.getTrackDetails(uri)).rejects.toThrow('Invalid Deezer track URI format.');
      expect(mockClient.getTrackDetails).not.toHaveBeenCalled();
    });
  });

  describe('searchTracks', () => {
    it('should return cached search result if available', async () => {
      const query = 'test query';

      // First call - should cache the result
      vi.mocked(mockClient.searchTracks).mockResolvedValue(mockTrack);
      const result1 = await cachedClient.searchTracks(query);

      // Second call - should return cached result
      const result2 = await cachedClient.searchTracks(query);

      expect(result1).toEqual(mockTrack);
      expect(result2).toEqual(mockTrack);
      expect(mockClient.searchTracks).toHaveBeenCalledTimes(1);
    });

    it('should call client if not cached', async () => {
      const query = 'test query';
      vi.mocked(mockClient.searchTracks).mockResolvedValue(mockTrack);

      const result = await cachedClient.searchTracks(query);

      expect(result).toEqual(mockTrack);
      expect(mockClient.searchTracks).toHaveBeenCalledWith(query);
    });

    it('should cache null results', async () => {
      const query = 'no results query';
      vi.mocked(mockClient.searchTracks).mockResolvedValue(null);

      const result1 = await cachedClient.searchTracks(query);
      const result2 = await cachedClient.searchTracks(query);

      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(mockClient.searchTracks).toHaveBeenCalledTimes(1);
    });
  });
});

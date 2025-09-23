import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CachedYoutubeClient, CacheStorageValue, NULL_MARKER } from '../cachedClient.js';
import { YoutubeClientInterface, YoutubeClient, YoutubeVideoDetails, YoutubeSearchResultItem } from '../youtube.js';
import { Cache } from '../cache.js';

describe('CachedYoutubeClient', () => {
  let mockClient: YoutubeClientInterface;
  let mockCache: Cache<CacheStorageValue>;
  let cachedClient: CachedYoutubeClient;

  const mockVideo: YoutubeVideoDetails = {
    id: 'video123',
    snippet: {
      title: 'Test Video',
      channelTitle: 'Test Channel',
    },
  };

  const mockSearchResult: YoutubeSearchResultItem = {
    id: { videoId: 'video123' },
    snippet: { title: 'Test Video' },
  };

  beforeEach(() => {
    mockClient = {
      getVideoDetails: vi.fn(),
      searchVideos: vi.fn(),
    };

    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
    } as unknown as Cache<CacheStorageValue>;

    cachedClient = new CachedYoutubeClient(mockClient, mockCache);
  });

  describe('getVideoDetails', () => {
    it('returns cached video when available', async () => {
      vi.mocked(mockCache.get).mockReturnValue(mockVideo);
      vi.spyOn(YoutubeClient, 'parseId').mockReturnValue('video123');

      const result = await cachedClient.getVideoDetails('https://youtube.com/watch?v=video123');

      expect(result).toBe(mockVideo);
      expect(mockCache.get).toHaveBeenCalledWith('youtube:video:video123');
      expect(mockClient.getVideoDetails).not.toHaveBeenCalled();
    });

    it('throws error when cached negative result is found', async () => {
      vi.mocked(mockCache.get).mockReturnValue(NULL_MARKER);
      vi.spyOn(YoutubeClient, 'parseId').mockReturnValue('video123');

      await expect(cachedClient.getVideoDetails('https://youtube.com/watch?v=video123')).rejects.toThrow(
        'YouTube API returned invalid video data',
      );

      expect(mockCache.get).toHaveBeenCalledWith('youtube:video:video123');
      expect(mockClient.getVideoDetails).not.toHaveBeenCalled();
    });

    it('fetches and caches video when not cached', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.getVideoDetails).mockResolvedValue(mockVideo);
      vi.spyOn(YoutubeClient, 'parseId').mockReturnValue('video123');

      const result = await cachedClient.getVideoDetails('https://youtube.com/watch?v=video123');

      expect(result).toBe(mockVideo);
      expect(mockClient.getVideoDetails).toHaveBeenCalledWith('https://youtube.com/watch?v=video123');
      expect(mockCache.set).toHaveBeenCalledWith('youtube:video:video123', mockVideo);
    });

    it('caches negative result when API returns null', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.getVideoDetails).mockResolvedValue(null as unknown as YoutubeVideoDetails);
      vi.spyOn(YoutubeClient, 'parseId').mockReturnValue('video123');

      await expect(cachedClient.getVideoDetails('https://youtube.com/watch?v=video123')).rejects.toThrow(
        'YouTube API returned invalid video data',
      );

      expect(mockCache.set).toHaveBeenCalledWith('youtube:video:video123', NULL_MARKER);
    });

    it('caches negative result when API throws error', async () => {
      const apiError = new Error('API Error');
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.getVideoDetails).mockRejectedValue(apiError);
      vi.spyOn(YoutubeClient, 'parseId').mockReturnValue('video123');

      await expect(cachedClient.getVideoDetails('https://youtube.com/watch?v=video123')).rejects.toThrow();

      expect(mockCache.set).toHaveBeenCalledWith('youtube:video:video123', NULL_MARKER);
    });
  });

  describe('searchVideos', () => {
    it('returns cached search result when available', async () => {
      vi.mocked(mockCache.get).mockReturnValue(mockSearchResult);

      const result = await cachedClient.searchVideos('test query');

      expect(result).toBe(mockSearchResult);
      expect(mockCache.get).toHaveBeenCalledWith('youtube:search:test query');
      expect(mockClient.searchVideos).not.toHaveBeenCalled();
    });

    it('returns cached null result when available', async () => {
      vi.mocked(mockCache.get).mockReturnValue(NULL_MARKER);

      const result = await cachedClient.searchVideos('test query');

      expect(result).toBe(null);
      expect(mockCache.get).toHaveBeenCalledWith('youtube:search:test query');
      expect(mockClient.searchVideos).not.toHaveBeenCalled();
    });

    it('fetches and caches search result when not cached', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.searchVideos).mockResolvedValue(mockSearchResult);

      const result = await cachedClient.searchVideos('test query');

      expect(result).toBe(mockSearchResult);
      expect(mockClient.searchVideos).toHaveBeenCalledWith('test query');
      expect(mockCache.set).toHaveBeenCalledWith('youtube:search:test query', mockSearchResult);
    });

    it('fetches and caches null result when not cached', async () => {
      vi.mocked(mockCache.get).mockReturnValue(undefined);
      vi.mocked(mockClient.searchVideos).mockResolvedValue(null);

      const result = await cachedClient.searchVideos('test query');

      expect(result).toBe(null);
      expect(mockClient.searchVideos).toHaveBeenCalledWith('test query');
      expect(mockCache.set).toHaveBeenCalledWith('youtube:search:test query', NULL_MARKER);
    });
  });
});

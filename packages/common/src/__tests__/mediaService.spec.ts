import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MediaService } from '../mediaService.js';
import {
  SpotifyNormalizedTrack,
  DeezerNormalizedTrack,
  ItunesNormalizedTrack,
  YoutubeNormalizedTrack,
} from '../normalizedTrack.js';

// Mock concrete implementation of MediaService for testing abstract methods
class MockMediaService extends MediaService {
  getSpotifyTrackDetails = vi.fn<(uri: string) => Promise<SpotifyNormalizedTrack>>();
  searchSpotifyTracks = vi.fn<(query: string) => Promise<SpotifyNormalizedTrack | null>>();
  getYoutubeVideoDetails = vi.fn<(uri: string) => Promise<YoutubeNormalizedTrack>>();
  searchYoutubeVideos = vi.fn<(query: string) => Promise<YoutubeNormalizedTrack | null>>();
  getDeezerTrackDetails = vi.fn<(uri: string) => Promise<DeezerNormalizedTrack>>();
  searchDeezerTracks = vi.fn<(query: string) => Promise<DeezerNormalizedTrack | null>>();
  getItunesTrackDetails = vi.fn<(uri: string) => Promise<ItunesNormalizedTrack>>();
  searchItunesTracks = vi.fn<(query: string) => Promise<ItunesNormalizedTrack | null>>();
}

describe('MediaService', () => {
  let mediaService: MockMediaService;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mediaService = new MockMediaService();
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const mockSpotifyUri = 'https://open.spotify.com/track/4WNWx5Wk5cErsW2Hl7iK8L';
  const mockYoutubeUri = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const mockDeezerUri = 'https://www.deezer.com/track/123456789';
  const mockItunesUri = 'https://music.apple.com/us/album/test-album/1234567890?i=123456789';

  const mockSpotifyTrack: SpotifyNormalizedTrack = {
    platform: 'spotify',
    id: 'spotify-id-1',
    title: 'Spotify Song',
    artistName: 'Spotify Artist',
    sourceUrl: mockSpotifyUri,
    albumName: 'Spotify Album',
    uniqueId: 'sspotify-id-1',
  };

  const mockYoutubeTrack: YoutubeNormalizedTrack = {
    platform: 'youtube',
    id: 'youtube-id-1',
    title: 'Youtube Video',
    artistName: 'Youtube Creator',
    sourceUrl: mockYoutubeUri,
    uniqueId: 'yyoutube-id-1',
  };

  const mockDeezerTrack: DeezerNormalizedTrack = {
    platform: 'deezer',
    id: 'deezer-id-1',
    title: 'Deezer Song',
    artistName: 'Deezer Artist',
    sourceUrl: mockDeezerUri,
    albumName: 'Deezer Album',
    artistUrl: 'deezer-artist-url',
    uniqueId: 'ddeezer-id-1',
  };

  const mockItunesTrack: ItunesNormalizedTrack = {
    platform: 'itunes',
    id: 'itunes-id-1',
    title: 'iTunes Song',
    artistName: 'iTunes Artist',
    sourceUrl: mockItunesUri,
    artistUrl: 'itunes-artist-url',
    uniqueId: 'iitunes-id-1',
  };

  describe('getTrackDetails', () => {
    it('should return Spotify track details for a valid Spotify URI', async () => {
      mediaService.getSpotifyTrackDetails.mockResolvedValue(mockSpotifyTrack);
      const result = await mediaService.getTrackDetails(mockSpotifyUri);
      expect(result).toEqual(mockSpotifyTrack);
    });

    it('should return Youtube video details for a valid Youtube URI', async () => {
      mediaService.getYoutubeVideoDetails.mockResolvedValue(mockYoutubeTrack);
      const result = await mediaService.getTrackDetails(mockYoutubeUri);
      expect(result).toEqual(mockYoutubeTrack);
    });

    it('should return Deezer track details for a valid Deezer URI', async () => {
      mediaService.getDeezerTrackDetails.mockResolvedValue(mockDeezerTrack);
      const result = await mediaService.getTrackDetails(mockDeezerUri);
      expect(result).toEqual(mockDeezerTrack);
    });

    it('should return iTunes track details for a valid iTunes URI', async () => {
      mediaService.getItunesTrackDetails.mockResolvedValue(mockItunesTrack);
      const result = await mediaService.getTrackDetails(mockItunesUri);
      expect(result).toEqual(mockItunesTrack);
    });

    it('should throw an error for an unrecognized URI', async () => {
      const invalidUri = 'https://www.unknown.com/track/123';
      await expect(mediaService.getTrackDetails(invalidUri)).rejects.toThrow();
    });
  });

  describe('searchAllPlatforms', () => {
    const query = 'test song';

    it('should return an empty array if no platforms return results', async () => {
      mediaService.searchSpotifyTracks.mockResolvedValue(null);
      mediaService.searchYoutubeVideos.mockResolvedValue(null);
      mediaService.searchDeezerTracks.mockResolvedValue(null);
      mediaService.searchItunesTracks.mockResolvedValue(null);

      const results = await mediaService.searchAllPlatforms(query);
      expect(results).toEqual([]);
    });

    it('should aggregate results from all platforms that return data', async () => {
      mediaService.searchSpotifyTracks.mockResolvedValue(mockSpotifyTrack);
      mediaService.searchYoutubeVideos.mockResolvedValue(mockYoutubeTrack);
      mediaService.searchDeezerTracks.mockResolvedValue(null);
      mediaService.searchItunesTracks.mockRejectedValue(new Error('test error'));

      const results = await mediaService.searchAllPlatforms(query);

      expect(results).toHaveLength(2);
      expect(results).toContainEqual(mockSpotifyTrack);
      expect(results).toContainEqual(mockYoutubeTrack);
    });
  });
});

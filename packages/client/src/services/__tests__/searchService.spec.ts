import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SpotifyNormalizedTrack, YoutubeNormalizedTrack, SearchResponse, TrackIdentifierData } from '@muc/common';

const mockSearch = vi.fn();

vi.mock('@muc/common', async () => {
  const actual = await vi.importActual('@muc/common');
  return {
    ...actual,
    ApiClient: vi.fn().mockImplementation(() => ({
      search: mockSearch,
    })),
  };
});

// Import after mocking
const { SearchService } = await import('../searchService.js');
const { TrackIdentifier } = await import('@muc/common');

describe('SearchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should perform search and return deduplicated results', async () => {
    const mockSourceTrack: SpotifyNormalizedTrack = {
      uniqueId: 'spotify:track:123',
      platform: 'spotify',
      id: '123',
      title: 'Test Song',
      artistName: 'Test Artist',
      sourceUrl: 'https://spotify.com/track/123',
      albumName: 'Test Album',
    };

    const mockYoutubeTrack: YoutubeNormalizedTrack = {
      uniqueId: 'youtube:track:456',
      platform: 'youtube',
      id: '456',
      title: 'Test Song',
      artistName: 'Test Artist',
      sourceUrl: 'https://youtube.com/watch?v=456',
    };

    const mockSourceTrackData: TrackIdentifierData = {
      platform: 'spotify',
      platformId: '123',
      uniqueId: 's123',
    };

    const mockSearchResponse: SearchResponse = {
      sourceTrack: mockSourceTrackData,
      results: [mockSourceTrack, mockYoutubeTrack],
    };

    mockSearch.mockResolvedValue(mockSearchResponse);

    const result = await SearchService.performSearch('spotify:track:123');

    expect(mockSearch).toHaveBeenCalledWith('spotify:track:123');
    expect(result.results).toHaveLength(2);
    expect(result.sourceTrack).toBeInstanceOf(TrackIdentifier);
    expect(result.results.some(track => track.platform === 'spotify')).toBe(true);
    expect(result.results.some(track => track.platform === 'youtube')).toBe(true);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { SearchService } from '../searchService.js';
import { mediaService } from '../mediaService.js';
import { TrackIdentifier } from '@muc/common';
import type { SpotifyNormalizedTrack, YoutubeNormalizedTrack } from '@muc/common';

vi.mock('../mediaService.js');

describe('SearchService', () => {
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

    const mockSearchResults: YoutubeNormalizedTrack[] = [
      {
        uniqueId: 'youtube:track:456',
        platform: 'youtube',
        id: '456',
        title: 'Test Song',
        artistName: 'Test Artist',
        sourceUrl: 'https://youtube.com/watch?v=456',
      },
    ];

    vi.mocked(mediaService.getTrackDetails).mockResolvedValue(mockSourceTrack);
    vi.mocked(mediaService.searchOtherPlatforms).mockResolvedValue(mockSearchResults);

    const result = await SearchService.performSearch('spotify:track:123');

    expect(result.results).toHaveLength(2);
    expect(result.sourceTrack).toBeInstanceOf(TrackIdentifier);
    expect(result.results.some(track => track.platform === 'spotify')).toBe(true);
    expect(result.results.some(track => track.platform === 'youtube')).toBe(true);
  });
});

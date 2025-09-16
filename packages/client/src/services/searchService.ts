import { ApiClient, TrackIdentifier } from '@muc/common';
import type { AnyNormalizedTrack } from '@muc/common';

export interface SearchResult {
  results: AnyNormalizedTrack[];
  sourceTrack: TrackIdentifier;
}

const apiClient = new ApiClient('/api');

export class SearchService {
  static async performSearch(uri: string): Promise<SearchResult> {
    const searchResponse = await apiClient.search(uri);
    const trackIdentifier = TrackIdentifier.fromData(searchResponse.sourceTrack);

    const deduplicatedResults = this.deduplicateTracks(searchResponse.results, trackIdentifier.uniqueId);

    return {
      results: deduplicatedResults,
      sourceTrack: trackIdentifier,
    };
  }

  private static deduplicateTracks(tracks: AnyNormalizedTrack[], sourceTrackId: string): AnyNormalizedTrack[] {
    const trackMap = new Map<string, AnyNormalizedTrack>();

    for (const track of tracks) {
      const existing = trackMap.get(track.uniqueId);
      if (!existing) {
        trackMap.set(track.uniqueId, track);
      } else if (track.uniqueId === sourceTrackId && existing.uniqueId !== sourceTrackId) {
        trackMap.set(track.uniqueId, track);
      }
    }

    return Array.from(trackMap.values());
  }
}

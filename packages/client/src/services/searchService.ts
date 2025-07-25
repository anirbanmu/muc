import { mediaService } from './mediaService.js';
import { TrackIdentifier } from '@muc/common';
import type { AnyNormalizedTrack } from '@muc/common';

export interface SearchResult {
  results: AnyNormalizedTrack[];
  sourceTrack: TrackIdentifier;
}

export class SearchService {
  static async performSearch(uri: string): Promise<SearchResult> {
    const sourceTrack = await mediaService.getTrackDetails(uri);
    const trackIdentifier = TrackIdentifier.fromNormalizedTrack(sourceTrack);
    const searchResults = await mediaService.searchOtherPlatforms(sourceTrack);

    const deduplicatedResults = this.deduplicateTracks([sourceTrack, ...searchResults], trackIdentifier.uniqueId);

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

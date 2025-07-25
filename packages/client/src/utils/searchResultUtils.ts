import type { AnyNormalizedTrack } from '@muc/common';

const PLATFORM_ORDER: AnyNormalizedTrack['platform'][] = ['spotify', 'youtube', 'deezer', 'itunes'];

export function sortSearchResults(tracks: AnyNormalizedTrack[], sourceTrackId: string): AnyNormalizedTrack[] {
  return tracks.sort((a, b) => {
    if (a.uniqueId === sourceTrackId && b.uniqueId !== sourceTrackId) return -1;
    if (a.uniqueId !== sourceTrackId && b.uniqueId === sourceTrackId) return 1;

    return PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform);
  });
}

export function addResultIds<T extends AnyNormalizedTrack>(tracks: T[]): (T & { resultId: number })[] {
  return tracks.map((track, index) => ({ ...track, resultId: index }));
}

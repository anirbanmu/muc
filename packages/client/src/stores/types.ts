import type { AnyNormalizedTrack } from '@muc/common';
import type { TrackIdentifier } from '@muc/common';

export interface SearchHistoryItem {
  id: string;
  uri: string;
  sourceTrack: TrackIdentifier;
  results: (AnyNormalizedTrack & { resultId: number })[];
  timestamp: number;
}

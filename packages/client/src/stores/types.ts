import type { AnyNormalizedTrack } from '@muc/common';

export interface SearchHistoryItem {
  id: string;
  uri: string;
  results: (AnyNormalizedTrack & { resultId: number })[];
  timestamp?: number;
}

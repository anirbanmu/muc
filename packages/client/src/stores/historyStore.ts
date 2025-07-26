import { defineStore } from 'pinia';
import { TrackIdentifier } from '@muc/common';
import type { AnyNormalizedTrack } from '@muc/common';

const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  id: string;
  uri: string;
  sourceTrack: TrackIdentifier;
  results: (AnyNormalizedTrack & { resultId: number })[];
  timestamp: number;
}

interface HistoryState {
  items: SearchHistoryItem[];
}

interface StorageHistoryItem {
  id: string;
  uri: string;
  sourceTrackUniqueId: string;
  results: SearchHistoryItem['results'];
  timestamp: number;
}

function toStorageFormat(item: SearchHistoryItem): StorageHistoryItem {
  return {
    id: item.id,
    uri: item.uri,
    sourceTrackUniqueId: item.sourceTrack.uniqueId,
    results: item.results,
    timestamp: item.timestamp,
  };
}

function fromStorageFormat(storageItem: StorageHistoryItem): SearchHistoryItem {
  return {
    id: storageItem.id,
    uri: storageItem.uri,
    sourceTrack: TrackIdentifier.fromUniqueId(storageItem.sourceTrackUniqueId),
    results: storageItem.results,
    timestamp: storageItem.timestamp,
  };
}

function isValidStorageHistoryItem(item: unknown): item is StorageHistoryItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    typeof item.id === 'string' &&
    'uri' in item &&
    typeof item.uri === 'string' &&
    'sourceTrackUniqueId' in item &&
    typeof item.sourceTrackUniqueId === 'string' &&
    TrackIdentifier.isValidUniqueId(item.sourceTrackUniqueId) &&
    'timestamp' in item &&
    typeof item.timestamp === 'number' &&
    'results' in item &&
    Array.isArray(item.results) &&
    item.results.every(
      result =>
        typeof result === 'object' &&
        result !== null &&
        'sourceUrl' in result &&
        typeof result.sourceUrl === 'string' &&
        'platform' in result &&
        typeof result.platform === 'string' &&
        'resultId' in result &&
        typeof result.resultId === 'number',
    )
  );
}

export const useHistoryStore = defineStore('history', {
  state: (): HistoryState => ({
    items: [],
  }),

  persist: {
    key: 'muc-search-history',
    serializer: {
      deserialize: (value: string): HistoryState => {
        try {
          const parsed = JSON.parse(value);
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'items' in parsed &&
            Array.isArray(parsed.items) &&
            parsed.items.every(isValidStorageHistoryItem)
          ) {
            const runtimeItems = parsed.items.map(fromStorageFormat);
            return { items: runtimeItems };
          }
          console.warn('Invalid stored history data, clearing localStorage and using default state');
          try {
            localStorage.removeItem('muc-search-history');
          } catch {
            // Silently ignore localStorage removal failures
          }
          return { items: [] };
        } catch (e) {
          console.warn('Failed to parse stored history data, clearing localStorage:', e);
          try {
            localStorage.removeItem('muc-search-history');
          } catch {
            // Silently ignore localStorage removal failures
          }
          return { items: [] };
        }
      },
      serialize: (state): string => {
        const storageState = {
          items: state.items.map(toStorageFormat),
        };
        return JSON.stringify(storageState);
      },
    },
  },

  actions: {
    addItem(item: SearchHistoryItem) {
      this.items.unshift(item);
      if (this.items.length > MAX_HISTORY_ITEMS) {
        this.items.pop();
      }
    },
  },
});

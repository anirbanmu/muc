import { defineStore } from 'pinia';
import type { SearchHistoryItem } from './types.js';

const MAX_HISTORY_ITEMS = 10;

interface HistoryState {
  items: SearchHistoryItem[];
}

function isValidHistoryItem(item: unknown): item is SearchHistoryItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    typeof item.id === 'string' &&
    'uri' in item &&
    typeof item.uri === 'string' &&
    'timestamp' in item &&
    typeof item.timestamp === 'number' &&
    'results' in item &&
    Array.isArray(item.results) &&
    item.results.every(
      (result) =>
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
  persistToStorage: {
    key: 'muc-search-history',
    validate: (data: unknown): data is HistoryState =>
      typeof data === 'object' &&
      data !== null &&
      'items' in data &&
      Array.isArray(data.items) &&
      data.items.every(isValidHistoryItem),
  },
  state: (): HistoryState => ({
    items: [],
  }),

  getters: {
    filteredHistory: (state) => {
      return (showAll: boolean, currentIds: string[]): SearchHistoryItem[] => {
        if (showAll) {
          return state.items;
        }
        return state.items.filter((item) => currentIds.includes(item.id));
      };
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

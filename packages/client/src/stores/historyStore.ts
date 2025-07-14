import { defineStore } from 'pinia';
import { ref, watch, type Ref } from 'vue';
import type { SearchHistoryItem } from './types.js';

const MUC_SEARCH_HISTORY_KEY = 'muc-search-history';
const MAX_HISTORY_ITEMS = 10;

export const useHistoryStore = defineStore('history', () => {
  const searchHistory: Ref<SearchHistoryItem[]> = ref(
    (() => {
      try {
        const rawHistory = localStorage.getItem(MUC_SEARCH_HISTORY_KEY);
        if (!rawHistory) return [];

        try {
          const history = JSON.parse(rawHistory);
          if (Array.isArray(history)) {
            return history.slice(0, MAX_HISTORY_ITEMS);
          }
          throw new Error('Stored history is not an array.');
        } catch {
          console.warn(
            'Failed to parse search history from localStorage. The data is corrupt; removing it.',
          );
          localStorage.removeItem(MUC_SEARCH_HISTORY_KEY);
          return [];
        }
      } catch {
        console.warn('localStorage is not available. Search history will not be persisted.');
        return [];
      }
    })(),
  );

  watch(
    searchHistory,
    (newHistory) => {
      try {
        localStorage.setItem(MUC_SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch {
        // Warning already logged on init, no need to spam the console.
      }
    },
    { deep: true },
  );

  function addHistoryItem(item: SearchHistoryItem) {
    searchHistory.value.unshift(item);
    if (searchHistory.value.length > MAX_HISTORY_ITEMS) {
      searchHistory.value.pop();
    }
  }

  return { searchHistory, addHistoryItem };
});

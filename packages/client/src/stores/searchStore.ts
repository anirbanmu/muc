import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { SearchService } from '../services/searchService.js';
import { sortSearchResults, addResultIds } from '../utils/searchResultUtils.js';
import type { AnyNormalizedTrack } from '@muc/common';
import { TrackIdentifier } from '@muc/common';
import type { SearchHistoryItem } from './types.js';
import { useHistoryStore } from './historyStore.js';
import { useSessionStore } from './sessionStore.js';

interface SearchState {
  uri: string;
  isLoading: boolean;
  error: string | null;
}

export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    uri: '',
    isLoading: false,
    error: null,
  }),

  actions: {
    async search(): Promise<string | undefined> {
      if (!this.uri.trim()) {
        return;
      }

      // Scroll to top immediately on search initiation for a responsive feel
      window.scrollTo({ top: 0, behavior: 'smooth' });

      this.isLoading = true;
      this.error = null;
      const originalUri = this.uri;

      try {
        const { results, sourceTrack } = await this.performSearch(originalUri);
        const newId = this.saveSearchResults(originalUri, results, sourceTrack);
        this.uri = '';
        return newId;
      } catch (e) {
        this.handleSearchError(e);
      } finally {
        this.isLoading = false;
      }
    },

    async performSearch(uri: string): Promise<{ results: AnyNormalizedTrack[]; sourceTrack: TrackIdentifier }> {
      const { results, sourceTrack } = await SearchService.performSearch(uri);
      const sortedResults = sortSearchResults(results, sourceTrack.uniqueId);
      return { results: sortedResults, sourceTrack };
    },

    saveSearchResults(uri: string, results: AnyNormalizedTrack[], sourceTrack: TrackIdentifier): string {
      const historyStore = useHistoryStore();
      const sessionStore = useSessionStore();

      const newId = uuidv4();
      const resultsWithIds = addResultIds(results);
      const newHistoryItem: SearchHistoryItem = {
        id: newId,
        uri,
        sourceTrack,
        results: resultsWithIds,
        timestamp: Date.now(),
      };

      historyStore.addItem(newHistoryItem);
      sessionStore.addToCurrentSession(newId);
      return newId;
    },

    handleSearchError(e: unknown) {
      if (e instanceof Error) {
        this.error = e.message;
      } else {
        this.error = 'An unknown error occurred.';
      }
    },

    $reset() {
      this.uri = '';
      this.isLoading = false;
      this.error = null;
    },
  },
});

import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { mediaService } from '../services/mediaService.js';
import type { AnyNormalizedTrack } from '@muc/common';
import type { SearchHistoryItem } from './types.js';
import { useHistoryStore } from './historyStore.js';
import { useSessionStore } from './sessionStore.js';

interface SearchState {
  uri: string;
  isLoading: boolean;
  error: string | null;
}

const platformOrder: AnyNormalizedTrack['platform'][] = ['spotify', 'youtube', 'deezer', 'itunes'];

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
        const results = await this.performSearch(originalUri);
        const newId = this.saveSearchResults(originalUri, results);
        this.uri = ''; // Clear input after successful search
        return newId;
      } catch (e) {
        this.handleSearchError(e);
      } finally {
        this.isLoading = false;
      }
    },

    async performSearch(uri: string): Promise<AnyNormalizedTrack[]> {
      // 1. Get details of the source track from the URI
      const sourceTrack = await mediaService.getTrackDetails(uri);

      // 2. Search on all other platforms
      const searchResults = await mediaService.searchOtherPlatforms(sourceTrack);

      // 3. Combine, de-duplicate, and sort results
      return this.processSearchResults([sourceTrack, ...searchResults]);
    },

    processSearchResults(tracks: AnyNormalizedTrack[]): AnyNormalizedTrack[] {
      // De-duplicate results
      const uniqueResults = tracks.reduce((acc: AnyNormalizedTrack[], current) => {
        if (!acc.some((item) => item.sourceUrl === current.sourceUrl)) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Sort by platform order
      return uniqueResults.sort(
        (a, b) => platformOrder.indexOf(a.platform) - platformOrder.indexOf(b.platform),
      );
    },

    saveSearchResults(uri: string, results: AnyNormalizedTrack[]): string {
      const historyStore = useHistoryStore();
      const sessionStore = useSessionStore();

      const newId = uuidv4();
      const newHistoryItem: SearchHistoryItem = {
        id: newId,
        uri,
        results: results.map((track, index) => ({ ...track, resultId: index })),
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

import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { mediaService } from '../services/mediaService.js';
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
      const sourceTrack = await mediaService.getTrackDetails(uri);
      const trackIdentifier = TrackIdentifier.fromNormalizedTrack(sourceTrack);

      const searchResults = await mediaService.searchOtherPlatforms(sourceTrack);

      const processedResults = this.processSearchResults([sourceTrack, ...searchResults], trackIdentifier.uniqueId);

      return { results: processedResults, sourceTrack: trackIdentifier };
    },

    processSearchResults(tracks: AnyNormalizedTrack[], sourceTrackId: string): AnyNormalizedTrack[] {
      const trackMap = new Map<string, AnyNormalizedTrack>();

      for (const track of tracks) {
        const existing = trackMap.get(track.uniqueId);
        if (!existing) {
          trackMap.set(track.uniqueId, track);
        } else if (track.uniqueId === sourceTrackId && existing.uniqueId !== sourceTrackId) {
          trackMap.set(track.uniqueId, track);
        }
      }

      const uniqueTracks = Array.from(trackMap.values());
      return this.sortResults(uniqueTracks, sourceTrackId);
    },

    sortResults(tracks: AnyNormalizedTrack[], sourceTrackId: string): AnyNormalizedTrack[] {
      return tracks.sort((a, b) => {
        if (a.uniqueId === sourceTrackId && b.uniqueId !== sourceTrackId) return -1;
        if (a.uniqueId !== sourceTrackId && b.uniqueId === sourceTrackId) return 1;

        return platformOrder.indexOf(a.platform) - platformOrder.indexOf(b.platform);
      });
    },

    saveSearchResults(uri: string, results: AnyNormalizedTrack[], sourceTrack: TrackIdentifier): string {
      const historyStore = useHistoryStore();
      const sessionStore = useSessionStore();

      const newId = uuidv4();
      const newHistoryItem: SearchHistoryItem = {
        id: newId,
        uri,
        sourceTrack,
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

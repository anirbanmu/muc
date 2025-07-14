import { defineStore } from 'pinia';
import { ref, type Ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { mediaService } from '../services/mediaService.js';
import type { AnyNormalizedTrack } from '@muc/common';
import type { SearchHistoryItem } from './types.js';
import { useHistoryStore } from './historyStore.js';
import { useUiStore } from './uiStore.js';

export const useSearchStore = defineStore('search', () => {
  const historyStore = useHistoryStore();
  const uiStore = useUiStore();

  const uri: Ref<string> = ref('');
  const isLoading: Ref<boolean> = ref(false);
  const error: Ref<string | null> = ref(null);

  async function search(): Promise<string | undefined> {
    if (!uri.value.trim()) {
      return;
    }

    // Scroll to top immediately on search initiation for a responsive feel.
    window.scrollTo({ top: 0, behavior: 'smooth' });

    isLoading.value = true;
    error.value = null;
    const originalUri = uri.value;

    try {
      // 1. Get details of the source track from the URI
      const sourceTrack = await mediaService.getTrackDetails(originalUri);

      // 2. Search on all other platforms
      const searchResults = await mediaService.searchOtherPlatforms(sourceTrack);

      // 3. Combine and de-duplicate results
      const allTracks = [sourceTrack, ...searchResults];

      const uniqueResults = allTracks.reduce((acc: AnyNormalizedTrack[], current) => {
        if (!acc.some((item) => item.sourceUrl === current.sourceUrl)) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Sort results by a predefined platform order for consistency.
      const platformOrder: AnyNormalizedTrack['platform'][] = [
        'spotify',
        'youtube',
        'deezer',
        'itunes',
      ];
      uniqueResults.sort(
        (a, b) => platformOrder.indexOf(a.platform) - platformOrder.indexOf(b.platform),
      );

      const newId = uuidv4();
      const newHistoryItem: SearchHistoryItem = {
        id: newId,
        uri: originalUri,
        results: uniqueResults.map((track, index) => ({ ...track, resultId: index })),
        timestamp: Date.now(),
      };

      historyStore.addHistoryItem(newHistoryItem);
      uiStore.addSessionSearchId(newId);

      uri.value = ''; // Clear input after successful search
      return newId;
    } catch (e) {
      if (e instanceof Error) {
        error.value = e.message;
      } else {
        error.value = 'An unknown error occurred.';
      }
    } finally {
      isLoading.value = false;
    }
  }

  return {
    uri,
    isLoading,
    error,
    search,
  };
});

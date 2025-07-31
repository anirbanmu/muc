import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { SearchService } from '../services/searchService.js';
import { addResultIds } from '../utils/searchResultUtils.js';
import type { AnyNormalizedTrack } from '@muc/common';
import { TrackIdentifier } from '@muc/common';
import type { SearchHistoryItem } from '../stores/historyStore.js';
import { useHistoryStore } from '../stores/historyStore.js';
import { useSession } from './useSession.js';

const isLoading = ref(false);
const error = ref<string | null>(null);

export function useSearch() {
  async function search(uri: string): Promise<string | undefined> {
    if (!uri.trim()) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    isLoading.value = true;
    error.value = null;
    const originalUri = uri;
    try {
      const { results, sourceTrack } = await performSearch(originalUri);
      const newId = saveSearchResults(originalUri, results, sourceTrack);
      return newId;
    } catch (e) {
      handleSearchError(e);
    } finally {
      isLoading.value = false;
    }
  }

  async function performSearch(uri: string): Promise<{ results: AnyNormalizedTrack[]; sourceTrack: TrackIdentifier }> {
    const { results, sourceTrack } = await SearchService.performSearch(uri);
    return { results, sourceTrack };
  }

  function saveSearchResults(uri: string, results: AnyNormalizedTrack[], sourceTrack: TrackIdentifier): string {
    const historyStore = useHistoryStore();
    const session = useSession();
    const newId = uuidv4();
    const resultsWithIds = addResultIds(results);
    const newHistoryItem: SearchHistoryItem = {
      id: newId,
      uri,
      results: resultsWithIds,
      sourceTrack,
      timestamp: Date.now(),
    };
    historyStore.addItem(newHistoryItem);
    session.addToCurrentSession(newId);
    return newId;
  }

  function handleSearchError(e: unknown) {
    // Log the actual error for debugging purposes
    console.error('Search error:', e);

    // Show generic error message to users
    error.value = 'Unable to search for tracks. Please try again.';
  }

  return {
    isLoading,
    error,
    search,
    performSearch,
    saveSearchResults,
    handleSearchError,
  };
}

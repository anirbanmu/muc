import { ref } from 'vue';
import { SearchService } from '../services/searchService.js';
import { addResultIds } from '../utils/searchResultUtils.js';
import type { AnyNormalizedTrack } from '@muc/common';
import { TrackIdentifier, MediaService } from '@muc/common';
import type { SearchHistoryItem } from '../stores/historyStore.js';
import { useHistoryStore } from '../stores/historyStore.js';
import { useSession } from './useSession.js';
import { debounce } from '../utils/debounce.js';
import type { SearchResult } from '../services/searchService.js';

interface PrefetchState {
  uri: string;
  promise: Promise<SearchResult>;
}

const isLoading = ref(false);
const error = ref<string | null>(null);

export function useSearch() {
  let prefetchState: PrefetchState | null = null;
  const debouncedPrefetch = debounce(async (uri: string) => {
    const trimmedUri = uri.trim();
    if (MediaService.classifyUri(trimmedUri)) {
      try {
        const promise = SearchService.performSearch(trimmedUri);
        prefetchState = { uri: trimmedUri, promise };
        await promise;
      } catch {
        prefetchState = null;
      }
    }
  }, 50);

  function startPrefetch(uri: string): void {
    debouncedPrefetch(uri);
  }

  async function search(uri: string): Promise<string | undefined> {
    if (!uri.trim()) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    isLoading.value = true;
    error.value = null;
    const originalUri = uri.trim();

    try {
      let searchResult: SearchResult;

      if (prefetchState?.uri === originalUri) {
        try {
          searchResult = await prefetchState.promise;
        } catch {
          searchResult = await performSearch(originalUri);
        }
      } else {
        searchResult = await performSearch(originalUri);
      }

      const newId = saveSearchResults(originalUri, searchResult.results, searchResult.sourceTrack);
      return newId;
    } catch (e) {
      handleSearchError(e);
    } finally {
      isLoading.value = false;
      prefetchState = null;
    }
  }

  async function performSearch(uri: string): Promise<SearchResult> {
    return await SearchService.performSearch(uri);
  }

  function saveSearchResults(uri: string, results: AnyNormalizedTrack[], sourceTrack: TrackIdentifier): string {
    const historyStore = useHistoryStore();
    const session = useSession();
    const newId = crypto.randomUUID();
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
    console.error('Search error:', e);
    error.value = 'Unable to search for tracks. Please try again.';
  }

  return {
    isLoading,
    error,
    search,
    startPrefetch,
    performSearch,
    saveSearchResults,
    handleSearchError,
  };
}

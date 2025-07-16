import { defineStore } from 'pinia';
import { ref, computed, type Ref } from 'vue';
import { useHistoryStore } from './historyStore.js';

export const useUiStore = defineStore('ui', () => {
  const historyStore = useHistoryStore();

  const isShareLink = new URLSearchParams(window.location.search).has('q');
  const showHistory: Ref<boolean> = ref(!isShareLink);
  const sessionSearchIds: Ref<string[]> = ref([]);

  function toggleHistory() {
    showHistory.value = !showHistory.value;
  }

  function hideHistory() {
    showHistory.value = false;
  }

  function addSessionSearchId(id: string) {
    sessionSearchIds.value.push(id);
  }

  const visibleHistory = computed(() => {
    if (showHistory.value) {
      return historyStore.searchHistory;
    }
    return historyStore.searchHistory.filter((item) => sessionSearchIds.value.includes(item.id));
  });

  return {
    showHistory,
    visibleHistory,
    toggleHistory,
    addSessionSearchId,
    hideHistory,
  };
});

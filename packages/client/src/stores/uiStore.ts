import { defineStore } from 'pinia';
import { ref, computed, type Ref } from 'vue';
import { useHistoryStore } from './historyStore.js';

export const useUiStore = defineStore('ui', () => {
  const historyStore = useHistoryStore();

  const showHistory: Ref<boolean> = ref(true);
  const sessionSearchIds: Ref<string[]> = ref([]);
  const sharedSearchId: Ref<string | null> = ref(null);

  function toggleHistory() {
    showHistory.value = !showHistory.value;
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
    sharedSearchId,
    visibleHistory,
    toggleHistory,
    addSessionSearchId,
  };
});

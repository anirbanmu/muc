import { ref } from 'vue';

// Shared state (singleton)
const showOnlyCurrentSession = ref(new URLSearchParams(window.location.search).has('q'));
const currentSearchIds = ref<string[]>([]);

export function useSession() {
  function toggleSessionFilter() {
    showOnlyCurrentSession.value = !showOnlyCurrentSession.value;
  }

  function addToCurrentSession(id: string) {
    currentSearchIds.value.push(id);
  }

  return {
    showOnlyCurrentSession,
    currentSearchIds,
    toggleSessionFilter,
    addToCurrentSession,
  };
}

import { defineStore } from 'pinia';

interface SessionState {
  showOnlyCurrentSession: boolean;
  currentSearchIds: string[];
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    showOnlyCurrentSession: new URLSearchParams(window.location.search).has('q'),
    currentSearchIds: [],
  }),

  actions: {
    toggleSessionFilter() {
      this.showOnlyCurrentSession = !this.showOnlyCurrentSession;
    },

    addToCurrentSession(id: string) {
      this.currentSearchIds.push(id);
    },
  },
});

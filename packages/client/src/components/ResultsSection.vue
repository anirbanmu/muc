<script setup lang="ts">
import { useSearchStore } from '../stores/searchStore.js';
import { useSessionStore } from '../stores/sessionStore.js';
import { useHistoryStore } from '../stores/historyStore.js';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import HistoryItem from './HistoryItem.vue';

const searchStore = useSearchStore();
const sessionStore = useSessionStore();
const historyStore = useHistoryStore();

const { isLoading, error } = storeToRefs(searchStore);
const { showOnlyCurrentSession, currentSearchIds } = storeToRefs(sessionStore);

const visibleHistory = computed(() =>
  historyStore.filteredHistory(!showOnlyCurrentSession.value, currentSearchIds.value),
);
</script>

<template>
  <section class="results-section">
    <div class="results-wrapper">
      <div class="status-wrapper" :class="{ open: isLoading || error }">
        <div class="status-content">
          <Transition name="status-fade" mode="out-in">
            <div v-if="isLoading" key="loading">
              <span class="prompt">&gt;</span>
              Searching...
            </div>
            <div v-else-if="error" key="error" class="error-message">
              <span class="prompt error-prompt">&gt;</span>
              Error: {{ error }}
            </div>
          </Transition>
        </div>
      </div>

      <TransitionGroup name="list" tag="div">
        <HistoryItem v-for="search in visibleHistory" :key="search.id" :search="search" />
      </TransitionGroup>
    </div>
  </section>
</template>

<style scoped>
.results-section {
  --animation-duration: 0.4s;
  --animation-timing: ease-in-out;

  padding-bottom: var(--section-gap);
  overflow-anchor: none; /* Prevents jumping when new content loads above */
}

.results-wrapper {
  display: flex;
  flex-direction: column;
}

.status-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: var(--transition-all);
  margin-bottom: 0;
}

.status-wrapper.open {
  grid-template-rows: 1fr;
  margin-bottom: var(--section-gap);
}

.status-content {
  overflow: hidden;
}

.error-message,
.error-prompt {
  color: var(--color-error);
}

/* Transitions */
.status-fade-enter-active,
.status-fade-leave-active {
  transition: var(--transition-opacity);
}

.status-fade-enter-from,
.status-fade-leave-to {
  opacity: 0;
}

.list-move {
  transition: transform var(--animation-duration) var(--animation-timing);
}

.list-leave-active {
  display: none;
}

.list-enter-active {
  transition: var(--transition-all);
}

.list-enter-from {
  grid-template-rows: 0fr;
  opacity: 0;
}

.prompt {
  color: var(--color-prompt);
  font-weight: bold;
}
</style>

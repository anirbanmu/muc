<script setup lang="ts">
import { ref, computed } from 'vue';
import { Base64 } from 'js-base64';
import type { SearchHistoryItem } from '../stores/types.js';
import ResultItem from './ResultItem.vue';

const props = defineProps<{
  search: SearchHistoryItem;
  isShared: boolean;
}>();

const copiedShareLink = ref<string | null>(null);

const formattedTimestamp = computed(() => {
  if (!props.search.timestamp) {
    return null;
  }
  const now = new Date();
  const past = new Date(props.search.timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
});

async function copyShareLink(searchItem: SearchHistoryItem) {
  const encodedUri = Base64.encodeURI(searchItem.uri);
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set('q', encodedUri);

  try {
    await navigator.clipboard.writeText(url.toString());
    copiedShareLink.value = searchItem.id;
    setTimeout(() => {
      if (copiedShareLink.value === searchItem.id) {
        copiedShareLink.value = null;
      }
    }, 2000); // Reset feedback after 2 seconds
  } catch (err) {
    console.error('Failed to copy share link:', err);
  }
}
</script>

<template>
  <div class="history-item">
    <div class="history-item-content" :class="{ 'shared-item': isShared }">
      <div class="history-prompt">
        <div class="prompt-uri-wrapper">
          <span class="prompt">guest@muc:~$&nbsp;</span>
          <span class="history-uri">{{ search.uri }}</span>
        </div>
        <div class="actions">
          <span v-if="formattedTimestamp" class="timestamp">{{ formattedTimestamp }}</span>
          <button
            @click="copyShareLink(search)"
            class="share-button"
            :class="{ copied: copiedShareLink === search.id }"
            title="Share this search"
          >
            <span v-if="copiedShareLink === search.id">Copied!</span>
            <span v-else>[Share]</span>
          </button>
        </div>
      </div>
      <ul class="results-list">
        <ResultItem v-for="track in search.results" :key="track.resultId" :track="track" />
      </ul>
    </div>
  </div>
</template>

<style scoped>
.history-item {
  display: grid;
  grid-template-rows: 1fr;
  margin-bottom: var(--section-gap);
}

.history-item-content {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 1rem;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.history-item-content.shared-item {
  border-color: var(--color-prompt);
  box-shadow: 0 0 10px -2px var(--color-prompt);
}

.history-prompt {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
}

.prompt-uri-wrapper {
  display: flex;
  align-items: center;
  /* Crucial for text-overflow to work in a flex child */
  min-width: 0;
}

.prompt {
  color: var(--color-prompt);
  font-weight: bold;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.timestamp {
  font-size: 0.8rem;
  opacity: 0.6;
  white-space: nowrap;
}

.share-button {
  background: none;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.9rem;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.share-button:hover:not(.copied) {
  color: var(--color-action);
  opacity: 1;
}

.share-button.copied {
  color: var(--color-prompt);
  opacity: 1;
}

.history-uri {
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.results-list {
  list-style: none;
  padding-left: 1.5rem;
}
</style>

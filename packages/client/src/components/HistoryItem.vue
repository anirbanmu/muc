<script setup lang="ts">
import { computed } from 'vue';
import type { SearchHistoryItem } from '../stores/historyStore.js';
import ResultItem from './ResultItem.vue';
import { useCopyFeedback } from '../composables/useCopyFeedback';
import { ShareLinkEncoder } from '../services/shareLinks.js';
import { sortSearchResults } from '../utils/searchResultUtils.js';

const props = defineProps<{
  search: SearchHistoryItem;
}>();

const sortedResults = computed(() =>
  sortSearchResults(props.search.results, props.search.sourceTrack.uniqueId).map((track, index) => ({
    ...track,
    resultId: index,
  })),
);

const { copy, isCopied } = useCopyFeedback();

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

const formattedTimestampMobile = computed(() => {
  if (!formattedTimestamp.value) {
    return null;
  }
  // Convert desktop format to mobile by removing "just " and " ago"
  return formattedTimestamp.value.replace(/^just /, '').replace(/ ago$/, '');
});

function copyShareLink(searchItem: SearchHistoryItem) {
  if (!navigator.clipboard) {
    console.error('Clipboard API not available. Cannot copy share URL.');
    return;
  }

  const shareUrl = ShareLinkEncoder.createShareUrl(searchItem.sourceTrack);
  copy(() => navigator.clipboard.writeText(shareUrl));
}
</script>

<template>
  <div class="history-item">
    <div class="history-item-content">
      <div class="history-prompt">
        <div class="prompt-uri-wrapper">
          <span class="prompt" />
          <span class="history-uri">{{ search.uri }}</span>
        </div>
        <div class="actions">
          <span v-if="formattedTimestamp" class="timestamp timestamp-desktop">{{ formattedTimestamp }}</span>
          <span v-if="formattedTimestampMobile" class="timestamp timestamp-mobile">{{ formattedTimestampMobile }}</span>
          <button
            class="copy-link-button"
            :class="{ copied: isCopied }"
            :disabled="isCopied"
            title="Share this search"
            @click="copyShareLink(search)"
          >
            <span v-if="isCopied" class="share-text">Copied!</span>
            <span v-else class="share-text">[Share]</span>
            <span v-if="isCopied" class="share-icon">✓</span>
            <span v-else class="share-icon">↗</span>
          </button>
        </div>
      </div>
      <ul class="results-list">
        <ResultItem v-for="track in sortedResults" :key="track.resultId" :track="track" />
      </ul>
    </div>
  </div>
</template>

<style scoped>
.history-item {
  margin-bottom: var(--section-gap);
}

.history-item-content {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--space-md);
  transition: var(--transition-colors);
}

.history-prompt {
  margin-bottom: var(--space-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.prompt-uri-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.prompt {
  color: var(--color-prompt);
  font-weight: bold;
  margin-right: var(--space-xs);
  white-space: nowrap;
  flex-shrink: 0;
}

.prompt::before {
  color: var(--color-prompt);
  font-weight: bold;
}

.history-uri {
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-shrink: 0;
}

.timestamp {
  font-size: calc(var(--font-size-sm) * 0.9);
  opacity: 0.6;
  white-space: nowrap;
}

.copy-link-button {
  background: none;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--font-size-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: var(--transition-all);
  opacity: 0.7;
}

.copy-link-button:hover:not(.copied) {
  color: var(--color-action);
  opacity: 1;
}

.copy-link-button.copied {
  color: var(--color-prompt);
  opacity: 1;
}

.results-list {
  list-style: none;
  padding-left: var(--space-lg);
}

/* Desktop: show text timestamps and share text */
.timestamp-mobile,
.share-icon {
  display: none;
}

.timestamp-desktop,
.share-text {
  display: inline;
}

/* Desktop: more space after prompt */
@media (min-width: 768px) {
  .prompt::before {
    content: 'guest@muc:~ > ';
  }

  .prompt {
    margin-right: var(--space-sm);
  }
}

/* Mobile: compact layout */
@media (max-width: 767px) {
  .prompt::before {
    content: '~ > ';
  }

  .history-prompt {
    gap: 4px;
  }

  .actions {
    gap: 4px;
  }

  .copy-link-button {
    padding: 4px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .timestamp {
    font-size: 12px;
  }

  .history-uri {
    font-size: calc(var(--font-size-sm) * 0.9);
  }

  .results-list {
    padding-left: var(--space-sm);
  }

  /* Mobile: show icons and mobile timestamp */
  .timestamp-desktop,
  .share-text {
    display: none;
  }

  .timestamp-mobile,
  .share-icon {
    display: inline;
  }
}
</style>

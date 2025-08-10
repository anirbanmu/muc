<script setup lang="ts">
import type { AnyNormalizedTrack } from '@muc/common';
import { useCopyFeedback } from '../composables/useCopyFeedback';
import PlatformBranding from './PlatformBranding.vue';

const props = defineProps<{
  track: AnyNormalizedTrack;
}>();

const { copy, isCopied } = useCopyFeedback();

function copyUrl(url: string) {
  if (!navigator.clipboard) {
    console.error('Clipboard API not available. Cannot copy URL.');
    return;
  }

  copy(() => navigator.clipboard.writeText(url));
}
</script>

<template>
  <li class="result-item">
    <a :href="track.sourceUrl" target="_blank" rel="noopener noreferrer" class="result-link">
      <span class="platform-column">
        <span class="link-arrow">&gt;</span>
        <PlatformBranding :platform="track.platform" />
      </span>
      <span class="track-details">
        {{ track.artistName }} - {{ track.title }}
        <span v-if="'albumName' in track && track.albumName" class="album-name"> ({{ track.albumName }}) </span>
      </span>
      <button
        class="copy-button"
        :class="{ copied: isCopied }"
        :disabled="isCopied"
        title="Copy URL"
        @click.prevent="copyUrl(track.sourceUrl)"
      >
        <span v-if="isCopied">Copied!</span>
        <span v-else>[Copy]</span>
      </button>
    </a>
  </li>
</template>

<style scoped>
.result-item {
  display: flex;
  align-items: center;
  border-radius: var(--border-radius-sm);
  padding: var(--space-xs) var(--space-sm);
  margin: 0.1rem calc(-1 * var(--space-sm));
  transition: var(--transition-all);
  border: 1px solid transparent;
}

.result-item:hover {
  background-color: var(--color-input-background);
  border-color: var(--color-border);
  transform: translateX(2px);
}

.result-link {
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--color-text);
  text-decoration: none;
  min-height: 2.2rem;
}

.result-item:hover .track-details {
  text-decoration: underline;
}

.copy-button {
  background: none;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--font-size-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  opacity: 0;
  transition: var(--transition-colors);
}

.result-item:hover .copy-button:not(.copied) {
  opacity: 1;
}

.copy-button:hover:not(.copied) {
  color: var(--color-action);
}

.copy-button.copied {
  opacity: 1;
  color: var(--color-prompt);
}

.platform-column {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  width: 160px;
}

.link-arrow {
  color: var(--color-prompt);
  font-weight: bold;
  opacity: 0;
  transition: var(--transition-opacity);
  padding-right: var(--space-sm);
}

.result-item:hover .link-arrow {
  opacity: 1;
}

.track-details {
  word-break: break-word;
  text-decoration: none;
  transition: var(--transition-base);
}

.album-name {
  opacity: 0.7;
}
</style>

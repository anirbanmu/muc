<script setup lang="ts">
import { ref } from 'vue';
import type { AnyNormalizedTrack } from '@muc/common';

defineProps<{
  track: AnyNormalizedTrack;
}>();

const copiedUrl = ref<string | null>(null);

async function copyUrl(url: string) {
  if (!navigator.clipboard) {
    // Fallback for older browsers or insecure contexts where clipboard is not available
    console.error('Clipboard API not available. Cannot copy URL.');
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    copiedUrl.value = url;
    setTimeout(() => {
      if (copiedUrl.value === url) {
        copiedUrl.value = null;
      }
    }, 2000); // Reset feedback after 2 seconds
  } catch (err) {
    console.error('Failed to copy URL to clipboard:', err);
  }
}
</script>

<template>
  <li class="result-item">
    <a :href="track.sourceUrl" target="_blank" rel="noopener noreferrer" class="result-link">
      <span class="platform-column">
        <span class="link-arrow">&gt;</span>
        <span class="platform" :class="track.platform">{{ track.platform }}</span>
      </span>
      <span class="track-details">
        {{ track.artistName }} - {{ track.title }}
        <span v-if="'albumName' in track && track.albumName" class="album-name">
          ({{ track.albumName }})
        </span>
      </span>
      <button
        @click.prevent="copyUrl(track.sourceUrl)"
        class="copy-button"
        :class="{ copied: copiedUrl === track.sourceUrl }"
        title="Copy URL"
      >
        <span v-if="copiedUrl === track.sourceUrl">Copied!</span>
        <span v-else>[Copy]</span>
      </button>
    </a>
  </li>
</template>

<style scoped>
.result-item {
  display: flex;
  align-items: center;
  border-radius: 2px;
  padding: 0.25rem 0.5rem;
  margin: 0.1rem -0.5rem; /* Offset padding to align with outer container */
  transition:
    background-color var(--transition-speed) var(--transition-timing),
    transform var(--transition-speed) var(--transition-timing);
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
  gap: 1rem;
  color: var(--color-text);
  text-decoration: none;
  /* Clicks should pass through to the link, not the wrapper
     so we make sure the link fills the available space */
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
  font-size: 0.9rem;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0; /* Hidden by default */
  transition:
    opacity 0.2s ease,
    color 0.2s ease;
}

.result-item:hover .copy-button:not(.copied) {
  opacity: 1; /* Fade in on hover, but not if it's in "copied" state */
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
  width: 95px; /* Fixed width to maintain alignment */
}

.link-arrow {
  color: var(--color-prompt);
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding-right: 0.5rem;
}

.result-item:hover .link-arrow {
  opacity: 1;
}

.platform {
  flex-grow: 1; /* Platform name takes remaining space in the column */
  text-align: right;
  font-weight: bold;
}

.platform.spotify {
  color: var(--color-platform-spotify);
}
.platform.youtube {
  color: var(--color-platform-youtube);
}
.platform.deezer {
  color: var(--color-platform-deezer);
}
.platform.itunes {
  color: var(--color-platform-itunes);
}

.track-details {
  word-break: break-word;
  text-decoration: none;
  transition: text-decoration 0.2s ease;
}

.album-name {
  opacity: 0.7;
}
</style>

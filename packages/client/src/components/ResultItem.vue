<script setup lang="ts">
import type { AnyNormalizedTrack } from '@muc/common';
import { useCopyFeedback } from '../composables/useCopyFeedback';
import PlatformBranding from './PlatformBranding.vue';

defineProps<{
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
        <span class="artist-name">{{ track.artistName }}</span>
        <span class="track-title">{{ track.title }}</span>
        <span v-if="'albumName' in track && track.albumName" class="album-name"> ({{ track.albumName }}) </span>
      </span>
      <button
        class="copy-button"
        :class="{ copied: isCopied }"
        :disabled="isCopied"
        title="Copy URL"
        @click.prevent="copyUrl(track.sourceUrl)"
      >
        <span v-if="isCopied" class="copy-text">Copied!</span>
        <span v-else class="copy-text">[Copy]</span>
        <span v-if="isCopied" class="copy-icon">✓</span>
        <span v-else class="copy-icon">⧉</span>
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
  min-width: 0; /* Critical for flex truncation */
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
  margin-left: var(--space-sm); /* Space between track text and button */
}

/* Desktop: show text, hide icons */
.copy-icon {
  display: none;
}

.copy-text {
  display: inline;
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
  flex: 1;
  min-width: 0; /* Critical for truncation */
  text-decoration: none;
  transition: var(--transition-base);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-name::after {
  content: ' - ';
}

.album-name {
  opacity: 0.7;
}

/* Mobile responsive styles */
@media (max-width: 1024px) {
  .copy-button:not(.copied) {
    opacity: 0.8;
  }

  .result-link {
    min-height: var(--touch-target-min);
    gap: 8px; /* Fixed small gap on mobile */
    min-width: 0; /* Critical for truncation */
  }

  .platform-column {
    width: 100px; /* Give more space for Apple Music logo */
    flex-shrink: 0;
  }

  .track-details {
    flex: 1;
    min-width: 0;
    line-height: 1.3;

    /* Condensed typography for better space usage */
    font-weight: 400;
    letter-spacing: -0.01em;
    font-size: clamp(0.85rem, 2.5vw, 0.95rem);

    /* Single line with ellipsis truncation */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Very narrow screens: track title only */
  @media (max-width: 379px) {
    .artist-name,
    .artist-name::after {
      display: none;
    }
  }

  /* Medium screens: artist + track with potential truncation */
  @media (min-width: 380px) and (max-width: 479px) {
    .track-details {
      font-size: 0.9rem;
    }
  }

  /* Wider screens: full size, both artist and track */
  @media (min-width: 480px) {
    .track-details {
      font-size: 0.95rem;
      letter-spacing: 0;
    }
  }

  .album-name {
    display: none;
  }

  .copy-button {
    min-height: var(--touch-target-min);
    flex-shrink: 0;
    width: 32px;
    padding: 0;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 4px;
  }

  /* Mobile: hide text, show icons */
  .copy-text {
    display: none;
  }

  .copy-icon {
    display: inline;
  }

  .link-arrow {
    display: none;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import SpotifyLogo from '@/assets/images/spotify-logo.svg';
import AppleMusicBadge from '@/assets/images/apple-music-badge.svg';

interface PlatformBrandingProps {
  platform: 'spotify' | 'youtube' | 'deezer' | 'itunes';
}

const props = defineProps<PlatformBrandingProps>();

const logoError = ref(false);

function onLogoError() {
  logoError.value = true;
}
</script>

<template>
  <div class="platform-branding">
    <!-- Spotify logo display with fallback -->
    <div v-if="props.platform === 'spotify'" class="spotify-logo">
      <img v-if="!logoError" :src="SpotifyLogo" alt="Spotify" class="spotify-logo-img" @error="onLogoError" />
      <span v-if="logoError" class="platform-text spotify"> spotify </span>
    </div>

    <!-- Apple Music badge display with fallback -->
    <div v-else-if="props.platform === 'itunes'" class="apple-music-badge">
      <img
        v-if="!logoError"
        :src="AppleMusicBadge"
        alt="Listen on Apple Music"
        class="apple-music-badge-img"
        @error="onLogoError"
      />
      <span v-if="logoError" class="platform-text itunes"> itunes </span>
    </div>

    <!-- Text display for other platforms -->
    <span v-else class="platform-text" :class="props.platform">
      {{ props.platform }}
    </span>
  </div>
</template>

<style scoped>
.platform-branding {
  flex-grow: 1;
  text-align: right;
  font-weight: bold;
}

.platform-text {
  &.spotify {
    color: var(--color-platform-spotify);
  }
  &.youtube {
    color: var(--color-platform-youtube);
  }
  &.deezer {
    color: var(--color-platform-deezer);
  }
  &.itunes {
    color: var(--color-platform-itunes);
  }
}

.spotify-logo {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

/* Spotify branding guidelines: logo should never be smaller than 70px in digital */
.spotify-logo-img {
  height: auto;
  width: 75px;
  min-width: 75px;
  object-fit: contain;
  margin-right: 4px;
  /* Slightly increased to balance with 30px Apple Music badge */
}

.apple-music-badge {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

/* Apple Music branding guidelines: minimum 30px height for digital use, maintain aspect ratio */
.apple-music-badge-img {
  height: 30px;
  min-height: 30px;
  width: auto;
  object-fit: contain;
  margin-right: 4px;
  /* Apple's minimum 30px for proper readability of "Listen on" text */
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import SpotifyLogo from '@/assets/images/spotify-logo.svg';
import AppleMusicBadge from '@/assets/images/apple-music-badge.svg';
import YouTubeLogo from '@/assets/images/yt_logo_fullcolor_white_digital.png';
import DeezerLogo from '@/assets/images/deezer-horizontal-mw-rgb.svg';

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

    <!-- YouTube logo display with fallback -->
    <div v-else-if="props.platform === 'youtube'" class="youtube-logo">
      <img v-if="!logoError" :src="YouTubeLogo" alt="YouTube" class="youtube-logo-img" @error="onLogoError" />
      <span v-if="logoError" class="platform-text youtube"> youtube </span>
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

    <!-- Deezer logo display with fallback -->
    <div v-else-if="props.platform === 'deezer'" class="deezer-logo">
      <img v-if="!logoError" :src="DeezerLogo" alt="Deezer" class="deezer-logo-img" @error="onLogoError" />
      <span v-if="logoError" class="platform-text deezer"> deezer </span>
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

/* Spotify branding guidelines: logo should never be smaller than 70px width in digital */
.spotify-logo-img {
  height: auto;
  width: 80px;
  min-width: 80px;
  object-fit: contain;
  margin-right: 4px;
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
}

/* Mobile: move Apple Music logo left */
@media (max-width: 767px) {
  .apple-music-badge-img {
    margin-left: -6px;
  }
}

/* YouTube branding guidelines: minimum 20px height for digital use, maintain aspect ratio */
.youtube-logo {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.youtube-logo-img {
  height: 32px;
  min-height: 20px;
  width: auto;
  object-fit: contain;
  margin-right: -3px;
  /* Negative margin to compensate for possible embedded padding in PNG file */
}

/* Deezer branding guidelines: maintain clear space and aspect ratio */
.deezer-logo {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
}

.deezer-logo-img {
  height: auto;
  width: 85px;
  min-width: 85px;
  object-fit: contain;
  margin-right: 6px;
}
</style>

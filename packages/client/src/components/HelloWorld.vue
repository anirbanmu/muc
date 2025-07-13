<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ApiClient, ClientMediaService } from '@muc/common';
import type { AnyNormalizedTrack } from '@muc/common';
defineProps<{
  msg: string;
}>();

const searchResult = ref<AnyNormalizedTrack | null>(null);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const apiClient = new ApiClient('/api');
    const mediaService = new ClientMediaService(apiClient);
    // Let's search for a track to demonstrate.
    const result = await mediaService.searchSpotifyTracks('Daft Punk - One More Time');
    searchResult.value = result;
  } catch (e: any) {
    console.error('Failed to fetch track details:', e);
    error.value = e.message || 'An unknown error occurred.';
  }
});
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      You’ve successfully created a project with
      <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>.
    </h3>
    <div v-if="error">
      <p style="color: red">Error loading media service data: {{ error }}</p>
    </div>
    <div v-else-if="searchResult">
      <h4>Media Service Demo (Spotify Search Result):</h4>
      <pre>{{ JSON.stringify(searchResult, null, 2) }}</pre>
    </div>
    <div v-else>
      <p>Loading media service data...</p>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>

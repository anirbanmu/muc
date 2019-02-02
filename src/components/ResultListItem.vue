<template>
  <SpotifyResultListItem v-if="result.type === 'spotify'" :info="data" />
  <YoutubeResultListItem v-else-if="result.type === 'youtube'" :info="data" />
  <DeezerResultListItem v-else-if="result.type === 'deezer'" :info="data" />
  <ItunesResultListItem v-else-if="result.type === 'itunes'" :info="data" />
</template>

<script>
import SpotifyResultListItem from './SpotifyResultListItem.vue';
import YoutubeResultListItem from './YoutubeResultListItem.vue';
import DeezerResultListItem from './DeezerResultListItem.vue';
import ItunesResultListItem from './ItunesResultListItem.vue';

export default {
  name: 'resultListItem',
  props: ['result'],
  components: {
    SpotifyResultListItem,
    YoutubeResultListItem,
    DeezerResultListItem,
    ItunesResultListItem
  },
  computed: {
    data() {
      return this.result.data;
    }
  }
};
</script>

<style lang="scss"></style>

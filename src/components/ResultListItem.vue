<template>
  <SpotifyResultListItem v-if="result.type === 'spotify'" :info="result.data"/>
  <YoutubeResultListItem v-else-if="result.type === 'youtube'" :info="result.data"/>
  <DeezerResultListItem v-else-if="result.type === 'deezer'" :info="result.data"/>
</template>

<script>
import SpotifyResultListItem from "./SpotifyResultListItem.vue";
import YoutubeResultListItem from "./YoutubeResultListItem.vue";
import DeezerResultListItem from "./DeezerResultListItem.vue";

export default {
  name: "resultListItem",
  props: ["result"],
  components: {
    SpotifyResultListItem,
    YoutubeResultListItem,
    DeezerResultListItem
  }
};
</script>

<style lang="scss">
</style>

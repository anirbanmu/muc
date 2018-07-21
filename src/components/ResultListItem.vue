<template>
  <SpotifyResultListItem v-if="result.type === 'spotify'" :info="result.data"/>
  <YoutubeResultListItem v-else-if="result.type === 'youtube'" :info="result.data"/>
</template>

<script>
import SpotifyResultListItem from "./SpotifyResultListItem.vue";
import YoutubeResultListItem from "./YoutubeResultListItem.vue";

export default {
  name: "resultListItem",
  props: ["result"],
  components: {
    SpotifyResultListItem,
    YoutubeResultListItem
  }
};
</script>

<style lang="scss">
</style>

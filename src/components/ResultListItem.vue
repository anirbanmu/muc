<template>
  <SpotifyResultListItem v-if="result.type === 'spotify'" v-bind:info="result.data"/>
  <YoutubeResultListItem v-else-if="result.type === 'youtube'" v-bind:info="result.data"/>
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

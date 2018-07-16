<template>
  <div>
    <SpotifyUriInfo v-if="uriData.type === 'spotify'" v-bind:info="uriData.data"/>
    <YoutubeQueryInfo v-if="uriData.type === 'youtube'" v-bind:info="uriData.data"/>
  </div>
</template>

<script>
import SpotifyUriInfo from "./SpotifyUriInfo.vue";
import YoutubeQueryInfo from "./YoutubeQueryInfo.vue";

export default {
  name: "uriInfo",
  props: ["uriData"],
  components: {
    SpotifyUriInfo,
    YoutubeQueryInfo
  }
};
</script>

<style lang="scss">
</style>

<template>
  <SpotifyUriInfo v-if="queryData.type === 'spotify'" :info="queryData.data"/>
  <YoutubeQueryInfo v-else-if="queryData.type === 'youtube'" :info="queryData.data"/>
</template>

<script>
import SpotifyUriInfo from "./SpotifyUriInfo.vue";
import YoutubeQueryInfo from "./YoutubeQueryInfo.vue";

export default {
  name: "uriInfo",
  props: ["queryData"],
  components: {
    SpotifyUriInfo,
    YoutubeQueryInfo
  }
};
</script>

<style lang="scss">
</style>

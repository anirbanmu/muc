<template>
  <SpotifyUriInfo v-if="queryData.type === 'spotify'" :info="data"/>
  <YoutubeQueryInfo v-else-if="queryData.type === 'youtube'" :info="data"/>
  <DeezerQueryInfo v-else-if="queryData.type === 'deezer'" :info="data"/>
  <ItunesQueryInfo v-else-if="queryData.type === 'itunes'" :info="data"/>
</template>

<script>
import SpotifyUriInfo from "./SpotifyUriInfo.vue";
import YoutubeQueryInfo from "./YoutubeQueryInfo.vue";
import DeezerQueryInfo from "./DeezerQueryInfo.vue";
import ItunesQueryInfo from "./ItunesQueryInfo.vue";

export default {
  name: "uriInfo",
  props: ["queryData"],
  components: {
    SpotifyUriInfo,
    YoutubeQueryInfo,
    DeezerQueryInfo,
    ItunesQueryInfo
  },
  computed: {
    data() {
      return this.queryData.data;
    }
  }
};
</script>

<style lang="scss">
</style>

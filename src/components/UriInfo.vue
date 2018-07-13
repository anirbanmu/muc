<template>
  <SpotifyUriInfo v-if="uriData.type === 'spotify'" v-bind:info="uriData.data"/>
</template>

<script>
import SpotifyUriInfo from "./SpotifyUriInfo.vue";
export default {
  name: "uriInfo",
  props: ["uriData"],
  components: {
    SpotifyUriInfo
  }
};
</script>

<style lang="scss">
</style>

<template>
  <div>
    <header class="card-header">
      <div class="card-header-title">
        <a :href="artist.external_urls.spotify" target="_blank">{{
          artist.name
        }}</a>
        <span class="preserve-whitespace"> - </span>
        <a :href="track.external_urls.spotify" target="_blank">{{
          track.name
        }}</a>
      </div>
      <a
        class="card-header-icon"
        :href="track.external_urls.spotify"
        target="_blank"
      >
        <b-icon pack="fab" icon="spotify" />
      </a>
    </header>
  </div>
</template>

<script>
export default {
  name: "spotifyUriInfo",
  props: ["info"],
  computed: {
    artist() {
      return this.info.artists[0];
    },
    track() {
      return this.info;
    }
  }
};
</script>

<style scoped lang="scss">
.preserve-whitespace {
  white-space: pre;
}
</style>

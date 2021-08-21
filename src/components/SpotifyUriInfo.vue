<template>
  <div class="card-header-title">
    <a :href="artist.external_urls.spotify" target="_blank">{{
      artist.name
    }}</a>
    <span class="preserve-whitespace whitesmoke"> - </span>
    <a :href="track.external_urls.spotify" target="_blank">{{ track.name }}</a>
    <span class="preserve-whitespace whitesmoke"> (</span>
    <a :href="album.external_urls.spotify" target="_blank">{{ album.name }}</a>
    <span class="preserve-whitespace whitesmoke space-after">)</span>
    <a :href="track.uri" target="_blank">
      <font-awesome-icon :icon="['fab', 'spotify']" size="1x" />
    </a>
  </div>
</template>

<script>
export default {
  name: 'spotifyUriInfo',
  props: ['info'],
  computed: {
    artist() {
      return this.info.artists[0];
    },
    track() {
      return this.info;
    },
    album() {
      return this.info.album;
    }
  }
};
</script>

<style scoped lang="scss"></style>

<template>
  <div class="card-header-title">
    <a :href="artist.external_urls.spotify" target="_blank">{{
      artist.name
    }}</a>
    <span class="preserve-whitespace whitesmoke"> - </span>
    <a
      :href="track.external_urls.spotify"
      target="_blank"
      class="space-after"
      >{{ track.name }}</a
    >
    <SourceTag :link="track.external_urls.spotify" text="Spotify" />
  </div>
</template>

<script>
import SourceTag from './SourceTag.vue';

export default {
  name: 'spotifyUriInfo',
  components: { SourceTag },
  props: ['info'],
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

<style scoped lang="scss"></style>

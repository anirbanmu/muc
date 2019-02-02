<template>
  <div class="card-header-title">
    <a :href="artist.link" target="_blank">{{ artist.name }}</a>
    <span class="preserve-whitespace whitesmoke"> - </span>
    <a :href="track.link" target="_blank" class="space-after">{{
      track.title
    }}</a>
    <SourceTag :link="track.link" text="Deezer" />
  </div>
</template>

<script>
import SourceTag from './SourceTag.vue';

export default {
  name: 'deezerQueryInfo',
  components: { SourceTag },
  props: ['info'],
  computed: {
    artist() {
      return this.info.artist;
    },
    track() {
      return this.info;
    }
  }
};
</script>

<style scoped lang="scss"></style>

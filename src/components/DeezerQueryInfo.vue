<template>
  <div>
    <header class="card-header">
      <div class="card-header-title">
        <a :href="artist.link" target="_blank">{{ artist.name }}</a>
        <span class="preserve-whitespace"> - </span>
        <a :href="track.link" target="_blank">{{ track.title }}</a>
      </div>
      <a class="card-header-icon" :href="track.link" target="_blank">
        <span>Deezer</span>
      </a>
    </header>
  </div>
</template>

<script>
export default {
  name: "deezerQueryInfo",
  props: ["info"],
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

<style scoped lang="scss">
.preserve-whitespace {
  white-space: pre;
}
</style>

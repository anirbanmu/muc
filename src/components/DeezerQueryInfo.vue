<template>
  <div class="card-header-title">
    <a :href="artist.link" target="_blank">{{ artist.name }}</a>
    <span class="preserve-whitespace whitesmoke"> - </span>
    <a :href="track.link" target="_blank">{{ track.title }}</a>
    <span class="preserve-whitespace whitesmoke is-invisible">e</span>
    <div class="link-container">
      <a :href="track.link" target="_blank">
        <span class="tag is-dark is-invisible">
          <a :href="track.link" target="_blank">Deezer</a>
        </span>
        <div class="logo-container">
          <img src="../assets/Deezer_Logo_RVB_White.svg" />
        </div>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'deezerQueryInfo',
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

<style scoped lang="scss">
.link-container {
  position: relative;
  left: 0;
  top: 0;
}
.logo-container {
  position: absolute;
  left: 0;
  top: 0;
  width: 80%;
}
</style>

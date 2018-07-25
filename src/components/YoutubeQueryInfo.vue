<template>
  <div>
    <header class="card-header">
      <div class="card-header-title">
        <a :href="videoLink" target="_blank">{{ snippet.title }}</a>
      </div>
      <a class="card-header-icon" :href="videoLink" target="_blank">
        <b-icon pack="fab" icon="youtube"/>
      </a>
    </header>
  </div>
</template>

<script>
export default {
  name: "youtubeQueryInfo",
  props: ["info"],
  computed: {
    snippet() {
      return this.info.snippet;
    },
    videoLink() {
      return `https://www.youtube.com/watch?v=${this.info.id}`;
    }
  }
};
</script>

<style lang="scss">
</style>

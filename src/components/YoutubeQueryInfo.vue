<template>
  <div>
    <header class="card-header">
      <div class="card-header-title">
        <a :href="videoLink()">{{ snippet().title }}</a>
      </div>
      <a class="card-header-icon" :href="videoLink()">
        <b-icon pack="fab" icon="youtube"/>
      </a>
    </header>
  </div>
</template>

<script>
export default {
  name: "youtubeQueryInfo",
  props: ["info"],
  methods: {
    snippet() {
      return this.info.snippet;
    },
    videoLink() {
      return `http://www.youtube.com/watch?v=${this.info.id}`;
    }
  }
};
</script>

<style lang="scss">
</style>

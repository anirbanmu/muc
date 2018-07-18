<template>
  <div class="level-item has-text-centered">
    <a :href="link()">
      <i class="fab fa-youtube fa-5x"/>
    </a>
  </div>
</template>

<script>
export default {
  name: "youtubeResultListItem",
  props: ["info"],
  methods: {
    link() {
      return `https://www.youtube.com/watch?v=${this.info.id.videoId}`;
    }
  }
};
</script>

<style lang="scss">
</style>

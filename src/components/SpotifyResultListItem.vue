<template>
  <div class="level-item has-text-centered">
    <a :href="info.external_urls.spotify">
      <i class="fab fa-spotify fa-5x"/>
    </a>
  </div>
</template>

<script>
export default {
  name: "spotifyResultListItem",
  props: ["info"]
};
</script>

<style scoped lang="scss">
</style>

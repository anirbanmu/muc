<template>
  <div class="level-item has-text-centered">
    <div>
      <div>
        <a :href="link" target="_blank"> <i class="fab fa-spotify fa-5x" /> </a>
      </div>

      <ResultListItemButtonBar :link="link" />
    </div>
  </div>
</template>

<script>
import ResultListItemButtonBar from './ResultListItemButtonBar.vue';

export default {
  name: 'spotifyResultListItem',
  components: {
    ResultListItemButtonBar
  },
  props: ['info'],
  computed: {
    link() {
      return this.info.external_urls.spotify;
    }
  }
};
</script>

<style scoped lang="scss"></style>

<template>
  <div class="card-header-title">
    <a :href="videoLink" target="_blank" class="space-after">{{
      snippet.title
    }}</a>
    <SourceTag :link="videoLink" text="YouTube" />
  </div>
</template>

<script>
import SourceTag from './SourceTag.vue';

export default {
  name: 'youtubeQueryInfo',
  components: { SourceTag },
  props: ['info'],
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

<style lang="scss"></style>

<template>
  <div class="level-item has-text-centered">
    <div>
      <div>
        <a :href="link" target="_blank">
          <font-awesome-icon :icon="['fab', 'youtube']" size="5x" />
        </a>
      </div>

      <ResultListItemButtonBar :link="link" />
    </div>
  </div>
</template>

<script>
import ResultListItemButtonBar from './ResultListItemButtonBar.vue';

export default {
  name: 'youtubeResultListItem',
  components: {
    ResultListItemButtonBar
  },
  props: ['info'],
  computed: {
    link() {
      return `https://www.youtube.com/watch?v=${
        this.info.id.videoId ? this.info.id.videoId : this.info.id
      }`;
    }
  }
};
</script>

<style lang="scss"></style>

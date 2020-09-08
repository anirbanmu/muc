<template>
  <div class="level-item has-text-centered">
    <div>
      <div>
        <a :href="link" target="_blank">
          <font-awesome-icon :icon="['fab', 'apple']" size="5x" />
        </a>
      </div>

      <ResultListItemButtonBar :link="link" />
    </div>
  </div>
</template>

<script>
import ResultListItemButtonBar from './ResultListItemButtonBar.vue';

export default {
  name: 'itunesResultListItem',
  components: {
    ResultListItemButtonBar
  },
  props: ['info'],
  computed: {
    link() {
      return this.info.trackViewUrl;
    }
  }
};
</script>

<style scoped lang="scss"></style>

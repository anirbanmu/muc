<template>
  <div class="level-item has-text-centered">
    <div>
      <div class="link-container">
        <a :href="link" target="_blank">
          <i class="fa fa-music fa-5x is-invisible" />
          <div class="logo-container">
            <img src="../assets/deezer-logo.svg" />
          </div>
        </a>
      </div>

      <ResultListItemButtonBar :link="link" />
    </div>
  </div>
</template>

<script>
import ResultListItemButtonBar from './ResultListItemButtonBar.vue';

export default {
  name: 'deezerResultListItem',
  components: {
    ResultListItemButtonBar
  },
  props: ['info'],
  computed: {
    link() {
      return this.info.link;
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
  height: 100%;
}
img {
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
</style>

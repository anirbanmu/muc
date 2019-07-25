<template>
  <div>
    <header class="card-header">
      <UriInfo :query-data="resultData.queryData" />
      <a class="card-header-icon" v-clipboard:copy="selfLink">
        <span class="icon"> <i class="far fa-copy fa-xs"></i> </span>
      </a>
    </header>
  </div>
</template>

<script>
import UriInfo from './UriInfo.vue';

export default {
  name: 'resultCardHeader',
  props: ['resultData'],
  components: {
    UriInfo
  },
  computed: {
    selfLink() {
      return `${window.location.protocol}//${window.location.host}/?queries[]=${
        this.resultData.originalQuery
      }`;
    }
  }
};
</script>

<style scoped lang="scss">
@import '../assets/scss/variables';

.card-header {
  color: darken($primary, 5%);
}
</style>

<template>
  <div>
    <header class="card-header">
      <UriInfo :query-data="data" />
      <a class="card-header-icon" v-clipboard:copy="selfLink">
        <span class="icon"> <i class="far fa-copy fa-xs"></i> </span>
      </a>
    </header>
  </div>
</template>

<script>
import UriInfo from "./UriInfo.vue";

export default {
  name: "resultCardHeader",
  props: ["resultData"],
  components: {
    UriInfo
  },
  computed: {
    data() {
      return this.resultData.queryData;
    },
    selfLink() {
      return `${window.location.protocol}//${window.location.host}/?queries[]=${
        this.data.originalUri
      }`;
    }
  }
};
</script>

<style scoped lang="scss">
@import "../assets/scss/variables";

.card-header {
  color: darken($primary, 5%);
}
</style>

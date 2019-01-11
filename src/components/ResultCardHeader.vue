<template>
  <span> <UriInfo :query-data="resultData.queryData" /> </span>
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
      return this.queryData.data;
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

<template>
  <div class="card rounded result-card">
    <UriInfo :query-data="resultData.queryData"/>
    <div class="card-content">
      <div class="level">
        <ResultListItem v-for="r in resultData.results" :key="r.id" :result="r"/>
      </div>
    </div>
  </div>
</template>

<script>
import UriInfo from "./UriInfo.vue";
import ResultListItem from "./ResultListItem.vue";

export default {
  name: "resultcard",
  props: ["resultData"],
  components: {
    UriInfo,
    ResultListItem
  }
};
</script>

<style lang="scss">
@import "../assets/scss/variables";

.result-card {
  background-color: $dark-grey-transclucent !important;
}
</style>

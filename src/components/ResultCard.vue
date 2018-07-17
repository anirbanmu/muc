<template>
  <div id="result-card" class="card">
    <template v-if="!resultData.error">
      <UriInfo v-bind:query-data="resultData.queryData"/>
      <ResultListItem v-for="r in resultData.results" v-bind:key="r.id" v-bind:result="r"/>
    </template>
    <template v-else>
      <p>Something went wrong :(</p>
    </template>
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
</style>

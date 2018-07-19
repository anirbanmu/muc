<template>
  <div class="card rounded-card">
    <UriInfo v-bind:query-data="resultData.queryData"/>
    <div class="card-content">
      <div class="level">
        <ResultListItem v-for="r in resultData.results" v-bind:key="r.id" v-bind:result="r"/>
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
.rounded-card {
  border-radius: 0.2em;
}
</style>

<template>
  <div id="result-card" class="container">
    <div class="section">
      <div class="card">
        <template v-if="!resultData.error">
          <UriInfo v-bind:uri-data="resultData.uriData"/>
        </template>
        <template v-else>
          <p>Something went wrong :(</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import UriInfo from "./UriInfo.vue";
export default {
  name: "resultcard",
  props: ["resultData"],
  components: {
    UriInfo
  }
};
</script>

<style lang="scss">
</style>

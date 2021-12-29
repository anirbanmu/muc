<template>
  <div class="card rounded result-card">
    <ResultCardHeader :result-data="resultData" />
    <div class="card-content">
      <div class="level">
        <ResultListItem
          v-for="r in resultData.results"
          :key="r.id"
          :result="r"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ResultCardHeader from './ResultCardHeader.vue';
import ResultListItem from './ResultListItem.vue';

export default {
  name: 'result-card',
  props: ['resultData'],
  components: {
    ResultCardHeader,
    ResultListItem
  }
};
</script>

<style lang="scss">
@import '../assets/scss/variables';

.result-card {
  background-color: $dark-grey-transclucent !important;
}
</style>

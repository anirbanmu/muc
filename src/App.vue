<template>
  <div id="app">
    <b-loading :is-full-page="true" :active.sync="isLoading" :can-cancel="false"/>
    <TopBar/>

    <div class="section">
      <div class="container">
        <b-field>
          <b-input placeholder="URL to convert..." type="search" icon="magnify" expanded v-model.trim="query" @keyup.enter.native="search"></b-input>
          <p class="control">
            <button class="button is-primary" @click="search">Convert</button>
          </p>
        </b-field>
      </div>
    </div>

    <div id="results-container" class="container">
      <ResultCard v-for="r in results" v-if="!r.isLoading" v-bind:key="r.id" v-bind:result-data="r"/>
    </div>

  </div>
</template>

<script>
import TopBar from "./components/TopBar.vue";
import ResultCard from "./components/ResultCard.vue";
import MucCore from "./lib/muc-core";
import monotonicId from "./lib/monotonic-numeric-id";

export default {
  name: "app",
  props: ["apiTokens"],
  data() {
    return {
      query: "",
      results: [],
      loadingCount: 0
    };
  },
  computed: {
    isLoading() {
      return this.loadingCount > 0;
    }
  },
  components: {
    TopBar,
    ResultCard
  },
  created() {
    this.api = new MucCore(this.apiTokens);
  },
  methods: {
    replaceResult(newResult) {
      const index = this.results.findIndex(r => r.id == newResult.id);
      this.results.splice(index, 1, newResult);
    },
    deleteResult(id) {
      const index = this.results.findIndex(r => r.id == id);
      this.results.splice(index, 1);
    },
    loadingStarted() {
      this.loadingCount = this.loadingCount + 1;
    },
    loadingComplete() {
      this.loadingCount = this.loadingCount - 1;
    },
    search() {
      const query = this.query;
      const baseResult = { id: monotonicId(), originalQuery: query };

      this.loadingStarted();
      this.results.unshift(Object.assign({ isLoading: true }, baseResult));
      // this.infoToast(`Loading data for ${query}...`);

      this.api
        .getUriData(query)
        .then(queryData => {
          this.api.getMatches(queryData).then(matches => {
            let results = matches.map(r => {
              return Object.assign({ id: monotonicId() }, r);
            });
            this.replaceResult(
              Object.assign(
                {
                  queryData: queryData,
                  results: results
                },
                baseResult
              )
            );
            this.loadingComplete();
          });
        })
        .catch(() => {
          this.deleteResult(baseResult.id);
          this.loadingComplete();
          this.dangerToast(`Something went wrong! Is ${query} correct?`);
        });
    },
    infoToast(msg) {
      this.$toast.open({
        duration: 2000,
        message: msg,
        type: "is-info",
        queue: false
      });
    },
    dangerToast(msg) {
      this.$toast.open({
        duration: 2000,
        message: msg,
        type: "is-danger",
        queue: false
      });
    }
  }
};
</script>

<style lang="scss">
#results-container {
  .card {
    margin-bottom: 1em;
  }
}
</style>

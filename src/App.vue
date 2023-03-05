<template>
  <div id="app">
    <b-loading
      :is-full-page="true"
      :active.sync="isLoading"
      :can-cancel="false"
    />

    <b-modal :active.sync="aboutModalActive" scroll="keep">
      <AboutModal />
    </b-modal>

    <TopBar
      :initial-query-value="initialQuery"
      @about="aboutModalActive = true"
      @search="search"
    />

    <div class="section">
      <div id="results-container" class="container">
        <ResultCard v-for="r in loadedResults" :key="r.id" :result-data="r" />
      </div>
    </div>
  </div>
</template>

<script>
const axios = require('axios');

import TopBar from './components/TopBar.vue';
import AboutModal from './components/AboutModal.vue';
import ResultCard from './components/ResultCard.vue';
import MucCore from './lib/muc-core.mjs';
import monotonicId from './lib/monotonic-numeric-id';

const refreshTokenInterval = 45 * 60 * 1000;

export default {
  name: 'app',
  props: ['apiTokens', 'queries'],
  data() {
    return {
      query: '',
      results: [],
      loadingCount: 0,
      aboutModalActive: false
    };
  },
  computed: {
    isLoading() {
      return this.loadingCount > 0;
    },
    initialQuery() {
      return this.queries.length > 0
        ? this.queries[this.queries.length - 1]
        : '';
    },
    loadedResults() {
      return this.results.filter((r) => !r.isLoading);
    }
  },
  components: {
    TopBar,
    AboutModal,
    ResultCard
  },
  created() {
    this.api = new MucCore(this.apiTokens);
    this.queries.forEach((q) => this.search(q.trim()));
    setTimeout(() => this.refreshTokens(), refreshTokenInterval);
  },
  methods: {
    replaceResult(newResult) {
      const index = this.results.findIndex((r) => r.id == newResult.id);
      this.results.splice(index, 1, newResult);
    },
    deleteResult(id) {
      const index = this.results.findIndex((r) => r.id == id);
      this.results.splice(index, 1);
    },
    loadingStarted() {
      this.loadingCount = this.loadingCount + 1;
    },
    loadingComplete() {
      this.loadingCount = this.loadingCount - 1;
    },
    search(query) {
      const baseResult = { id: monotonicId(), originalQuery: query };

      this.loadingStarted();
      this.results.unshift(Object.assign({ isLoading: true }, baseResult));

      this.api
        .getUriData(query)
        .then((queryData) => {
          this.api.getMatches(queryData).then((matches) => {
            let results = matches.map((r) => {
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
      this.$buefy.toast.open({
        duration: 2000,
        message: msg,
        type: 'is-info',
        queue: false
      });
    },
    dangerToast(msg) {
      this.$buefy.toast.open({
        duration: 2000,
        message: msg,
        type: 'is-danger',
        queue: false
      });
    },
    refreshTokens() {
      axios
        .get('/api/refresh-tokens')
        .then((r) => {
          this.api = new MucCore(r.data);
          setTimeout(() => this.refreshTokens(), refreshTokenInterval);
        })
        .catch(() => {});
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
.rounded {
  border-radius: 0.2em;
}
</style>

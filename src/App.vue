<template>
  <div id="app">
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

    <div class="container">
      <ResultCard v-for="r in results" v-bind:key="r.id" v-bind:result-data="r"/>
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
      results: []
    };
  },
  components: {
    TopBar,
    ResultCard
  },
  created() {
    this.api = new MucCore(this.apiTokens);
    console.log(this.api);
  },
  methods: {
    search() {
      const query = this.query;
      // this.infoToast(`Loading data for ${query}...`);

      this.api
        .getUriData(query)
        .then(queryData => {
          this.api.getMatches(queryData).then(matches => {
            let results = matches.map(r => {
              return Object.assign({ id: monotonicId() }, r);
            });
            this.results.unshift({
              id: monotonicId(),
              queryData: queryData,
              results: results
            });
          });
        })
        .catch(() => {
          this.dangerToast(`Something went wrong! Is ${query} correct?`);
        });
    },
    infoToast(msg) {
      this.$toast.open({
        duration: 2000,
        message: msg,
        type: 'is-info',
        queue: false
      });
    },
    dangerToast(msg) {
      this.$toast.open({
        duration: 2000,
        message: msg,
        type: 'is-danger',
        queue: false
      });
    }
  }
};
</script>

<style lang="scss">
#app1 {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

<template>
  <div id="app">
    <TopBar/>

    <div class="container">
      <div class="section">
        <b-field>
          <b-input placeholder="URL to convert..." type="search" icon="magnify" expanded v-model.trim="query" @keyup.enter.native="search"></b-input>
          <p class="control">
            <button class="button is-primary" @click="search">Convert</button>
          </p>
        </b-field>
      </div>
    </div>

    <ResultCard v-for="r in results" v-bind:key="r.id" v-bind:result-data="r"/>
  </div>
</template>

<script>
import TopBar from "./components/TopBar.vue";
import ResultCard from "./components/ResultCard.vue";
import MucCore from "./lib/muc-core";

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
      this.api
        .getUriData(this.query)
        .then(uriData => {
          this.results.unshift({ id: this.nextId(), uriData: uriData });
        })
        .catch(() => {
          this.results.unshift({ id: this.nextId(), error: true });
        });
    },
    nextId() {
      return this.results.length > 0 ? this.results[0].id + 1 : 0;
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

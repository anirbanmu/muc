<template>
  <div id="app">
    <section class="hero is-dark">
      <div class="hero-body has-text-centered">
        <div class="container">
          <h1 class="title">
            Muc
          </h1>
          <h2 class="subtitle">
            Music URL converter
          </h2>
        </div>
      </div>
    </section>

    <img src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import MucCore from './lib/muc-core';

export default {
  name: 'app',
  props: ['apiTokens'],
  components: {
    HelloWorld,
  },
  created() {
    this.api = new MucCore(this.apiTokens);
    console.log(this.api);
  },
};
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

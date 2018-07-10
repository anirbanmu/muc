import Vue from 'vue';
import Buefy from 'buefy';
import App from './App.vue';
import './assets/scss/app.scss';

Vue.use(Buefy);

Vue.config.productionTip = false;

const rootId = 'app';
const rootElement = document.getElementById(rootId);
const apiTokens = JSON.parse(rootElement.dataset.apiTokens);

new Vue({
  render: h => h(App, {
    props: { apiTokens },
  }),
}).$mount(`#${rootId}`);

import Vue from 'vue';
import Buefy from 'buefy';
import VueClipboard from 'vue-clipboard2';
import App from './App.vue';
import qs from 'qs';
import './assets/scss/app.scss';

Vue.use(Buefy);
Vue.use(VueClipboard);

Vue.config.productionTip = false;

const rootId = 'app';
const rootElement = document.getElementById(rootId);
const apiTokens = JSON.parse(rootElement.dataset.apiTokens);

const queriesValue = qs.parse(location.search.slice(1)).queries;
const queries = Array.isArray(queriesValue) ? queriesValue : [];

new Vue({
  render: h =>
    h(App, {
      props: { apiTokens, queries }
    })
}).$mount(`#${rootId}`);

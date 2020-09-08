import Vue from 'vue';
import App from './App.vue';
import qs from 'qs';
import './assets/scss/app.scss';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import {
  faGithub,
  faApple,
  faSpotify,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';

library.add(faCopy, faGithub, faApple, faSpotify, faYoutube);
Vue.component('font-awesome-icon', FontAwesomeIcon);

import Buefy from 'buefy';
Vue.use(Buefy);

import VueClipboard from 'vue-clipboard2';
Vue.use(VueClipboard);

Vue.config.productionTip = false;

const rootId = 'app';
const rootElement = document.getElementById(rootId);
const apiTokens = JSON.parse(rootElement.dataset.apiTokens);

const queriesValue = qs.parse(location.search.slice(1)).queries;
const queries = Array.isArray(queriesValue) ? queriesValue : [];

new Vue({
  render: (h) =>
    h(App, {
      props: { apiTokens, queries }
    })
}).$mount(`#${rootId}`);

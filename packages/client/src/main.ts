import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createPersistedState } from 'pinia-plugin-persistedstate';
import App from './App.vue';
import { useSearchStore } from './stores/searchStore.js';
import { ShareLinkEncoder } from './services/shareLinks.js';

const app = createApp(App);

const pinia = createPinia();
pinia.use(createPersistedState());
app.use(pinia);

app.mount('#app');

const searchStore = useSearchStore();
const params = new URLSearchParams(window.location.search);
const encodedParam = params.get('q');

if (encodedParam) {
  (async () => {
    try {
      const uri = ShareLinkEncoder.reconstructUriFromEncoded(encodedParam);
      searchStore.uri = uri;
      await searchStore.search();

      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.error('Failed to decode or process shared query:', e);
    }
  })();
}

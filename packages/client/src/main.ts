import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { useSearchStore } from './stores/searchStore.js';
import { useUiStore } from './stores/uiStore.js';
import { Base64 } from 'js-base64';

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);

app.mount('#app');

// After mounting, we can access the store and check for shared links.
const searchStore = useSearchStore();
const uiStore = useUiStore();
const params = new URLSearchParams(window.location.search);
const encodedUriParam = params.get('q');

if (encodedUriParam) {
  (async () => {
    try {
      const decodedUri = Base64.decode(encodedUriParam);
      // Always perform a new search for the shared link.
      searchStore.uri = decodedUri;
      const newId = await searchStore.search();
      if (newId) {
        uiStore.sharedSearchId = newId;
      }

      // Clean the URL to avoid re-triggering on refresh or confusing the user.
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
      console.error('Failed to decode or process shared query:', e);
    }
  })();
}

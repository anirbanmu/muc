<script setup lang="ts">
import { useUiStore } from './stores/uiStore.js';
import { storeToRefs } from 'pinia';
import { watch, ref, onMounted, onUnmounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import SearchForm from './components/SearchForm.vue';
import ResultsSection from './components/ResultsSection.vue';

const uiStore = useUiStore();
const { sharedSearchId } = storeToRefs(uiStore);

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

watch(sharedSearchId, (newId) => {
  if (newId !== null) {
    // Shared item will be highlighted. After a delay, remove the highlight
    // so it doesn't persist on the page forever.
    setTimeout(() => {
      // Check if the ID is still the same, in case another share link was clicked.
      if (uiStore.sharedSearchId === newId) {
        uiStore.sharedSearchId = null;
      }
    }, 4000); // Highlight for 4 seconds.
  }
});
</script>

<template>
  <div class="container">
    <div class="sticky-header" :class="{ 'is-scrolled': isScrolled }">
      <AppHeader />
      <SearchForm />
    </div>
    <main class="content">
      <ResultsSection />
    </main>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem; /* Handle horizontal padding */
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-background);
  padding-top: 2rem; /* Re-apply top space */
  padding-bottom: var(--section-gap); /* Space between search and results */
  border-bottom: 1px solid transparent;
  transition:
    background-color 0.3s ease,
    border-bottom-color 0.3s ease;
}

.sticky-header.is-scrolled {
  background-color: rgba(var(--color-background-rgb), 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px); /* For Safari */
  border-bottom-color: var(--color-border);
}
</style>

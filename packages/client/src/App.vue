<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import SearchForm from './components/SearchForm.vue';
import ResultsSection from './components/ResultsSection.vue';

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
  max-width: 1200px;
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

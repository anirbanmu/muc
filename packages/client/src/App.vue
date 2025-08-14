<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import AppHeader from './components/AppHeader.vue';
import SearchForm from './components/SearchForm.vue';
import ResultsSection from './components/ResultsSection.vue';
import AboutModal from './components/AboutModal.vue';

const isScrolled = ref(false);
const isAboutModalOpen = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

const openAboutModal = () => {
  isAboutModalOpen.value = true;
};

const closeAboutModal = () => {
  isAboutModalOpen.value = false;
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
      <AppHeader @open-about-modal="openAboutModal" />
      <SearchForm />
    </div>
    <main class="content">
      <ResultsSection />
    </main>
    <AboutModal :is-open="isAboutModalOpen" @close="closeAboutModal" />
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2rem);
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--color-background);
  padding-top: clamp(1rem, 4vw, 2rem);
  padding-bottom: var(--section-gap);
  border-bottom: 1px solid transparent;
  transition:
    background-color 0.3s ease,
    border-bottom-color 0.3s ease;
}

@media (max-width: 768px) {
  .sticky-header {
    position: static;
    padding-top: var(--space-lg);
    padding-bottom: var(--space-lg);
  }
}

.sticky-header.is-scrolled {
  background-color: rgba(var(--color-background-rgb), 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom-color: var(--color-border);
}
</style>

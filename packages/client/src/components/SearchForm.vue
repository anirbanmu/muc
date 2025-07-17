<script setup lang="ts">
import { useSearchStore } from '../stores/searchStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { storeToRefs } from 'pinia';

const searchStore = useSearchStore();
const uiStore = useUiStore();

const { uri, isLoading } = storeToRefs(searchStore);
const { showHistory } = storeToRefs(uiStore);
</script>

<template>
  <section class="search-section">
    <form class="search-form" @submit.prevent="searchStore.search">
      <div class="input-wrapper">
        <span class="prompt">guest@muc:~$&nbsp;</span>
        <input
          type="text"
          class="search-input"
          placeholder="Enter a music track URI..."
          v-model="uri"
          :disabled="isLoading"
        />
        <Transition name="fade">
          <button
            v-if="uri.trim().length > 0"
            type="submit"
            class="search-button"
            :disabled="isLoading"
            aria-label="Search"
          >
            [Search]
          </button>
        </Transition>
      </div>
      <div class="history-toggle" @click="uiStore.toggleHistory" title="Toggle History">
        <span class="toggle-label">history</span>
        <div class="toggle-switch" :class="{ on: showHistory }">
          <div class="toggle-button"></div>
        </div>
      </div>
    </form>
  </section>
</template>

<style scoped>
.search-form {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.input-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.prompt {
  color: var(--color-prompt);
  font-weight: bold;
}

.search-input {
  flex-grow: 1;
  background-color: transparent;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: inherit;
  padding: 0.5rem;
  transition: text-shadow var(--transition-speed) var(--transition-timing);
}

.search-input:focus {
  outline: none;
  text-shadow: var(--glow-text);
}

.search-input:disabled {
  opacity: 0.7;
}

.search-button {
  background: none;
  border: 1px solid var(--color-action);
  color: var(--color-action);
  font-family: inherit;
  font-size: 1rem;
  padding: 0.4rem 1rem;
  cursor: pointer;
  border-radius: 2px;
  margin-left: 0.5rem;
  transition:
    opacity var(--transition-speed) var(--transition-timing),
    color var(--transition-speed) var(--transition-timing),
    border-color var(--transition-speed) var(--transition-timing),
    box-shadow var(--transition-speed) var(--transition-timing);
}

.search-button:hover:not(:disabled) {
  opacity: 0.8;
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* New styles for history toggle */
.history-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.toggle-label {
  font-size: 0.9em;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.history-toggle:hover .toggle-label {
  opacity: 1;
}

.toggle-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background-color: var(--color-input-background);
  border-radius: 10px;
  transition: all var(--transition-speed) var(--transition-timing);
  border: 1px solid var(--color-border);
}

.toggle-switch.on {
  background-color: color-mix(in srgb, var(--color-prompt) 20%, transparent);
  border-color: var(--color-prompt);
  box-shadow: 0 0 10px rgba(255, 140, 26, 0.1);
}

.toggle-button {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background-color: var(--color-text);
  border-radius: 50%;
  transition: all var(--transition-speed) var(--transition-timing);
}

.toggle-switch.on .toggle-button {
  transform: translateX(16px);
  background-color: var(--color-prompt);
  box-shadow: 0 0 8px rgba(255, 140, 26, 0.4);
}
</style>

<script setup lang="ts">
import { useSearchStore } from '../stores/searchStore.js';
import { useSessionStore } from '../stores/sessionStore.js';
import { storeToRefs } from 'pinia';

const searchStore = useSearchStore();
const sessionStore = useSessionStore();

const { uri, isLoading } = storeToRefs(searchStore);
const { showOnlyCurrentSession } = storeToRefs(sessionStore);
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
      <div
        class="history-toggle"
        @click="sessionStore.toggleSessionFilter"
        title="Toggle between all history and current session"
      >
        <span class="toggle-label">all history</span>
        <div class="toggle-switch" :class="{ on: !showOnlyCurrentSession }">
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
  gap: var(--space-lg);
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
  padding: var(--space-sm);
  transition: var(--transition-all);
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
  font-size: var(--font-size-base);
  padding: var(--space-xs) var(--space-md);
  cursor: pointer;
  border-radius: var(--border-radius-sm);
  margin-left: var(--space-sm);
  transition: var(--transition-colors);
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
  transition: var(--transition-opacity);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* History toggle styles */
.history-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  user-select: none;
}

.toggle-label {
  font-size: var(--font-size-sm);
  opacity: 0.7;
  transition: var(--transition-opacity);
}

.history-toggle:hover .toggle-label {
  opacity: 1;
}

.toggle-switch {
  position: relative;
  width: 36px;
  height: 20px;
  background-color: var(--color-input-background);
  border-radius: var(--border-radius-lg);
  transition: var(--transition-all);
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
  transition: var(--transition-all);
}

.toggle-switch.on .toggle-button {
  transform: translateX(16px);
  background-color: var(--color-prompt);
  box-shadow: 0 0 8px rgba(255, 140, 26, 0.4);
}
</style>

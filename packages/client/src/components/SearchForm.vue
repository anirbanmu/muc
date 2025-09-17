<script setup lang="ts">
import { ref } from 'vue';
import { useSearch } from '../composables/useSearch.js';
import { useSession } from '../composables/useSession.js';

const search = useSearch();
const session = useSession();

const uri = ref('');
const { isLoading, startPrefetch } = search;
const { showOnlyCurrentSession } = session;

const handleSearch = async () => {
  const searchId = await search.search(uri.value);
  if (searchId) {
    uri.value = '';
  }
};

const handleInputChange = () => {
  startPrefetch(uri.value);
};
</script>

<template>
  <section class="search-section">
    <form class="search-form" @submit.prevent="handleSearch">
      <div class="input-wrapper">
        <span class="prompt" />
        <input
          v-model="uri"
          type="text"
          class="search-input"
          placeholder="Enter a music track URI..."
          :disabled="isLoading"
          @input="handleInputChange"
        />
        <button
          type="submit"
          class="search-button"
          :disabled="isLoading || uri.trim().length === 0"
          aria-label="Search"
        >
          →
        </button>
      </div>
      <div class="bottom-row">
        <div
          class="history-toggle"
          :title="showOnlyCurrentSession ? 'current session' : 'all history'"
          @click="session.toggleSessionFilter"
        >
          <span class="toggle-label">all history</span>
          <div class="toggle-switch" :class="{ on: !showOnlyCurrentSession }">
            <div class="toggle-button" />
          </div>
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

.bottom-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-sm);
}

.input-wrapper {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.prompt {
  color: var(--color-prompt);
  font-weight: bold;
  margin-right: var(--space-xs);
}

.prompt::before {
  color: var(--color-prompt);
  font-weight: bold;
}

.search-input {
  flex-grow: 1;
  background-color: transparent;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: 16px;
  padding: var(--space-sm);
  transition: var(--transition-all);
  min-height: var(--touch-target-min);
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
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition: var(--transition-all);
  min-height: var(--touch-target-min);
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-button:hover:not(:disabled) {
  opacity: 0.8;
}

.search-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--color-text);
  border-color: var(--color-border);
}

.fade-enter-active,
.fade-leave-active {
  transition: var(--transition-opacity);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.history-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  user-select: none;
  min-height: var(--touch-target-min);
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
  background-color: var(--color-prompt);
  box-shadow: 0 0 8px rgba(255, 140, 26, 0.4);
}

@media (min-width: 768px) {
  .prompt::before {
    content: 'guest@muc:~ > ';
  }

  .search-button {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--border-radius-sm);
    margin-left: var(--space-sm);
    min-width: var(--touch-target-min);
  }

  .toggle-switch.on .toggle-button {
    transform: translateX(16px);
  }
}

@media (max-width: 767px) {
  .search-form {
    gap: var(--space-sm);
  }

  .bottom-row {
    flex-direction: column;
    gap: 0;
    justify-content: center;
  }

  .input-wrapper {
    position: relative;
    padding-right: calc(var(--touch-target-min) + var(--space-md));
  }

  .prompt::before {
    content: '~ > ';
  }

  .search-button {
    padding: var(--space-sm);
    border-radius: 50%;
    width: var(--touch-target-min);
    height: var(--touch-target-min);
    margin-left: 0;
    position: absolute;
    right: var(--space-sm);
    top: 50%;
    transform: translateY(-50%);
  }

  .history-toggle {
    flex-direction: column;
    gap: 2px;
    min-height: auto;
  }

  .toggle-label {
    display: none;
  }

  .toggle-switch {
    width: 20px;
    height: 36px;
  }

  .toggle-switch.on .toggle-button {
    transform: translateY(16px);
  }
}
</style>

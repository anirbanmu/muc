<template>
  <header class="header">
    <h1>MUC<span class="cursor">_</span></h1>
    <div class="header-links">
      <a
        href="https://github.com/anirbanmu/muc"
        target="_blank"
        rel="noopener"
        class="github-link"
        title="View source on GitHub"
        >.git</a
      >
      <button type="button" class="about-link" @click="$emit('open-about-modal')">[About]</button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  'open-about-modal': [];
}>();
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-links {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.github-link {
  color: var(--color-text);
  text-decoration: none;
  font-family: inherit;
  font-size: var(--font-size-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-md);
  opacity: 0.3;
  transition: var(--transition-colors);
}

.github-link:hover {
  color: var(--color-action);
  opacity: 0.8;
}

.header h1 {
  --title-glow: 0 0 20px rgba(255, 140, 26, 0.4);
  font-size: calc(var(--font-size-lg) * 2);
  font-weight: bold;
  color: var(--color-prompt);
  margin: 0;
  text-shadow: var(--glow-prompt);
  transition: var(--transition-base);
}

.header h1:hover {
  text-shadow: var(--title-glow);
}

.about-link {
  background: none;
  border: none;
  color: var(--color-text);
  font-family: inherit;
  font-size: var(--font-size-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  opacity: 0.6;
  transition: var(--transition-colors);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.about-link:hover {
  color: var(--color-action);
  opacity: 1;
}

.about-link:focus {
  outline: none;
}

.about-link:focus-visible {
  outline: 1px solid var(--color-prompt);
  outline-offset: 2px;
}

.about-link:active {
  transform: none;
  background: none;
}

.cursor {
  animation: blink 1.2s step-end infinite;
  position: relative;
}

@keyframes blink {
  from,
  to {
    color: transparent;
    text-shadow: none;
  }
  50% {
    color: var(--color-prompt);
    text-shadow: var(--glow-prompt);
  }
}

/* Responsive behavior */
@media (max-width: 480px) {
  .header {
    flex-direction: column;
    gap: var(--space-sm);
    align-items: flex-start;
  }

  .header-links {
    align-self: flex-end;
  }

  .github-link,
  .about-link {
    font-size: var(--font-size-sm);
  }
}
</style>

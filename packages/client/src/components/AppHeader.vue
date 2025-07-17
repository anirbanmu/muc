<template>
  <header class="header">
    <h1>MUC<span class="cursor">_</span></h1>
  </header>
</template>

<style scoped>
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
</style>

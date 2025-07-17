<template>
  <header class="header">
    <h1>MUC<span class="cursor">_</span></h1>
  </header>
</template>

<style scoped>
.header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-prompt);
  margin-bottom: 0;
  text-shadow: var(--glow-prompt);
  transition: text-shadow var(--transition-speed) var(--transition-timing);
}

.header h1:hover {
  text-shadow: 0 0 20px rgba(255, 140, 26, 0.4);
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

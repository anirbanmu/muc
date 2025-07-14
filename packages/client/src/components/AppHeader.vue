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
  margin-bottom: 0; /* Remove margin as spacing is now handled by the parent */
}

.cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from,
  to {
    color: transparent;
  }
  50% {
    color: var(--color-prompt);
  }
}
</style>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-backdrop" @click="handleBackdropClick">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <button type="button" class="close-x-button" aria-label="Close modal" @click="$emit('close')">×</button>
          <h2>MUC<span class="cursor">_</span></h2>
          <p class="subtitle">Music URI converter</p>
        </div>

        <div class="modal-content">
          <section>
            <p>
              Cross-convert platform URIs between Spotify, YouTube, Deezer, and Apple Music℠. Simply paste a link from
              any supported platform to find the same track on other services.
            </p>
          </section>

          <section>
            <h3>Source</h3>
            <p>
              <a href="https://github.com/anirbanmu/muc" target="_blank" rel="noopener noreferrer">View on GitHub</a>
            </p>
          </section>

          <section>
            <h3>APIs Used</h3>
            <ul>
              <li>
                <a href="https://developer.spotify.com/documentation/web-api/" target="_blank" rel="noopener noreferrer"
                  >Spotify API</a
                >
              </li>
              <li>
                <a
                  href="https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  >iTunes Search API</a
                >
              </li>
              <li>
                <a href="https://developers.deezer.com/api" target="_blank" rel="noopener noreferrer">Deezer API</a>
              </li>
              <li>
                <a href="https://developers.google.com/youtube/v3/" target="_blank" rel="noopener noreferrer"
                  >YouTube Data API</a
                >
              </li>
            </ul>
          </section>

          <section>
            <h3>Privacy</h3>
            <p>
              MUC does not collect or log any personal information. The application only processes the links you enter
              through the mentioned APIs to find matching tracks across platforms.
            </p>
            <p>
              Due to the use of YouTube Data API, please also review the
              <a href="http://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer"
                >Google Privacy Policy</a
              >.
            </p>
          </section>

          <section>
            <h3>Notices</h3>
            <p>Apple® and Apple Music are trademarks of Apple Inc., registered in the U.S. and other countries</p>
            <p>
              This app is not endorsed by, directly affiliated with, maintained, authorized, or sponsored by Spotify,
              Deezer, or YouTube. All product and company names are the registered trademarks of their original owners.
            </p>
            <p>
              This product uses YouTube API Services. By using this application, you agree to be bound by the
              <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer"
                >YouTube Terms of Service</a
              >.
            </p>
          </section>
        </div>

        <div class="modal-footer">
          <button type="button" class="close-button" @click="$emit('close')">[Close]</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

interface Props {
  isOpen: boolean;
}

interface Emits {
  (e: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close');
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-lg);
}

.modal-container {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 0 30px rgba(255, 140, 26, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  position: relative;
  padding: var(--space-xl) var(--space-xl) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  text-align: center;
}

.modal-header h2 {
  font-size: calc(var(--font-size-lg) * 1.5);
  font-weight: bold;
  color: var(--color-prompt);
  margin: 0;
  text-shadow: var(--glow-prompt);
}

.cursor {
  animation: blink 1.2s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    color: transparent;
    text-shadow: none;
  }
  50% {
    color: var(--color-prompt);
    text-shadow: var(--glow-prompt);
  }
}

.subtitle {
  color: var(--color-text);
  margin-top: var(--space-sm);
  opacity: 0.8;
}

.close-x-button {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  background: none;
  border: none;
  color: var(--color-text);
  font-size: calc(var(--font-size-lg) * 1.2);
  width: 32px;
  height: 32px;
  cursor: pointer;
  opacity: 0.6;
  transition: var(--transition-colors);
}

.close-x-button:hover {
  color: var(--color-action);
  opacity: 1;
}

.modal-content {
  padding: var(--space-xl);
}

.modal-content section:not(:last-child) {
  margin-bottom: var(--space-xl);
}

.modal-content h3 {
  color: var(--color-prompt);
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-md);
  text-shadow: var(--glow-prompt);
}

.modal-content p:not(:last-child) {
  margin-bottom: var(--space-md);
}

.modal-content ul {
  padding-left: var(--space-lg);
}

.modal-content li:not(:last-child) {
  margin-bottom: var(--space-xs);
}

.modal-content a {
  color: var(--color-prompt);
  text-decoration: none;
  text-shadow: var(--glow-prompt);
  transition: var(--transition-colors);
}

.modal-content a:hover {
  color: var(--color-action);
  text-shadow: 0 0 15px rgba(255, 165, 0, 0.3);
}

.modal-footer {
  padding: var(--space-lg) var(--space-xl) var(--space-xl);
  border-top: 1px solid var(--color-border);
  text-align: center;
}

.close-button {
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
  appearance: none;
}

.close-button:hover {
  color: var(--color-action);
  opacity: 1;
}

.close-button:focus {
  outline: none;
}

.close-button:focus-visible {
  outline: 1px solid var(--color-prompt);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .modal-backdrop {
    padding: var(--space-md);
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header,
  .modal-content,
  .modal-footer {
    padding-inline: var(--space-lg);
  }

  .modal-header h2 {
    font-size: var(--font-size-lg);
  }
}
</style>

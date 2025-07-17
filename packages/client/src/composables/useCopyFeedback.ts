import { ref } from 'vue';

export function useCopyFeedback(duration = 2000) {
  const isCopied = ref(false);

  const copy = async (action: () => Promise<void>) => {
    try {
      await action();
      isCopied.value = true;
      setTimeout(() => {
        isCopied.value = false;
      }, duration);
    } catch (err) {
      console.error('Copy operation failed:', err);
    }
  };

  return {
    isCopied,
    copy,
  };
}

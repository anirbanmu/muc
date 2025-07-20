import type { PiniaPluginContext, StateTree } from 'pinia';

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    /**
     * Configuration for localStorage persistence
     */
    persistToStorage?: {
      /**
       * Key to use in localStorage
       */
      key: string;
      /**
       * Optional validation function to check if loaded data is valid
       */
      validate?: (data: unknown) => data is S;
      /**
       * Optional function to transform data before saving
       */
      serialize?: (state: S) => string;
      /**
       * Optional function to transform data after loading
       */
      deserialize?: (data: string) => S;
    };
  }
}

export function storagePlugin({ store, options }: PiniaPluginContext) {
  if (options.persistToStorage) {
    const {
      key,
      validate = () => true,
      serialize = (state: StateTree) => JSON.stringify(state),
      deserialize = JSON.parse,
    } = options.persistToStorage;

    // Restore initial state
    try {
      const rawData = localStorage.getItem(key);
      if (rawData !== null) {
        try {
          const parsed = deserialize(rawData);
          if (validate(parsed)) {
            store.$patch(parsed);
          } else {
            throw new Error('Invalid stored data');
          }
        } catch (e) {
          console.warn(
            `Failed to parse stored data for store "${store.$id}" from localStorage. The data may be corrupt.`,
            e
          );
          localStorage.removeItem(key);
        }
      }
    } catch {
      console.warn('localStorage is not available. State will not be persisted.');
    }

    // Set up persistence
    store.$subscribe((_, state) => {
      try {
        localStorage.setItem(key, serialize(state));
      } catch (e) {
        console.warn('Failed to persist state to localStorage:', e);
      }
    });
  }
}

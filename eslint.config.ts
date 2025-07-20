import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

// Base configuration for all packages
const config = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/*.d.ts'],
  },
];

export default config;
import rootConfig from '../../eslint.config.js';
import pluginVue from 'eslint-plugin-vue';
import pluginVitest from '@vitest/eslint-plugin';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Extends root config with Vue-specific rules
const config = [
  // Spread root configuration
  ...rootConfig,

  // Vue-specific configuration
  ...pluginVue.configs['flat/recommended'],

  // Configure Vue files with TypeScript parser
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    rules: {
      // Vue 3 script setup defineProps creates variables that are used in template
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^(props|emit)$',
        },
      ],
    },
  },

  // Vitest-specific rules for test files
  {
    files: ['src/**/__tests__/*'],
    ...pluginVitest.configs.recommended,
  },

  // Browser globals for client environment
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  // TypeScript-specific rules for non-Vue files
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Additional ignores for client-specific files
  {
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },
];

export default config;

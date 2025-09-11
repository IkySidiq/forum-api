import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: {
        ...globals.browser, // browser globals (window, document, dll.)
        ...globals.node,    // node globals (process, __dirname, dll.)
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], 
      'max-len': ['warn', { code: 150 }], // ✅ sekarang maksimal 150 char
      'quotes': ['error', 'single'], 
      'semi': ['error', 'always'],   
      'indent': ['error', 2],        
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]);

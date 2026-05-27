/// <reference types="vitest" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,

    environment: 'jsdom',

    setupFiles: ['src/test-setup.ts'],

    include: ['src/**/*.spec.ts'],

    coverage: {
      provider: 'v8',

      reporter: ['text', 'html'],

      reportsDirectory: './coverage',

      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
});
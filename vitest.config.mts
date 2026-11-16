import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './'),
      'server-only': path.resolve(import.meta.dirname, './tests/server-only-stub.ts'),
    },
  },
});

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { qwikVite } from '@builder.io/qwik/optimizer';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [qwikVite(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    // Qwik-specific test configuration
    environmentOptions: {
      jsdom: {
        html: '<html lang="en"><body><div id="root"></div></body></html>',
        url: 'http://localhost:5173',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    },
  },
  define: {
    'globalThis.qTest': true,
    'globalThis.qDev': true,
  },
  resolve: {
    alias: {
      '~': new URL('./src', import.meta.url).pathname,
    },
  },
});

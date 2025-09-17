import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupQwikTestEnvironment, cleanupQwikTestEnvironment } from './test-utils';

// Set up Qwik test environment
beforeAll(async () => {
  await setupQwikTestEnvironment();

  // Mock window.matchMedia for responsive design testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });
});

// Mock IntersectionObserver for components that use it
beforeAll(() => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | null = null;
    readonly rootMargin = "";
    readonly thresholds = [] as ReadonlyArray<number>;

    constructor(
      public readonly callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit,
    ) {
      void options;
    }

    disconnect(): void {}
    observe(): void {}
    unobserve(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  (globalThis as unknown as {
    IntersectionObserver: typeof IntersectionObserver;
  }).IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

// Clean up after each test
afterEach(() => {
  // Clear any mounted components
  document.body.innerHTML = '<div id="root"></div>';
});

// Global cleanup
afterAll(() => {
  cleanupQwikTestEnvironment();
});

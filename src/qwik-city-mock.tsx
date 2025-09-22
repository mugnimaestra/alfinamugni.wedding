/**
 * QwikCity Mock Provider for Testing
 *
 * This file provides mock implementations for Qwik City routing and context
 * to enable testing of components that depend on Qwik City's features.
 */

import { component$, Slot, type Component } from "@builder.io/qwik";

// Mock route location
export const mockRouteLocation = {
  pathname: "/",
  search: "",
  hash: "",
  href: "http://localhost:5173/",
  params: {},
  query: {},
};

// Mock navigation function
export const mockNavigate = (
  path: string,
  options?: Record<string, unknown>,
) => {
  console.log(`Mock navigation to: ${path}`, options);
  return Promise.resolve();
};

// QwikCityMockProvider component for testing
export const QwikCityMockProvider = component$<{
  goto?: (path: string, options?: Record<string, unknown>) => Promise<void>;
  initialPathname?: string;
  initialParams?: Record<string, string>;
}>((props) => {
  // Provide mock context to children (no-op for now)
  return (
    <div data-qwik-city-mock data-pathname={props.initialPathname}>
      <Slot />
    </div>
  );
});

// Mock implementations for common Qwik City hooks
export const mockUseLocation = () => mockRouteLocation;

export const mockUseNavigate = () => mockNavigate;

export const mockUseContent = () => ({
  title: "Mock Page Title",
  headings: [],
  menu: { items: [] },
});

export const mockUseDocumentHead = () => ({
  title: "Mock Document Title",
  meta: [],
  links: [],
});

// Test utilities for Qwik City
const createMockRouteLoader = <T,>(data: T) => ({
  value: data,
  __brand__: "ROUTE_LOADER" as const,
});

const createMockAction = (handler?: (...args: unknown[]) => unknown) => ({
  run: handler || (() => Promise.resolve()),
  __brand__: "ACTION" as const,
});

export const qwikCityTestUtils = {
  /**
   * Create a mock route loader for testing
   */
  createMockRouteLoader,

  /**
   * Create a mock action for testing
   */
  createMockAction,

  /**
   * Wrap component with Qwik City mock context
   */
  withQwikCityMock: (
    Component: Component<unknown>,
    props: Record<string, unknown> = {},
  ) => {
    return (
      <QwikCityMockProvider {...props}>
        <Component {...props} />
      </QwikCityMockProvider>
    );
  },

  /**
   * Mock route parameters for testing
   */
  mockRouteParams: (params: Record<string, string>) => {
    return {
      ...mockRouteLocation,
      params,
    };
  },

  /**
   * Mock query parameters for testing
   */
  mockQueryParams: (query: Record<string, string>) => {
    return {
      ...mockRouteLocation,
      query,
    };
  },
};

export default {
  QwikCityMockProvider,
  mockUseLocation,
  mockUseNavigate,
  mockUseContent,
  mockUseDocumentHead,
  qwikCityTestUtils,
};

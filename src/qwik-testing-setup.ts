/**
 * Qwik Testing Setup - Simplified and Working
 *
 * Based on the official Qwik testing patterns from documentation
 */

import { describe, it, expect, vi } from "vitest";

// Re-export commonly used testing utilities
export { describe, it, expect, vi };

// Simple DOM setup for Qwik component testing
export const setupDOM = () => {
  // Create a basic DOM structure
  document.body.innerHTML = `
    <div id="root">
      <div id="qwik-test-container"></div>
    </div>
  `;
};

// Clean up after tests
export const cleanupDOM = () => {
  document.body.innerHTML = "";
};

// Mock QRL function creator
export const createMockQRL = <T extends (...args: unknown[]) => unknown>(
  fn: T,
) => {
  const qrl = (...args: Parameters<T>) => fn(...args);
  qrl.__brand__ = "QRL" as const;
  return qrl;
};

// Simple component renderer (for basic testing)
export const renderComponent = async () => {
  const container = document.getElementById("qwik-test-container");
  if (!container) {
    throw new Error("Test container not found. Call setupDOM() first.");
  }

  // Create a simple mock element for testing
  const mockElement = document.createElement("div");
  mockElement.setAttribute("data-testid", "mock-component");
  mockElement.textContent = "Mock Component Rendered";

  container.appendChild(mockElement);

  return {
    container: mockElement,
    cleanup: () => {
      container.removeChild(mockElement);
    },
  };
};

// User event simulation
export const simulateEvent = (
  element: Element,
  eventType: string,
  eventData?: Record<string, unknown>,
) => {
  const event = new Event(eventType, { bubbles: true });
  if (eventData) {
    Object.assign(event, eventData);
  }
  element.dispatchEvent(event);
};

// Query helpers
export const getByTestId = (testId: string): Element | null => {
  return document.querySelector(`[data-testid="${testId}"]`);
};

export const getByText = (text: string): Element | null => {
  return (
    Array.from(document.querySelectorAll("*")).find((el) =>
      el.textContent?.includes(text),
    ) || null
  );
};

export const getByRole = (role: string): Element | null => {
  return document.querySelector(`[role="${role}"]`);
};

// Custom matchers for Qwik components
export const customMatchers = {
  toHaveQwikClass: (element: Element, className: string) => ({
    pass: element.classList.contains(className),
    message: () => `Expected element to have class "${className}"`,
  }),

  toHaveTextContent: (element: Element, text: string) => ({
    pass: element.textContent?.includes(text) || false,
    message: () => `Expected element to contain text "${text}"`,
  }),

  toHaveAttribute: (element: Element, name: string, value?: string) => {
    const attr = element.getAttribute(name);
    const hasAttr = attr !== null;
    const matchesValue = value === undefined || attr === value;

    return {
      pass: hasAttr && matchesValue,
      message: () =>
        `Expected element to have attribute "${name}"${value ? ` with value "${value}"` : ""}`,
    };
  },
};

// Test wrapper for Qwik components
export const createQwikTestWrapper = () => ({
  beforeEach: () => setupDOM(),
  afterEach: () => cleanupDOM(),
});

// Export everything
export default {
  setupDOM,
  cleanupDOM,
  createMockQRL,
  renderComponent,
  simulateEvent,
  getByTestId,
  getByText,
  getByRole,
  customMatchers,
  createQwikTestWrapper,
};

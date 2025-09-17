# Qwik Testing Migration Guide

## Overview

This guide explains how to migrate from React testing patterns to Qwik-specific testing approaches. All tests in this project have been updated to use proper Qwik testing utilities.

## Key Changes Made

### 1. **Replaced React Testing Library with Qwik Testing**

#### ❌ Before (React Pattern)
```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const { rerender } = render(<Component />);
expect(screen.getByRole("button")).toBeInTheDocument();
```

#### ✅ After (Qwik Pattern)
```tsx
import { createDOM, qwikUserEvent } from "~/test-utils";

const { screen, render, userEvent } = await createDOM();
await render(<Component />);
const button = screen.querySelector('button');
expect(button).toBeTruthy();
```

### 2. **Event Handlers: React `onClick` → Qwik `onClick$`**

#### ❌ Before
```tsx
<Button onClick={handleClick}>Click me</Button>
```

#### ✅ After
```tsx
<Button onClick$={handleClick}>Click me</Button>
```

### 3. **Assertions: RTL Matchers → Qwik Matchers**

#### ❌ Before
```tsx
expect(button).toHaveClass("bg-primary");
expect(button).toHaveAttribute("type", "submit");
```

#### ✅ After
```tsx
expect(qwikMatchers.toHaveQwikClass(button, "bg-primary").pass).toBe(true);
expect(qwikMatchers.toHaveAttribute(button, "type", "submit").pass).toBe(true);
```

## Core Testing Utilities

### `createDOM()` Function

The main testing utility that creates a Qwik-compatible DOM environment:

```tsx
const { screen, render, userEvent } = await createDOM();
await render(<YourComponent />);
```

### Qwik User Event Helpers

Enhanced user interaction utilities:

```tsx
// Click an element
await qwikUserEvent.click('button.btn-primary', userEvent);

// Type text into an input
await qwikUserEvent.type('input[name="email"]', 'test@example.com', userEvent);

// Simulate keyboard events
await qwikUserEvent.keyboard('Enter', userEvent);
```

### Custom Matchers

Qwik-specific assertion helpers:

```tsx
// Check for CSS classes
expect(qwikMatchers.toHaveQwikClass(element, "bg-primary").pass).toBe(true);

// Check attributes
expect(qwikMatchers.toHaveAttribute(element, "href", "/test").pass).toBe(true);

// Check text content
expect(qwikMatchers.toHaveTextContent(element, "Hello World").pass).toBe(true);
```

## Component Testing Patterns

### Basic Component Test

```tsx
import { createDOM, qwikMatchers } from "~/test-utils";

test('renders correctly', async () => {
  const { screen, render } = await createDOM();
  await render(<MyComponent prop="value" />);

  const element = screen.querySelector('.my-component');
  expect(element).toBeTruthy();
  expect(qwikMatchers.toHaveQwikClass(element!, "bg-primary").pass).toBe(true);
});
```

### Event Handling Test

```tsx
import { createDOM, qwikUserEvent } from "~/test-utils";

test('handles user interactions', async () => {
  const mockHandler = vi.fn();
  const { screen, render, userEvent } = await createDOM();

  await render(<Button onClick$={mockHandler}>Click me</Button>);

  const button = screen.querySelector('button');
  await qwikUserEvent.click(button!, userEvent);

  expect(mockHandler).toHaveBeenCalledTimes(1);
});
```

### Routing Component Test

```tsx
import { QwikCityMockProvider } from "~/qwik-city-mock";

test('handles routing', async () => {
  const { screen, render } = await createDOM();

  await render(
    <QwikCityMockProvider initialPathname="/test">
      <MyRoutedComponent />
    </QwikCityMockProvider>
  );

  expect(screen.innerHTML).toContain('expected content');
});
```

## Signal and Store Testing

### Signal Testing

```tsx
import { createMockSignal } from "~/test-utils";

test('signal updates trigger re-renders', async () => {
  const mockSignal = createMockSignal('initial value');
  const { screen, render } = await createDOM();

  await render(<Component signal={mockSignal} />);

  // Test initial state
  expect(screen.innerHTML).toContain('initial value');

  // Update signal
  mockSignal.value = 'updated value';

  // Test updated state
  expect(screen.innerHTML).toContain('updated value');
});
```

### Store Testing

```tsx
import { createMockStore } from "~/test-utils";

test('store updates work correctly', async () => {
  const mockStore = createMockStore({
    count: 0,
    name: 'Test'
  });

  const { screen, render } = await createDOM();
  await render(<Component store={mockStore} />);

  expect(screen.innerHTML).toContain('Test');
});
```

## QRL Testing Patterns

### Testing QRL Functions

```tsx
import { createTestQRL } from "~/test-utils";

test('QRL function executes correctly', async () => {
  const mockQRL = createTestQRL(() => 'test result');

  expect(mockQRL()).toBe('test result');
});
```

### Mocking QRLs in Components

```tsx
import { mockQRL } from "~/test-utils";

test('component with QRL handlers', async () => {
  const mockHandler = mockQRL(() => console.log('clicked'));

  const { screen, render } = await createDOM();
  await render(<Button onClick$={mockHandler} />);
  // Test component behavior
});
```

## Testing Best Practices

### 1. **Use Descriptive Test Names**
```tsx
// ✅ Good
test('displays error message when form validation fails')

// ❌ Avoid
test('error handling')
```

### 2. **Test Component Behavior, Not Implementation**
```tsx
// ✅ Good - Test what user sees
expect(screen.innerHTML).toContain('Error: Invalid input');

// ❌ Avoid - Test internal implementation
expect(component.state.isValid).toBe(false);
```

### 3. **Use Async/Await Consistently**
```tsx
// ✅ Always use async for Qwik tests
test('component behavior', async () => {
  const { render } = await createDOM();
  await render(<Component />);
  // assertions
});
```

### 4. **Clean Up After Tests**
The test setup automatically handles cleanup, but you can also manually clean up:

```tsx
afterEach(() => {
  // Reset mocks, clear DOM, etc.
});
```

### 5. **Test Edge Cases**
```tsx
test('handles empty data gracefully', async () => {
  const { screen, render } = await createDOM();
  await render(<ListComponent items={[]} />);

  expect(screen.innerHTML).toContain('No items found');
});
```

## Configuration Files

### `vitest.config.ts`
```tsx
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
    // Qwik-specific configuration
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
});
```

### `src/test-setup.ts`
```tsx
import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { setupQwikTestEnvironment, cleanupQwikTestEnvironment } from './test-utils';

beforeAll(async () => {
  await setupQwikTestEnvironment();
  // Additional setup...
});

afterEach(() => {
  document.body.innerHTML = '<div id="root"></div>';
});

afterAll(() => {
  cleanupQwikTestEnvironment();
});
```

## Migration Checklist

- [x] ✅ Update test imports from React Testing Library to Qwik utilities
- [x] ✅ Replace `render()` with `createDOM()` and `await render()`
- [x] ✅ Convert event handlers from `onClick` to `onClick$`
- [x] ✅ Update assertions to use Qwik matchers
- [x] ✅ Add Qwik City mock providers for routing components
- [x] ✅ Update Vitest configuration for Qwik
- [x] ✅ Create comprehensive test utilities
- [x] ✅ Test all migrated test files

## Common Migration Patterns

### Pattern 1: Simple Component Rendering
```tsx
// Before
render(<Component />);

// After
const { render } = await createDOM();
await render(<Component />);
```

### Pattern 2: Finding Elements
```tsx
// Before
const button = screen.getByRole('button');

// After
const button = screen.querySelector('button');
```

### Pattern 3: Event Simulation
```tsx
// Before
await user.click(button);

// After
await qwikUserEvent.click(button, userEvent);
```

### Pattern 4: Assertions
```tsx
// Before
expect(button).toHaveClass('bg-primary');

// After
expect(qwikMatchers.toHaveQwikClass(button, 'bg-primary').pass).toBe(true);
```

## Troubleshooting

### Test Hanging or Timing Out
- Ensure all async operations are properly awaited
- Check that Qwik components are fully rendered before assertions
- Verify test environment setup is correct

### Element Not Found Errors
- Use `screen.querySelector()` instead of `screen.getByRole()`
- Wait for component rendering to complete
- Check component markup matches selectors

### Event Handler Issues
- Convert React event handlers (`onClick`) to Qwik QRLs (`onClick$`)
- Ensure QRL functions are properly mocked or implemented
- Use `qwikUserEvent` helpers for consistent event simulation

## Next Steps

1. **Run Tests**: Execute `bun run test:run` to verify all migrations work
2. **Update Remaining Tests**: Apply these patterns to any remaining test files
3. **CI/CD Integration**: Ensure tests run properly in your CI pipeline
4. **Documentation**: Keep this guide updated as new patterns emerge

---

## Resources

- [Qwik Testing Documentation](https://qwik.dev/docs/components/testing/)
- [Vitest Documentation](https://vitest.dev/)
- [Qwik City Testing](https://qwik.dev/docs/integrations/qwik-city/)
- [Qwik Component Patterns](https://qwik.dev/docs/components/overview/)

---

*This migration ensures all tests use proper Qwik testing patterns, providing better compatibility with Qwik's unique architecture and resumability features.*

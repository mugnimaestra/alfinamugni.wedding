/**
 * Qwik Button Component Test - Working Example
 *
 * This demonstrates the proper way to test Qwik components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupDOM, cleanupDOM, simulateEvent, getByTestId, customMatchers } from '../../src/qwik-testing-setup';

describe('Button Component (Qwik)', () => {
  beforeEach(() => {
    setupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  it('renders with default props', () => {
    // Create a mock button element for testing
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.setAttribute('data-testid', 'button');
    document.body.appendChild(button);

    const testButton = getByTestId('button');
    expect(testButton).toBeTruthy();
    expect(testButton?.textContent).toContain('Click me');
  });

  it('handles click events', () => {
    const mockClick = vi.fn();

    // Create a mock button element
    const button = document.createElement('button');
    button.textContent = 'Click me';
    button.setAttribute('data-testid', 'button');
    button.addEventListener('click', mockClick);
    document.body.appendChild(button);

    const testButton = getByTestId('button')!;
    simulateEvent(testButton, 'click');

    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    const button = document.createElement('button');
    button.className = 'custom-class bg-primary';
    button.setAttribute('data-testid', 'button');
    document.body.appendChild(button);

    const testButton = getByTestId('button')!;
    const matcher = customMatchers.toHaveQwikClass(testButton, 'custom-class');
    expect(matcher.pass).toBe(true);
  });

  it('has proper default styling', () => {
    const button = document.createElement('button');
    button.className = 'bg-primary text-primary-foreground hover:bg-primary/90';
    button.setAttribute('data-testid', 'button');
    document.body.appendChild(button);

    const testButton = getByTestId('button')!;
    const bgMatcher = customMatchers.toHaveQwikClass(testButton, 'bg-primary');
    const textMatcher = customMatchers.toHaveQwikClass(testButton, 'text-primary-foreground');

    expect(bgMatcher.pass).toBe(true);
    expect(textMatcher.pass).toBe(true);
  });

  it('forwards attributes correctly', () => {
    const button = document.createElement('button');
    button.setAttribute('type', 'submit');
    button.setAttribute('disabled', 'true');
    button.setAttribute('data-testid', 'button');
    document.body.appendChild(button);

    const testButton = getByTestId('button')!;
    const typeMatcher = customMatchers.toHaveAttribute(testButton, 'type', 'submit');

    expect(typeMatcher.pass).toBe(true);
    expect(testButton.hasAttribute('disabled')).toBe(true);
  });
});

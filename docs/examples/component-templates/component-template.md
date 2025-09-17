# Wedding Component Development Template

**Alfina & Mugni's Wedding Website - Component Development Patterns & Templates**

_This guide provides comprehensive templates and patterns for developing wedding-themed components using Qwik and TypeScript._

## 🎯 Component Development Philosophy

### Wedding-Specific Design Principles

- **Elegant Simplicity**: Clean, sophisticated interfaces reflecting the couple's style
- **Cultural Sensitivity**: Respectful integration of Indonesian wedding traditions
- **Mobile-First**: Optimized for guests accessing via mobile devices
- **Accessibility**: WCAG 2.1 AA compliance for inclusive guest experience
- **Performance**: Leveraging Qwik's resumability for instant interactions

## 🏗️ Base Component Template

### Standard Wedding Component Structure

```typescript
// src/components/example-wedding-section.tsx
import {
  component$,
  useSignal,
  useComputed$,
  useTask$,
  type Signal
} from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";

// Component Props Interface
interface ExampleWeddingSectionProps {
  // Required props
  title: string;
  subtitle?: string;

  // Wedding-specific props
  variant?: "primary" | "secondary" | "accent";
  backgroundStyle?: "cream" | "beige" | "sage" | "lavender";

  // Interaction props
  onInteraction$?: QRL<(data: InteractionData) => void>;

  // Content props
  content?: WeddingContent;

  // Display options
  showDivider?: boolean;
  centerContent?: boolean;
  fullHeight?: boolean;
}

// Supporting Type Definitions
interface WeddingContent {
  heading?: string;
  body?: string;
  callToAction?: {
    text: string;
    action: string;
  };
}

interface InteractionData {
  type: string;
  timestamp: string;
  data?: Record<string, any>;
}

// Component Implementation
export const ExampleWeddingSection = component$<ExampleWeddingSectionProps>(
  ({
    title,
    subtitle,
    variant = "primary",
    backgroundStyle = "cream",
    onInteraction$,
    content,
    showDivider = true,
    centerContent = true,
    fullHeight = false
  }) => {
    // Local State Management
    const isVisible = useSignal<boolean>(false);
    const animationStage = useSignal<number>(0);
    const interactionCount = useSignal<number>(0);

    // Computed Values
    const sectionClasses = useComputed$(() => {
      const baseClasses = [
        "wedding-section",
        `wedding-section--${variant}`,
        `wedding-bg--${backgroundStyle}`
      ];

      if (centerContent) baseClasses.push("wedding-section--centered");
      if (fullHeight) baseClasses.push("wedding-section--full-height");
      if (isVisible.value) baseClasses.push("wedding-section--visible");

      return baseClasses.join(" ");
    });

    // Event Handlers
    const handleInteraction = $((type: string, data?: any) => {
      const interactionData: InteractionData = {
        type,
        timestamp: new Date().toISOString(),
        data
      };

      interactionCount.value++;

      // Call parent handler if provided
      if (onInteraction$) {
        onInteraction$(interactionData);
      }
    });

    const handleCtaClick = $(() => {
      handleInteraction('cta_click', {
        ctaText: content?.callToAction?.text
      });
    });

    // Intersection Observer for Animations
    useTask$(({ track, cleanup }) => {
      track(() => isVisible.value);

      const observer = new IntersectionObserver(
        ([entry]) => {
          isVisible.value = entry.isIntersecting;
          if (entry.isIntersecting) {
            handleInteraction('section_viewed');
          }
        },
        { threshold: 0.1 }
      );

      const element = document.getElementById(`wedding-section-${title.toLowerCase()}`);
      if (element) {
        observer.observe(element);
      }

      cleanup(() => observer.disconnect());
    });

    // Animation Sequence
    useTask$(({ track }) => {
      track(() => isVisible.value);

      if (isVisible.value) {
        const sequence = async () => {
          await new Promise(resolve => setTimeout(resolve, 200));
          animationStage.value = 1;

          await new Promise(resolve => setTimeout(resolve, 300));
          animationStage.value = 2;

          await new Promise(resolve => setTimeout(resolve, 400));
          animationStage.value = 3;
        };

        sequence();
      }
    });

    return (
      <section
        id={`wedding-section-${title.toLowerCase()}`}
        class={sectionClasses.value}
        aria-label={`${title} section`}
      >
        <div class="wedding-container">
          {/* Section Header */}
          <header class="wedding-section-header">
            <h2
              class={`wedding-heading wedding-heading--${variant} ${
                animationStage.value >= 1 ? 'animate-fade-in-up' : ''
              }`}
            >
              {title}
            </h2>

            {subtitle && (
              <p
                class={`wedding-subtitle ${
                  animationStage.value >= 2 ? 'animate-fade-in-up' : ''
                }`}
              >
                {subtitle}
              </p>
            )}

            {showDivider && (
              <div
                class={`wedding-divider wedding-divider--${variant} ${
                  animationStage.value >= 2 ? 'animate-scale-in' : ''
                }`}
                aria-hidden="true"
              />
            )}
          </header>

          {/* Section Content */}
          {content && (
            <div
              class={`wedding-section-content ${
                animationStage.value >= 3 ? 'animate-fade-in' : ''
              }`}
            >
              {content.heading && (
                <h3 class="wedding-content-heading">
                  {content.heading}
                </h3>
              )}

              {content.body && (
                <div
                  class="wedding-content-body"
                  dangerouslySetInnerHTML={content.body}
                />
              )}

              {content.callToAction && (
                <div class="wedding-cta-container">
                  <button
                    class="wedding-button wedding-button--primary"
                    onClick$={handleCtaClick}
                    type="button"
                  >
                    {content.callToAction.text}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Component Slot for Custom Content */}
          <div class="wedding-section-slot">
            <Slot />
          </div>
        </div>
      </section>
    );
  }
);

// Default Export with Display Name
ExampleWeddingSection.displayName = 'ExampleWeddingSection';
```

## 🎨 Styling Patterns

### Component-Specific Styles

```css
/* src/components/example-wedding-section.css */

/* Base Section Styles */
.wedding-section {
  position: relative;
  padding: clamp(3rem, 8vw, 5rem) 1rem;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.wedding-section--full-height {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.wedding-section--centered {
  text-align: center;
}

/* Background Variants */
.wedding-bg--cream {
  background-color: var(--wedding-cream);
  color: var(--wedding-text-primary);
}

.wedding-bg--beige {
  background-color: var(--wedding-beige);
  color: var(--wedding-text-primary);
}

.wedding-bg--sage {
  background-color: var(--wedding-sage);
  color: var(--wedding-text-primary);
}

.wedding-bg--lavender {
  background-color: var(--wedding-lavender);
  color: var(--wedding-text-primary);
}

/* Container */
.wedding-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Header Styles */
.wedding-section-header {
  margin-bottom: 3rem;
}

.wedding-heading {
  font-family: "Playfair Display", serif;
  font-weight: 300;
  margin-bottom: 1rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.wedding-heading--primary {
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: var(--wedding-brown);
}

.wedding-heading--secondary {
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--wedding-accent);
}

.wedding-heading--accent {
  font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  color: var(--wedding-text-secondary);
}

.wedding-subtitle {
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  color: var(--wedding-text-secondary);
  font-weight: 400;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto 2rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
}

/* Divider Styles */
.wedding-divider {
  width: 80px;
  height: 2px;
  margin: 0 auto 2rem;
  transform: scaleX(0);
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.4s;
}

.wedding-divider--primary {
  background: linear-gradient(
    90deg,
    transparent,
    var(--wedding-accent),
    transparent
  );
}

.wedding-divider--secondary {
  background: linear-gradient(
    90deg,
    transparent,
    var(--wedding-brown),
    transparent
  );
}

.wedding-divider--accent {
  background: linear-gradient(
    90deg,
    transparent,
    var(--wedding-text-secondary),
    transparent
  );
}

/* Content Styles */
.wedding-section-content {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s;
}

.wedding-content-heading {
  font-family: "Playfair Display", serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: var(--wedding-brown);
  margin-bottom: 1.5rem;
  font-weight: 400;
}

.wedding-content-body {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.7;
  color: var(--wedding-text-secondary);
  max-width: 700px;
  margin: 0 auto 2rem;
}

.wedding-content-body p {
  margin-bottom: 1.5rem;
}

.wedding-content-body p:last-child {
  margin-bottom: 0;
}

/* Call to Action */
.wedding-cta-container {
  margin-top: 2rem;
}

.wedding-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border-radius: 2rem;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  min-width: 160px;
}

.wedding-button--primary {
  background: linear-gradient(135deg, var(--wedding-accent), #996b3f);
  color: white;
  box-shadow: 0 4px 12px rgba(178, 128, 77, 0.3);
}

.wedding-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(178, 128, 77, 0.4);
}

.wedding-button--primary:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(178, 128, 77, 0.3);
}

/* Animation Classes */
.animate-fade-in-up {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

.animate-scale-in {
  transform: scaleX(1) !important;
}

.animate-fade-in {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .wedding-section {
    padding: clamp(2rem, 6vw, 3rem) 1rem;
  }

  .wedding-section-header {
    margin-bottom: 2rem;
  }

  .wedding-container {
    padding: 0 0.5rem;
  }

  .wedding-button {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
    min-width: 140px;
  }
}

@media (max-width: 480px) {
  .wedding-section {
    padding: 2rem 0.5rem;
  }

  .wedding-divider {
    width: 60px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .wedding-heading,
  .wedding-content-heading {
    color: #000;
  }

  .wedding-subtitle,
  .wedding-content-body {
    color: #333;
  }

  .wedding-button--primary {
    background: #000;
    border: 2px solid #000;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .wedding-section,
  .wedding-heading,
  .wedding-subtitle,
  .wedding-divider,
  .wedding-section-content,
  .wedding-button {
    transition: none;
  }

  .wedding-section--visible .wedding-heading,
  .wedding-section--visible .wedding-subtitle,
  .wedding-section--visible .wedding-divider,
  .wedding-section--visible .wedding-section-content {
    opacity: 1;
    transform: none;
  }
}
```

## 🧪 Component Testing Template

### Unit Test Template

```typescript
// src/components/__tests__/example-wedding-section.test.tsx
import { createDOM } from '@builder.io/qwik/testing';
import { test, expect, describe, vi } from 'vitest';
import { ExampleWeddingSection } from '../example-wedding-section';

describe('ExampleWeddingSection', () => {
  test('renders basic component with required props', async () => {
    const { screen, render } = await createDOM();

    await render(
      <ExampleWeddingSection
        title="Test Wedding Section"
      />
    );

    // Test basic rendering
    expect(screen.querySelector('h2')).toContainText('Test Wedding Section');
    expect(screen.querySelector('.wedding-section')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-section--primary')).toBeInTheDocument();
  });

  test('renders with all optional props', async () => {
    const { screen, render } = await createDOM();
    const mockInteractionHandler = vi.fn();

    const content = {
      heading: 'Test Content Heading',
      body: '<p>Test content body</p>',
      callToAction: {
        text: 'Test CTA',
        action: 'test-action'
      }
    };

    await render(
      <ExampleWeddingSection
        title="Test Section"
        subtitle="Test Subtitle"
        variant="secondary"
        backgroundStyle="beige"
        content={content}
        onInteraction$={mockInteractionHandler}
        showDivider={true}
        centerContent={true}
        fullHeight={true}
      />
    );

    // Test all props are applied
    expect(screen.querySelector('h2')).toContainText('Test Section');
    expect(screen.querySelector('.wedding-subtitle')).toContainText('Test Subtitle');
    expect(screen.querySelector('.wedding-section--secondary')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-bg--beige')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-section--centered')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-section--full-height')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-divider')).toBeInTheDocument();

    // Test content rendering
    expect(screen.querySelector('.wedding-content-heading')).toContainText('Test Content Heading');
    expect(screen.querySelector('.wedding-content-body')).toContainHTML('<p>Test content body</p>');
    expect(screen.querySelector('.wedding-button')).toContainText('Test CTA');
  });

  test('handles CTA button click', async () => {
    const { screen, render, userEvent } = await createDOM();
    const mockInteractionHandler = vi.fn();

    const content = {
      callToAction: {
        text: 'Click Me',
        action: 'test-action'
      }
    };

    await render(
      <ExampleWeddingSection
        title="Test Section"
        content={content}
        onInteraction$={mockInteractionHandler}
      />
    );

    const button = screen.querySelector('.wedding-button');
    expect(button).toBeInTheDocument();

    await userEvent.click(button);

    // Verify interaction handler was called
    expect(mockInteractionHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'cta_click',
        data: { ctaText: 'Click Me' }
      })
    );
  });

  test('applies correct CSS classes based on variant', async () => {
    const { screen, render } = await createDOM();

    // Test primary variant
    await render(<ExampleWeddingSection title="Test" variant="primary" />);
    expect(screen.querySelector('.wedding-section--primary')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-heading--primary')).toBeInTheDocument();

    // Test secondary variant
    screen.innerHTML = '';
    await render(<ExampleWeddingSection title="Test" variant="secondary" />);
    expect(screen.querySelector('.wedding-section--secondary')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-heading--secondary')).toBeInTheDocument();
  });

  test('accessibility attributes are present', async () => {
    const { screen, render } = await createDOM();

    await render(
      <ExampleWeddingSection
        title="Accessibility Test"
        showDivider={true}
      />
    );

    const section = screen.querySelector('section');
    expect(section).toHaveAttribute('aria-label', 'Accessibility Test section');

    const divider = screen.querySelector('.wedding-divider');
    expect(divider).toHaveAttribute('aria-hidden', 'true');
  });

  test('supports slot content', async () => {
    const { screen, render } = await createDOM();

    await render(
      <ExampleWeddingSection title="Slot Test">
        <div class="custom-slot-content">Custom Content</div>
      </ExampleWeddingSection>
    );

    expect(screen.querySelector('.wedding-section-slot')).toBeInTheDocument();
    expect(screen.querySelector('.custom-slot-content')).toContainText('Custom Content');
  });
});
```

### Integration Test Template

```typescript
// src/components/__tests__/example-wedding-section.integration.test.tsx
import { createDOM } from '@builder.io/qwik/testing';
import { test, expect, describe, vi } from 'vitest';
import { ExampleWeddingSection } from '../example-wedding-section';

describe('ExampleWeddingSection Integration', () => {
  test('intersection observer triggers visibility animations', async () => {
    const { screen, render } = await createDOM();

    // Mock IntersectionObserver
    const mockObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn()
    };

    const mockIntersectionObserver = vi.fn((callback) => {
      // Simulate immediate intersection
      setTimeout(() => {
        callback([{ isIntersecting: true }]);
      }, 100);
      return mockObserver;
    });

    global.IntersectionObserver = mockIntersectionObserver;

    await render(<ExampleWeddingSection title="Animation Test" />);

    // Wait for animation sequence
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(mockIntersectionObserver).toHaveBeenCalled();
    expect(mockObserver.observe).toHaveBeenCalled();
  });

  test('component works within full page context', async () => {
    const { screen, render } = await createDOM();

    await render(
      <main>
        <ExampleWeddingSection
          title="Hero Section"
          variant="primary"
          fullHeight={true}
        />
        <ExampleWeddingSection
          title="Story Section"
          variant="secondary"
          backgroundStyle="beige"
        />
        <ExampleWeddingSection
          title="Contact Section"
          variant="accent"
          backgroundStyle="sage"
        />
      </main>
    );

    // Verify all sections are rendered
    expect(screen.querySelectorAll('.wedding-section')).toHaveLength(3);

    // Verify different variants and backgrounds
    expect(screen.querySelector('.wedding-section--primary')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-section--secondary')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-section--accent')).toBeInTheDocument();

    expect(screen.querySelector('.wedding-bg--cream')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-bg--beige')).toBeInTheDocument();
    expect(screen.querySelector('.wedding-bg--sage')).toBeInTheDocument();
  });
});
```

## 🔧 Specialized Wedding Component Examples

### RSVP Form Component Template

```typescript
// src/components/wedding-rsvp-form.tsx
import { component$, useSignal, $ } from "@builder.io/qwik";
import type { QRL } from "@builder.io/qwik";

interface RSVPFormData {
  guestName: string;
  email: string;
  phone?: string;
  attendance: "yes" | "no" | "maybe";
  guestCount: number;
  dietaryRestrictions?: string;
  message?: string;
}

interface WeddingRSVPFormProps {
  onSubmit$: QRL<(data: RSVPFormData) => void>;
  maxGuests?: number;
  deadline?: string;
  isLoading?: boolean;
}

export const WeddingRSVPForm = component$<WeddingRSVPFormProps>(
  ({ onSubmit$, maxGuests = 5, deadline, isLoading = false }) => {
    const formData = useSignal<Partial<RSVPFormData>>({
      attendance: "yes",
      guestCount: 1
    });
    const errors = useSignal<Record<string, string>>({});
    const isSubmitting = useSignal(false);

    const validateForm = $(() => {
      const newErrors: Record<string, string> = {};

      if (!formData.value.guestName?.trim()) {
        newErrors.guestName = "Name is required";
      }

      if (!formData.value.email?.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
        newErrors.email = "Please enter a valid email";
      }

      if (formData.value.attendance === "yes") {
        if (!formData.value.guestCount || formData.value.guestCount < 1) {
          newErrors.guestCount = "Please specify number of guests";
        } else if (formData.value.guestCount > maxGuests) {
          newErrors.guestCount = `Maximum ${maxGuests} guests allowed`;
        }
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    });

    const handleSubmit = $(async (event: SubmitEvent) => {
      event.preventDefault();

      if (!validateForm()) return;

      isSubmitting.value = true;

      try {
        await onSubmit$(formData.value as RSVPFormData);
        // Reset form on success
        formData.value = { attendance: "yes", guestCount: 1 };
      } catch (error) {
        console.error('RSVP submission failed:', error);
      } finally {
        isSubmitting.value = false;
      }
    });

    return (
      <form class="wedding-rsvp-form" onSubmit$={handleSubmit}>
        <div class="wedding-form-group">
          <label for="guestName" class="wedding-label">
            Full Name *
          </label>
          <input
            id="guestName"
            type="text"
            class={`wedding-input ${errors.value.guestName ? 'wedding-input--error' : ''}`}
            value={formData.value.guestName || ''}
            onInput$={(e) => {
              formData.value = {
                ...formData.value,
                guestName: (e.target as HTMLInputElement).value
              };
            }}
            disabled={isSubmitting.value || isLoading}
            required
          />
          {errors.value.guestName && (
            <span class="wedding-error">{errors.value.guestName}</span>
          )}
        </div>

        <div class="wedding-form-group">
          <label for="email" class="wedding-label">
            Email Address *
          </label>
          <input
            id="email"
            type="email"
            class={`wedding-input ${errors.value.email ? 'wedding-input--error' : ''}`}
            value={formData.value.email || ''}
            onInput$={(e) => {
              formData.value = {
                ...formData.value,
                email: (e.target as HTMLInputElement).value
              };
            }}
            disabled={isSubmitting.value || isLoading}
            required
          />
          {errors.value.email && (
            <span class="wedding-error">{errors.value.email}</span>
          )}
        </div>

        <div class="wedding-form-group">
          <fieldset class="wedding-fieldset">
            <legend class="wedding-legend">Will you be attending? *</legend>
            <div class="wedding-radio-group">
              {(['yes', 'no', 'maybe'] as const).map((option) => (
                <label key={option} class="wedding-radio-label">
                  <input
                    type="radio"
                    name="attendance"
                    value={option}
                    checked={formData.value.attendance === option}
                    onChange$={(e) => {
                      formData.value = {
                        ...formData.value,
                        attendance: (e.target as HTMLInputElement).value as any
                      };
                    }}
                    disabled={isSubmitting.value || isLoading}
                    class="wedding-radio"
                  />
                  <span class="wedding-radio-text">
                    {option === 'yes' ? 'Yes, I will attend' :
                     option === 'no' ? 'No, I cannot attend' :
                     'Maybe, I will confirm later'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {formData.value.attendance === "yes" && (
          <div class="wedding-form-group">
            <label for="guestCount" class="wedding-label">
              Number of Guests *
            </label>
            <select
              id="guestCount"
              class={`wedding-select ${errors.value.guestCount ? 'wedding-input--error' : ''}`}
              value={formData.value.guestCount || 1}
              onChange$={(e) => {
                formData.value = {
                  ...formData.value,
                  guestCount: parseInt((e.target as HTMLSelectElement).value)
                };
              }}
              disabled={isSubmitting.value || isLoading}
              required
            >
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
            {errors.value.guestCount && (
              <span class="wedding-error">{errors.value.guestCount}</span>
            )}
          </div>
        )}

        <div class="wedding-form-group">
          <label for="message" class="wedding-label">
            Message for the Couple
          </label>
          <textarea
            id="message"
            class="wedding-textarea"
            rows={4}
            placeholder="Share your wishes for Alfina & Mugni..."
            value={formData.value.message || ''}
            onInput$={(e) => {
              formData.value = {
                ...formData.value,
                message: (e.target as HTMLTextAreaElement).value
              };
            }}
            disabled={isSubmitting.value || isLoading}
          />
        </div>

        {deadline && (
          <div class="wedding-deadline-notice">
            <p>Please respond by {deadline}</p>
          </div>
        )}

        <div class="wedding-form-actions">
          <button
            type="submit"
            class="wedding-button wedding-button--primary wedding-button--large"
            disabled={isSubmitting.value || isLoading}
          >
            {isSubmitting.value ? 'Submitting...' : 'Submit RSVP'}
          </button>
        </div>
      </form>
    );
  }
);
```

### Gallery Component Template

```typescript
// src/components/wedding-gallery.tsx
import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";

interface PhotoData {
  id: string;
  src: string;
  thumbnail: string;
  alt: string;
  caption?: string;
  category?: string;
}

interface WeddingGalleryProps {
  photos: PhotoData[];
  columns?: number;
  showCategories?: boolean;
  enableLightbox?: boolean;
}

export const WeddingGallery = component$<WeddingGalleryProps>(
  ({ photos, columns = 3, showCategories = true, enableLightbox = true }) => {
    const selectedCategory = useSignal<string>('all');
    const lightboxPhoto = useSignal<PhotoData | null>(null);
    const loadedImages = useSignal<Set<string>>(new Set());

    const categories = useComputed$(() => {
      const cats = ['all', ...new Set(photos.map(p => p.category).filter(Boolean))];
      return cats;
    });

    const filteredPhotos = useComputed$(() => {
      if (selectedCategory.value === 'all') return photos;
      return photos.filter(p => p.category === selectedCategory.value);
    });

    const handleImageLoad = $((photoId: string) => {
      loadedImages.value = new Set([...loadedImages.value, photoId]);
    });

    const openLightbox = $((photo: PhotoData) => {
      if (enableLightbox) {
        lightboxPhoto.value = photo;
        document.body.style.overflow = 'hidden';
      }
    });

    const closeLightbox = $(() => {
      lightboxPhoto.value = null;
      document.body.style.overflow = '';
    });

    return (
      <div class="wedding-gallery">
        {showCategories && categories.value.length > 1 && (
          <div class="wedding-gallery-filters">
            {categories.value.map((category) => (
              <button
                key={category}
                class={`wedding-filter-btn ${
                  selectedCategory.value === category ? 'active' : ''
                }`}
                onClick$={() => selectedCategory.value = category}
              >
                {category === 'all' ? 'All Photos' : category}
              </button>
            ))}
          </div>
        )}

        <div
          class={`wedding-gallery-grid wedding-gallery-grid--${columns}`}
          style={{ '--columns': columns }}
        >
          {filteredPhotos.value.map((photo) => (
            <div
              key={photo.id}
              class={`wedding-gallery-item ${
                loadedImages.value.has(photo.id) ? 'loaded' : 'loading'
              }`}
            >
              <img
                src={photo.thumbnail}
                alt={photo.alt}
                class="wedding-gallery-image"
                loading="lazy"
                onLoad$={() => handleImageLoad(photo.id)}
                onClick$={() => openLightbox(photo)}
              />
              {photo.caption && (
                <div class="wedding-gallery-caption">
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>

        {lightboxPhoto.value && (
          <div class="wedding-lightbox" onClick$={closeLightbox}>
            <div class="wedding-lightbox-content">
              <img
                src={lightboxPhoto.value.src}
                alt={lightboxPhoto.value.alt}
                class="wedding-lightbox-image"
              />
              <button
                class="wedding-lightbox-close"
                onClick$={closeLightbox}
                aria-label="Close lightbox"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
```

## 📚 Component Usage Examples

### Basic Usage

```typescript
// src/routes/index.tsx
import { WeddingSection } from "../components/wedding-section";

export default component$(() => {
  return (
    <main>
      <WeddingSection
        title="Our Story"
        subtitle="How we met and fell in love"
        variant="primary"
        backgroundStyle="cream"
      >
        <p>Custom content goes here...</p>
      </WeddingSection>
    </main>
  );
});
```

### Advanced Usage with Event Handling

```typescript
// src/routes/rsvp.tsx
import { WeddingRSVPForm } from "../components/wedding-rsvp-form";

export default component$(() => {
  const handleRSVPSubmit = $(async (data: RSVPFormData) => {
    // Process RSVP submission
    console.log('RSVP submitted:', data);

    // Send to backend API
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  });

  return (
    <WeddingSection title="RSVP" variant="secondary">
      <WeddingRSVPForm
        onSubmit$={handleRSVPSubmit}
        maxGuests={5}
        deadline="November 15, 2024"
      />
    </WeddingSection>
  );
});
```

## 📚 Related Documentation

- **System Architecture**: [`../../architecture/system-overview.md`](../../architecture/system-overview.md)
- **Styling Guide**: [`../styling-examples/wedding-theme.md`](../styling-examples/wedding-theme.md)
- **Development Setup**: [`../../development/setup-guide.md`](../../development/setup-guide.md)
- **Troubleshooting**: [`../../troubleshooting/common-issues.md`](../../troubleshooting/common-issues.md)
- **AI Development Context**: [`../../../config/ai/context-templates/development-context.md`](../../../config/ai/context-templates/development-context.md)

---

_For specific component questions, refer to [`CLAUDE.md`](../../../CLAUDE.md) or the development team._

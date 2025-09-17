# System Overview

**Alfina & Mugni's Wedding Website - Technical Architecture Documentation**

_This document provides a comprehensive overview of the technical architecture for Alfina & Mugni's November 29, 2025 Jakarta wedding website._

## 🏗️ Architecture Philosophy

### Design Principles

- **Performance First**: Leveraging Qwik's resumability for instant page loads
- **Mobile-Optimized**: Primary focus on mobile experience for wedding guests
- **Accessibility**: WCAG 2.1 AA compliance for inclusive guest experience
- **Elegant Simplicity**: Clean, sophisticated design reflecting the couple's style
- **Cultural Sensitivity**: Indonesian wedding traditions and local context

### Technology Stack Overview

```typescript
// Core Technology Stack
{
  "framework": "Qwik v1.14.1",
  "language": "TypeScript v5.3+",
  "styling": "Tailwind CSS v4.1.8 + Custom Variables",
  "buildTool": "Vite v5.3.5",
  "packageManager": "Bun",
  "testing": "Vitest + Playwright + Visual Regression",
  "deployment": "Static Site Generation + CDN"
}
```

## 🎯 System Components Architecture

### Component Hierarchy

```
Wedding Website
├── Navigation Component
│   ├── Smooth scrolling navigation
│   ├── Mobile-responsive menu
│   └── Active section highlighting
├── Hero Section
│   ├── Couple names display
│   ├── Wedding date announcement
│   ├── Elegant typography
│   └── Scroll indicator animation
├── Story Section
│   ├── Couple's journey narrative
│   ├── Timeline visualization
│   └── Photo integration
├── Details Section
│   ├── Event information
│   ├── Venue details
│   ├── Schedule breakdown
│   └── Cultural context
├── RSVP System
│   ├── Guest registration form
│   ├── Attendance confirmation
│   ├── Dietary preferences
│   └── Message collection
├── Gallery Section
│   ├── Engagement photos
│   ├── Lazy loading optimization
│   ├── Lightbox functionality
│   └── Progressive image loading
├── Contact Section
│   ├── Venue information
│   ├── Contact details
│   ├── Map integration
│   └── Transportation info
└── Footer Section
    ├── Social media links
    ├── Thank you message
    └── Website credits
```

### Qwik Framework Patterns

#### Resumability Architecture

```typescript
// Qwik's resumability allows instant page interactivity
// No hydration required - components resume where server left off

export const WeddingComponent = component$(() => {
  // Server-side rendered content resumes instantly
  const guestCount = useSignal(0);

  // Event handlers are serialized and resumed
  const handleRSVP = $((event: SubmitEvent) => {
    // This function resumes without re-execution
    event.preventDefault();
    // Process RSVP logic
  });

  return (
    <section class="wedding-section">
      <form onSubmit$={handleRSVP}>
        {/* Component content */}
      </form>
    </section>
  );
});
```

#### Component Communication Pattern

```typescript
// Parent-Child Communication via Props
interface WeddingComponentProps {
  weddingData: WeddingInfo;
  onUpdate$: QRL<(data: UpdateData) => void>;
}

// Sibling Communication via Shared State
const useWeddingStore = () => {
  const rsvpData = useSignal<RSVPData[]>([]);
  const guestCount = useComputed$(() =>
    rsvpData.value.reduce((sum, rsvp) => sum + rsvp.guests, 0),
  );

  return { rsvpData, guestCount };
};
```

## 🎨 Styling System Architecture

### Wedding Theme Design System

#### Color Palette

```css
:root {
  /* Primary Wedding Colors */
  --wedding-cream: #faf7f5; /* Background base */
  --wedding-beige: #f0e3d9; /* Section backgrounds */
  --wedding-sage: #d9e5e0; /* Accent sections */
  --wedding-lavender: #e0d9e5; /* Romantic accents */

  /* Typography Colors */
  --wedding-brown: #4d3326; /* Primary headings */
  --wedding-accent: #b2804d; /* Interactive elements */
  --wedding-text-primary: #4d3326; /* Body text */
  --wedding-text-secondary: #80664d; /* Subtitles */
  --wedding-text-muted: #998066; /* Captions */
}
```

#### Typography System

```css
/* Typography Hierarchy */
.wedding-heading-primary {
  font-family: "Playfair Display", serif;
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 300;
  color: var(--wedding-brown);
  line-height: 1.2;
}

.wedding-heading-secondary {
  font-family: "Playfair Display", serif;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 400;
  color: var(--wedding-brown);
}

.wedding-body-text {
  font-family: "Inter", sans-serif;
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.7;
  color: var(--wedding-text-secondary);
}
```

#### Component Styling Patterns

```css
/* Section Layout Pattern */
.wedding-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(3rem, 8vw, 5rem) 1rem;
}

/* Interactive Elements */
.wedding-button {
  background: linear-gradient(135deg, var(--wedding-accent), #996b3f);
  color: white;
  padding: 1rem 2rem;
  border-radius: 2rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(178, 128, 77, 0.3);
}

.wedding-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(178, 128, 77, 0.4);
}
```

## 🔧 State Management & Data Flow

### Qwik Signals Architecture

```typescript
// Global Wedding State Management
export const useWeddingState = () => {
  // RSVP Management
  const rsvpList = useSignal<RSVPData[]>([]);
  const totalGuests = useComputed$(() =>
    rsvpList.value.reduce((sum, rsvp) => sum + rsvp.guests, 0),
  );

  // Gallery State
  const galleryPhotos = useSignal<PhotoData[]>([]);
  const currentPhoto = useSignal<number>(0);

  // Navigation State
  const activeSection = useSignal<string>("hero");
  const isMenuOpen = useSignal<boolean>(false);

  return {
    rsvp: { rsvpList, totalGuests },
    gallery: { galleryPhotos, currentPhoto },
    navigation: { activeSection, isMenuOpen },
  };
};
```

### Event Handling Patterns

```typescript
// RSVP Form Handling
export const handleRSVPSubmission = $((formData: RSVPFormData) => {
  // Client-side validation
  const validationResult = validateRSVPData(formData);
  if (!validationResult.isValid) {
    throw new Error(validationResult.message);
  }

  // Submit to backend or store locally
  const rsvpEntry: RSVPData = {
    id: generateRSVPId(),
    timestamp: new Date().toISOString(),
    ...formData,
  };

  // Update state
  rsvpList.value = [...rsvpList.value, rsvpEntry];

  // Trigger success feedback
  showSuccessMessage("RSVP submitted successfully!");
});
```

## 📱 Responsive Design Architecture

### Mobile-First Approach

```css
/* Base Mobile Styles */
.wedding-section {
  padding: 3rem 1rem;
}

.wedding-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

/* Tablet Breakpoint */
@media (min-width: 768px) {
  .wedding-section {
    padding: 4rem 2rem;
  }

  .wedding-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
  }
}

/* Desktop Breakpoint */
@media (min-width: 1024px) {
  .wedding-section {
    padding: 5rem 4rem;
  }

  .wedding-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
  }
}
```

### Performance Optimization Strategy

```typescript
// Lazy Loading Implementation
const LazyGalleryImage = component$<{ src: string; alt: string }>(
  ({ src, alt }) => {
    const isVisible = useSignal(false);
    const imgRef = useSignal<HTMLImageElement>();

    useVisibleTask$(() => {
      if (!imgRef.value) return;

      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          observer.disconnect();
        }
      });

      observer.observe(imgRef.value);
    });

    return (
      <img
        ref={imgRef}
        src={isVisible.value ? src : 'data:image/svg+xml;base64,...'}
        alt={alt}
        loading="lazy"
        class="wedding-gallery-image"
      />
    );
  }
);
```

## 🗂️ File Organization Structure

### Directory Architecture

```
src/
├── components/                 # Reusable UI components
│   ├── navigation.tsx         # Site navigation
│   ├── hero-section.tsx       # Wedding announcement
│   ├── story-section.tsx      # Couple's story
│   ├── details-section.tsx    # Event details
│   ├── rsvp-section.tsx       # RSVP functionality
│   ├── gallery-section.tsx    # Photo gallery
│   ├── contact-section.tsx    # Contact information
│   ├── footer-section.tsx     # Site footer
│   └── common/                # Shared components
│       ├── button.tsx         # Reusable button
│       ├── card.tsx           # Card component
│       └── modal.tsx          # Modal dialog
├── routes/                    # Page routing
│   ├── index.tsx             # Main wedding page
│   ├── rsvp-confirmation.tsx # RSVP success page
│   └── layout.tsx            # Layout wrapper
├── hooks/                     # Custom Qwik hooks
│   ├── use-wedding-state.ts  # Global state management
│   ├── use-rsvp-form.ts      # RSVP form logic
│   └── use-intersection.ts   # Intersection observer
├── utils/                     # Utility functions
│   ├── validation.ts         # Form validation
│   ├── date-format.ts        # Date formatting
│   └── analytics.ts          # Event tracking
├── types/                     # TypeScript definitions
│   ├── wedding.ts            # Wedding-related types
│   ├── rsvp.ts               # RSVP types
│   └── gallery.ts            # Gallery types
└── global.css                # Global styles
```

### Component Module Pattern

```typescript
// Component Index Pattern
// src/components/index.ts
export { Navigation } from "./navigation";
export { HeroSection } from "./hero-section";
export { StorySection } from "./story-section";
export { DetailsSection } from "./details-section";
export { RsvpSection } from "./rsvp-section";
export { GallerySection } from "./gallery-section";
export { ContactSection } from "./contact-section";
export { FooterSection } from "./footer-section";

// Usage in routes
import {
  Navigation,
  HeroSection,
  StorySection,
  // ... other components
} from "../components";
```

## 🧪 Testing Architecture

### Testing Strategy Overview

```typescript
// Unit Testing Pattern
import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { HeroSection } from './hero-section';

test('HeroSection renders correctly', async () => {
  const { screen, render } = await createDOM();
  await render(<HeroSection />);

  expect(screen.querySelector('h1')).toContainText('Alfina & Mugni');
  expect(screen.querySelector('time')).toContainText('November 29, 2025');
});

// Integration Testing
test('RSVP form submission', async () => {
  const { screen, render, userEvent } = await createDOM();
  await render(<RsvpSection />);

  await userEvent.fill('[name="guestName"]', 'John Doe');
  await userEvent.fill('[name="email"]', 'john@example.com');
  await userEvent.click('[type="submit"]');

  expect(screen.querySelector('.success-message')).toBeVisible();
});
```

### E2E Testing Structure

```typescript
// tests/e2e/wedding-flow.spec.ts
import { test, expect } from "@playwright/test";

test("Complete wedding website flow", async ({ page }) => {
  await page.goto("/");

  // Test navigation
  await page.click('nav a[href="#story"]');
  await expect(page.locator("#story")).toBeInViewport();

  // Test RSVP submission
  await page.click('nav a[href="#rsvp"]');
  await page.fill('[name="guestName"]', "Test Guest");
  await page.fill('[name="email"]', "test@example.com");
  await page.selectOption('[name="attendance"]', "yes");
  await page.click('[type="submit"]');

  await expect(page.locator(".rsvp-success")).toBeVisible();
});
```

## 🚀 Deployment Architecture

### Build Process

```bash
# Production Build Pipeline
bun run build.types    # TypeScript compilation
bun run lint           # ESLint validation
bun run test           # Test suite execution
bun run build          # Vite production build
```

### Static Site Generation

```typescript
// vite.config.ts - SSG Configuration
export default defineConfig({
  plugins: [
    qwikVite(),
    qwikCity({
      // SSG for all routes
      ssr: {
        include: ["/", "/rsvp-confirmation"],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["@builder.io/qwik"],
          components: ["./src/components/index.ts"],
        },
      },
    },
  },
});
```

### Performance Targets

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔗 Integration Points

### External Services

```typescript
// Email Service Integration
interface EmailService {
  sendRSVPConfirmation(data: RSVPData): Promise<void>;
  sendRSVPNotification(data: RSVPData): Promise<void>;
}

// Analytics Integration
interface AnalyticsService {
  trackRSVPSubmission(data: RSVPData): void;
  trackPageView(route: string): void;
  trackGalleryInteraction(photoId: string): void;
}
```

### Future Enhancement Architecture

- **CMS Integration**: Headless CMS for content management
- **Real-time Updates**: WebSocket integration for live RSVP count
- **Guest Portal**: Authenticated area for confirmed guests
- **Live Streaming**: Integration for ceremony broadcast
- **Photo Sharing**: Guest photo upload functionality

---

## 📚 Related Documentation

- **Development Setup**: [`../development/setup-guide.md`](../development/setup-guide.md)
- **Component Templates**: [`../examples/component-templates/component-template.md`](../examples/component-templates/component-template.md)
- **Styling Guide**: [`../examples/styling-examples/wedding-theme.md`](../examples/styling-examples/wedding-theme.md)
- **Troubleshooting**: [`../troubleshooting/common-issues.md`](../troubleshooting/common-issues.md)
- **AI Context**: [`../../config/ai/context-templates/development-context.md`](../../config/ai/context-templates/development-context.md)

---

_For questions about this architecture, refer to [`CLAUDE.md`](../../CLAUDE.md) or the development team._

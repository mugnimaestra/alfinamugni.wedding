# Components API Documentation

_Comprehensive TypeScript interfaces and component specifications for Alfina & Mugni's Wedding Website_

---

## Table of Contents

- [Overview](#overview)
- [Component Interfaces](#component-interfaces)
- [Component Specifications](#component-specifications)
- [Props and Configuration](#props-and-configuration)
- [Styling System](#styling-system)
- [Usage Examples](#usage-examples)

---

## Overview

This document provides complete TypeScript interfaces and API specifications for all wedding website components. Built with Qwik framework, each component follows reactive patterns and modern TypeScript best practices.

**Wedding Context:**

- **Couple:** Alfina & Mugni
- **Date:** November 29, 2025
- **Location:** Jakarta, Indonesia
- **Theme:** Elegant, romantic with warm earth tones

---

## Component Interfaces

### Core Component Types

```typescript
import { QwikIntrinsicElements, Component$, Signal } from "@builder.io/qwik";

// Base component props interface
interface WeddingComponentProps {
  class?: string;
  id?: string;
  style?: QwikIntrinsicElements["div"]["style"];
}

// Wedding theme colors interface
interface WeddingTheme {
  cream: string;
  beige: string;
  sage: string;
  lavender: string;
  brown: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}
```

### Hero Section Interface

```typescript
interface HeroSectionProps extends WeddingComponentProps {
  /**
   * Couple names displayed in main heading
   * @default "Alfina & Mugni"
   */
  coupleNames?: string;

  /**
   * Wedding date displayed prominently
   * @default "November 29, 2025"
   */
  weddingDate?: string;

  /**
   * Subtitle message above couple names
   * @default "We're Getting Married!"
   */
  subtitle?: string;

  /**
   * Call-to-action message below date
   * @default "Join us for a celebration of love"
   */
  ctaMessage?: string;

  /**
   * Enable/disable animated scroll indicator
   * @default true
   */
  showScrollIndicator?: boolean;

  /**
   * Background color theme
   * @default "var(--wedding-beige)"
   */
  backgroundColor?: keyof WeddingTheme | string;

  /**
   * Custom styling for main heading
   */
  headingStyle?: QwikIntrinsicElements["h1"]["style"];

  /**
   * Custom styling for date display
   */
  dateStyle?: QwikIntrinsicElements["p"]["style"];
}

export const HeroSection: Component$<HeroSectionProps>;
```

### RSVP Section Interface

```typescript
interface RSVPSectionProps extends WeddingComponentProps {
  /**
   * RSVP deadline date
   * @default "November 15, 2025"
   */
  deadline?: string;

  /**
   * RSVP form action URL or handler
   */
  onRSVPSubmit?: (data: RSVPFormData) => Promise<void>;

  /**
   * Custom RSVP button text
   * @default "RSVP Now"
   */
  buttonText?: string;

  /**
   * Show/hide dress code section
   * @default true
   */
  showDressCode?: boolean;

  /**
   * Dress code details
   */
  dressCode?: {
    main: string;
    restrictions: string;
  };

  /**
   * Show/hide gift registry section
   * @default true
   */
  showGiftRegistry?: boolean;

  /**
   * Gift registry information
   */
  giftRegistry?: {
    message: string;
    details: string;
    registryUrl?: string;
  };

  /**
   * Background theme
   * @default "bg-wedding-cream"
   */
  backgroundTheme?: string;
}

interface RSVPFormData {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  dietaryRestrictions?: string;
  message?: string;
}

export const RsvpSection: Component$<RSVPSectionProps>;
```

### Gallery Section Interface

```typescript
interface PhotoItem {
  id: number | string;
  src?: string;
  alt: string;
  caption?: string;
  bg?: string;
  aspectRatio?: "1/1" | "4/5" | "16/9" | "3/4";
}

interface GallerySectionProps extends WeddingComponentProps {
  /**
   * Array of photos to display
   */
  photos?: PhotoItem[];

  /**
   * Gallery section title
   * @default "Our Journey Together"
   */
  title?: string;

  /**
   * Gallery description text
   * @default "From our first date to the proposal..."
   */
  description?: string;

  /**
   * Grid layout configuration
   * @default "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
   */
  gridLayout?: string;

  /**
   * Enable hover effects on photos
   * @default true
   */
  enableHoverEffects?: boolean;

  /**
   * Photo click handler
   */
  onPhotoClick?: (photo: PhotoItem, index: number) => void;

  /**
   * Enable lightbox modal for photos
   * @default false
   */
  enableLightbox?: boolean;

  /**
   * Maximum number of photos to display
   */
  maxPhotos?: number;

  /**
   * Show placeholder for missing images
   * @default true
   */
  showPlaceholders?: boolean;
}

export const GallerySection: Component$<GallerySectionProps>;
```

### Navigation Interface

```typescript
interface NavItem {
  label: string;
  href: string;
  external?: boolean;
  icon?: string;
}

interface NavigationProps extends WeddingComponentProps {
  /**
   * Navigation menu items
   */
  menuItems?: NavItem[];

  /**
   * Logo or site title
   * @default "A & M"
   */
  logo?: string;

  /**
   * Navigation style variant
   * @default "fixed"
   */
  variant?: "fixed" | "static" | "transparent";

  /**
   * Enable mobile hamburger menu
   * @default true
   */
  mobileMenu?: boolean;

  /**
   * Scroll behavior for navigation visibility
   * @default "show"
   */
  scrollBehavior?: "show" | "hide" | "shrink";

  /**
   * Background opacity when scrolled
   * @default 0.95
   */
  scrollOpacity?: number;

  /**
   * Active section highlighting
   * @default true
   */
  highlightActive?: boolean;
}

export const Navigation: Component$<NavigationProps>;
```

### Details Section Interface

```typescript
interface VenueDetails {
  name: string;
  address: string;
  mapUrl?: string;
  description?: string;
}

interface EventDetails {
  ceremony: {
    time: string;
    venue: VenueDetails;
    duration?: string;
  };
  reception: {
    time: string;
    venue: VenueDetails;
    duration?: string;
  };
}

interface DetailsSectionProps extends WeddingComponentProps {
  /**
   * Event details configuration
   */
  eventDetails?: EventDetails;

  /**
   * Show directions/map links
   * @default true
   */
  showDirections?: boolean;

  /**
   * Enable calendar integration
   * @default true
   */
  enableCalendarAdd?: boolean;

  /**
   * Transportation information
   */
  transportation?: {
    parking: string;
    publicTransport: string;
    shuttleService?: string;
  };

  /**
   * Contact information for questions
   */
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
}

export const DetailsSection: Component$<DetailsSectionProps>;
```

### Story Section Interface

```typescript
interface StoryMilestone {
  year: number | string;
  title: string;
  description: string;
  image?: string;
}

interface StorySectionProps extends WeddingComponentProps {
  /**
   * Our love story milestones
   */
  story?: StoryMilestone[];

  /**
   * Section title
   * @default "Our Love Story"
   */
  title?: string;

  /**
   * Story introduction text
   */
  introduction?: string;

  /**
   * Timeline layout style
   * @default "vertical"
   */
  layout?: "vertical" | "horizontal" | "grid";

  /**
   * Enable story animations
   * @default true
   */
  animateOnScroll?: boolean;

  /**
   * Show story images
   * @default true
   */
  showImages?: boolean;
}

export const StorySection: Component$<StorySectionProps>;
```

### Contact Section Interface

```typescript
interface ContactPerson {
  role: "bride" | "groom" | "family" | "coordinator";
  name: string;
  relation: string;
  phone: string;
  email?: string;
  whatsapp?: string;
}

interface ContactSectionProps extends WeddingComponentProps {
  /**
   * List of contact persons
   */
  contacts?: ContactPerson[];

  /**
   * Show contact form
   * @default true
   */
  showContactForm?: boolean;

  /**
   * Contact form submission handler
   */
  onFormSubmit?: (data: ContactFormData) => Promise<void>;

  /**
   * Emergency contact information
   */
  emergencyContact?: ContactPerson;

  /**
   * Social media links
   */
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
  };
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const ContactSection: Component$<ContactSectionProps>;
```

### Footer Section Interface

```typescript
interface FooterSectionProps extends WeddingComponentProps {
  /**
   * Footer copyright text
   * @default "© 2025 Alfina & Mugni. Made with ❤️"
   */
  copyrightText?: string;

  /**
   * Show social media links
   * @default true
   */
  showSocialLinks?: boolean;

  /**
   * Social media configuration
   */
  socialLinks?: {
    platform: string;
    url: string;
    icon: string;
  }[];

  /**
   * Show back to top button
   * @default true
   */
  showBackToTop?: boolean;

  /**
   * Additional footer links
   */
  additionalLinks?: {
    text: string;
    url: string;
  }[];

  /**
   * Wedding hashtag
   */
  hashtag?: string;
}

export const FooterSection: Component$<FooterSectionProps>;
```

---

## Component Specifications

### Responsive Design Standards

All components implement responsive design with these breakpoints:

```typescript
const breakpoints = {
  sm: "640px", // Mobile landscape
  md: "768px", // Tablet
  lg: "1024px", // Desktop
  xl: "1280px", // Large desktop
  "2xl": "1536px", // Extra large
};
```

### Accessibility Requirements

Each component includes:

- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance (WCAG 2.1 AA)
- Focus management

### Performance Optimization

- Lazy loading for images
- Intersection Observer for animations
- Optimized bundle sizes
- Progressive enhancement

---

## Props and Configuration

### Default Props Configuration

```typescript
export const defaultWeddingConfig = {
  couple: {
    names: "Alfina & Mugni",
    weddingDate: "November 29, 2025",
    location: "Jakarta, Indonesia",
  },
  theme: {
    primary: "var(--wedding-brown)",
    accent: "var(--wedding-accent)",
    background: "var(--wedding-cream)",
  },
  rsvp: {
    deadline: "November 15, 2025",
    enabled: true,
  },
  contact: {
    showForm: true,
    showSocial: true,
  },
} as const;
```

---

## Styling System

### CSS Custom Properties

```css
:root {
  --wedding-cream: #faf7f5;
  --wedding-beige: #f0e3d9;
  --wedding-sage: #d9e5e0;
  --wedding-lavender: #e0d9e5;
  --wedding-brown: #4d3326;
  --wedding-accent: #b2804d;
  --wedding-text-primary: #4d3326;
  --wedding-text-secondary: #80664d;
  --wedding-text-muted: #998066;
}
```

### Utility Classes

```typescript
const weddingUtilities = {
  section: "wedding-section",
  heading: "wedding-heading",
  text: "wedding-text",
  button: "wedding-button",
  card: "wedding-card",
} as const;
```

---

## Usage Examples

### Basic Hero Section

```tsx
import { HeroSection } from "~/components/hero-section";

export default component$(() => {
  return (
    <HeroSection
      coupleNames="Alfina & Mugni"
      weddingDate="November 29, 2025"
      subtitle="We're Getting Married!"
      ctaMessage="Join us for a celebration of love"
      showScrollIndicator={true}
    />
  );
});
```

### RSVP with Custom Handler

```tsx
import { RsvpSection } from "~/components/rsvp-section";

export default component$(() => {
  const handleRSVP = $(async (data: RSVPFormData) => {
    // Custom RSVP handling logic
    await submitRSVP(data);
  });

  return (
    <RsvpSection
      deadline="November 15, 2025"
      onRSVPSubmit={handleRSVP}
      dressCode={{
        main: "Formal Attire",
        restrictions: "Please avoid white or cream colors",
      }}
    />
  );
});
```

### Gallery with Custom Photos

```tsx
import { GallerySection } from "~/components/gallery-section";

export default component$(() => {
  const photos: PhotoItem[] = [
    {
      id: 1,
      src: "/photos/engagement-1.jpg",
      alt: "Engagement photo at sunset",
      caption: "Our engagement day",
    },
    {
      id: 2,
      src: "/photos/proposal.jpg",
      alt: "Proposal moment",
      caption: "The proposal",
    },
  ];

  return (
    <GallerySection
      photos={photos}
      title="Our Journey Together"
      enableLightbox={true}
      gridLayout="grid-cols-1 md:grid-cols-3"
    />
  );
});
```

---

## Related Documentation

- [`utilities-api.md`](./utilities-api.md) - Helper functions and utilities
- [`types-api.md`](./types-api.md) - TypeScript type definitions
- [`../development/setup-guide.md`](../development/setup-guide.md) - Development setup
- [`../examples/component-templates/component-template.md`](../examples/component-templates/component-template.md) - Component templates

---

_Documentation for Alfina & Mugni's Wedding Website - Generated on November 2025_

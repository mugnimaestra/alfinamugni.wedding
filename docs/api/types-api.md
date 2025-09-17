# Types API Documentation

_Complete TypeScript type definitions for Alfina & Mugni's Wedding Website_

---

## Table of Contents

- [Overview](#overview)
- [Core Types](#core-types)
- [Component Prop Types](#component-prop-types)
- [Form Data Types](#form-data-types)
- [API Response Types](#api-response-types)
- [Wedding Domain Types](#wedding-domain-types)
- [UI State Types](#ui-state-types)
- [Utility Types](#utility-types)
- [Type Guards](#type-guards)

---

## Overview

This document provides comprehensive TypeScript type definitions for all aspects of the wedding website. These types ensure type safety, improve developer experience, and serve as living documentation for the codebase.

**Wedding Context:**

- **Couple:** Alfina & Mugni
- **Date:** November 29, 2025
- **Location:** Jakarta, Indonesia
- **Framework:** Qwik with TypeScript

---

## Core Types

### Base Types

```typescript
// Qwik-specific imports
import type {
  QRL,
  Signal,
  Component$,
  QwikIntrinsicElements,
} from "@builder.io/qwik";

/**
 * Base props that all wedding components can accept
 */
export interface BaseWeddingProps {
  /** CSS class names */
  class?: string;
  /** Element ID */
  id?: string;
  /** Inline styles */
  style?: QwikIntrinsicElements["div"]["style"];
  /** Accessibility label */
  "aria-label"?: string;
  /** Additional data attributes */
  [key: `data-${string}`]: string | undefined;
}

/**
 * Props for components that support children
 */
export interface WithChildren {
  children?: any;
}

/**
 * Props for components with loading states
 */
export interface WithLoadingState {
  /** Loading state indicator */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
}

/**
 * Props for components with error handling
 */
export interface WithErrorState {
  /** Error state */
  error?: string | Error | null;
  /** Error callback */
  onError?: QRL<(error: Error) => void>;
}
```

### Wedding Configuration Types

```typescript
/**
 * Wedding theme color palette
 */
export interface WeddingTheme {
  readonly cream: string;
  readonly beige: string;
  readonly sage: string;
  readonly lavender: string;
  readonly brown: string;
  readonly accent: string;
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textMuted: string;
}

/**
 * Wedding couple information
 */
export interface WeddingCouple {
  /** Bride's name */
  bride: {
    name: string;
    fullName: string;
    nicknames?: string[];
  };
  /** Groom's name */
  groom: {
    name: string;
    fullName: string;
    nicknames?: string[];
  };
  /** Combined display name */
  displayName: string;
}

/**
 * Wedding date and time information
 */
export interface WeddingDateTime {
  /** Wedding date */
  date: Date;
  /** Formatted date string */
  dateString: string;
  /** Wedding timezone */
  timezone: string;
  /** Ceremony start time */
  ceremonyTime: string;
  /** Reception start time */
  receptionTime: string;
}

/**
 * Wedding location information
 */
export interface WeddingLocation {
  /** City */
  city: string;
  /** State/Province */
  state?: string;
  /** Country */
  country: string;
  /** Full location string */
  fullLocation: string;
  /** Coordinates for mapping */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

---

## Component Prop Types

### Hero Section Types

```typescript
/**
 * Hero section component props
 */
export interface HeroSectionProps extends BaseWeddingProps {
  /** Couple names to display */
  coupleNames?: string;
  /** Wedding date */
  weddingDate?: string;
  /** Subtitle above names */
  subtitle?: string;
  /** Call-to-action message */
  ctaMessage?: string;
  /** Show animated scroll indicator */
  showScrollIndicator?: boolean;
  /** Background theme variant */
  backgroundVariant?: keyof WeddingTheme;
  /** Custom heading styles */
  headingStyle?: QwikIntrinsicElements["h1"]["style"];
  /** Custom date styles */
  dateStyle?: QwikIntrinsicElements["p"]["style"];
}
```

### Navigation Types

```typescript
/**
 * Navigation menu item
 */
export interface NavMenuItem {
  /** Display label */
  label: string;
  /** Navigation href */
  href: string;
  /** External link indicator */
  external?: boolean;
  /** Icon name or component */
  icon?: string | Component$<any>;
  /** Accessibility label */
  ariaLabel?: string;
}

/**
 * Navigation component props
 */
export interface NavigationProps extends BaseWeddingProps {
  /** Menu items array */
  menuItems?: NavMenuItem[];
  /** Site logo or title */
  logo?: string;
  /** Navigation variant */
  variant?: "fixed" | "static" | "transparent";
  /** Enable mobile menu */
  mobileMenu?: boolean;
  /** Scroll behavior */
  scrollBehavior?: "show" | "hide" | "shrink";
  /** Background opacity when scrolled */
  scrollOpacity?: number;
  /** Highlight active section */
  highlightActive?: boolean;
  /** Menu toggle callback */
  onMenuToggle?: QRL<(isOpen: boolean) => void>;
}
```

### Gallery Types

```typescript
/**
 * Photo item in gallery
 */
export interface PhotoItem {
  /** Unique identifier */
  id: string | number;
  /** Image source URL */
  src?: string;
  /** Alt text for accessibility */
  alt: string;
  /** Photo caption */
  caption?: string;
  /** Background color for placeholder */
  backgroundColor?: string;
  /** Aspect ratio */
  aspectRatio?: "1/1" | "4/5" | "16/9" | "3/4" | "auto";
  /** Additional metadata */
  metadata?: {
    width?: number;
    height?: number;
    photographer?: string;
    location?: string;
    date?: string;
  };
}

/**
 * Gallery section component props
 */
export interface GallerySectionProps
  extends BaseWeddingProps,
    WithLoadingState,
    WithErrorState {
  /** Photos to display */
  photos?: PhotoItem[];
  /** Gallery title */
  title?: string;
  /** Gallery description */
  description?: string;
  /** Grid layout classes */
  gridLayout?: string;
  /** Enable hover effects */
  enableHoverEffects?: boolean;
  /** Photo click handler */
  onPhotoClick?: QRL<(photo: PhotoItem, index: number) => void>;
  /** Enable lightbox modal */
  enableLightbox?: boolean;
  /** Maximum photos to show */
  maxPhotos?: number;
  /** Show placeholders for missing images */
  showPlaceholders?: boolean;
  /** Lazy loading configuration */
  lazyLoading?: {
    enabled: boolean;
    threshold: number;
    rootMargin: string;
  };
}
```

### RSVP Types

```typescript
/**
 * RSVP attendance status
 */
export type RSVPStatus = "attending" | "not-attending" | "maybe" | "pending";

/**
 * RSVP form data
 */
export interface RSVPFormData {
  /** Guest name */
  name: string;
  /** Email address */
  email: string;
  /** Attendance status */
  attending: boolean;
  /** Number of guests */
  guestCount: number;
  /** Dietary restrictions */
  dietaryRestrictions?: string;
  /** Special message */
  message?: string;
  /** Phone number */
  phone?: string;
  /** Plus one name */
  plusOneName?: string;
}

/**
 * RSVP section component props
 */
export interface RSVPSectionProps
  extends BaseWeddingProps,
    WithLoadingState,
    WithErrorState {
  /** RSVP deadline */
  deadline?: string;
  /** RSVP submission handler */
  onRSVPSubmit?: QRL<(data: RSVPFormData) => Promise<RSVPSubmissionResult>>;
  /** Button text */
  buttonText?: string;
  /** Show dress code section */
  showDressCode?: boolean;
  /** Dress code information */
  dressCode?: {
    main: string;
    restrictions: string;
    suggestions?: string[];
  };
  /** Show gift registry section */
  showGiftRegistry?: boolean;
  /** Gift registry information */
  giftRegistry?: {
    message: string;
    details: string;
    registryUrl?: string;
    preferredGifts?: string[];
  };
  /** Background theme */
  backgroundTheme?: string;
}
```

---

## Form Data Types

### Form Validation Types

```typescript
/**
 * Form validation error
 */
export interface FormError {
  /** Field name */
  field: string;
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
}

/**
 * Form validation result
 */
export interface ValidationResult {
  /** Is form valid */
  isValid: boolean;
  /** Validation errors */
  errors: Record<string, string>;
  /** Validation warnings */
  warnings?: Record<string, string>;
}

/**
 * Form field state
 */
export interface FormFieldState<T = any> {
  /** Field value */
  value: T;
  /** Field has been touched */
  touched: boolean;
  /** Field validation error */
  error?: string;
  /** Field is being validated */
  validating?: boolean;
}

/**
 * Form state management
 */
export interface FormState<T extends Record<string, any>> {
  /** Form data */
  data: T;
  /** Field states */
  fields: Record<keyof T, FormFieldState>;
  /** Form is submitting */
  submitting: boolean;
  /** Form submission count */
  submitCount: number;
  /** Form is dirty (has changes) */
  isDirty: boolean;
  /** Form is valid */
  isValid: boolean;
}
```

### Contact Form Types

```typescript
/**
 * Contact form data
 */
export interface ContactFormData {
  /** Sender name */
  name: string;
  /** Email address */
  email: string;
  /** Subject line */
  subject: string;
  /** Message content */
  message: string;
  /** Contact preference */
  contactPreference?: "email" | "phone" | "whatsapp";
  /** Phone number */
  phone?: string;
}

/**
 * Contact person information
 */
export interface ContactPerson {
  /** Person's role */
  role: "bride" | "groom" | "family" | "coordinator" | "vendor";
  /** Full name */
  name: string;
  /** Relationship to couple */
  relation: string;
  /** Phone number */
  phone: string;
  /** Email address */
  email?: string;
  /** WhatsApp number */
  whatsapp?: string;
  /** Photo URL */
  photo?: string;
  /** Availability hours */
  availability?: string;
}
```

---

## API Response Types

### RSVP API Types

```typescript
/**
 * RSVP submission result
 */
export interface RSVPSubmissionResult {
  /** Success status */
  success: boolean;
  /** Response message */
  message: string;
  /** RSVP ID if successful */
  id?: string;
  /** Error details if failed */
  error?: {
    code: string;
    details: string;
    field?: string;
  };
}

/**
 * RSVP retrieval response
 */
export interface RSVPResponse {
  /** RSVP data */
  rsvp: RSVPRecord;
  /** Metadata */
  metadata: {
    submittedAt: string;
    lastModified: string;
    ipAddress?: string;
    userAgent?: string;
  };
}

/**
 * RSVP record in database
 */
export interface RSVPRecord extends RSVPFormData {
  /** Unique ID */
  id: string;
  /** Submission timestamp */
  submittedAt: Date;
  /** Last modified timestamp */
  lastModified: Date;
  /** RSVP status */
  status: RSVPStatus;
  /** Admin notes */
  adminNotes?: string;
}
```

### Guest Management Types

```typescript
/**
 * Guest information
 */
export interface Guest {
  /** Guest ID */
  id: string;
  /** Guest name */
  name: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Guest category */
  category: "family" | "friends" | "colleagues" | "plus-one";
  /** Invited by */
  invitedBy: "bride" | "groom" | "both";
  /** Invitation sent */
  invitationSent: boolean;
  /** RSVP status */
  rsvpStatus: RSVPStatus;
  /** Dietary restrictions */
  dietaryRestrictions?: string[];
  /** Plus one allowed */
  plusOneAllowed: boolean;
  /** Plus one information */
  plusOne?: {
    name?: string;
    attending?: boolean;
  };
}

/**
 * Guest list summary
 */
export interface GuestListSummary {
  /** Total invited */
  totalInvited: number;
  /** Total attending */
  totalAttending: number;
  /** Total not attending */
  totalNotAttending: number;
  /** Pending responses */
  totalPending: number;
  /** Breakdown by category */
  byCategory: Record<Guest["category"], number>;
  /** Breakdown by inviter */
  byInviter: Record<Guest["invitedBy"], number>;
}
```

---

## Wedding Domain Types

### Event Information Types

```typescript
/**
 * Venue information
 */
export interface Venue {
  /** Venue name */
  name: string;
  /** Street address */
  address: string;
  /** City */
  city: string;
  /** State/Province */
  state?: string;
  /** Postal code */
  postalCode?: string;
  /** Country */
  country: string;
  /** Google Maps URL */
  mapUrl?: string;
  /** Venue description */
  description?: string;
  /** Venue website */
  website?: string;
  /** Venue phone */
  phone?: string;
  /** Parking information */
  parking?: string;
  /** Accessibility information */
  accessibility?: string[];
  /** Venue photos */
  photos?: string[];
}

/**
 * Wedding event details
 */
export interface WeddingEvent {
  /** Event type */
  type: "ceremony" | "reception" | "cocktail" | "after-party";
  /** Event name */
  name: string;
  /** Start time */
  startTime: string;
  /** End time */
  endTime?: string;
  /** Venue information */
  venue: Venue;
  /** Dress code */
  dressCode?: string;
  /** Event description */
  description?: string;
  /** Special instructions */
  instructions?: string[];
}

/**
 * Complete wedding schedule
 */
export interface WeddingSchedule {
  /** Wedding date */
  date: Date;
  /** List of events */
  events: WeddingEvent[];
  /** Timeline notes */
  notes?: string[];
  /** Emergency contacts */
  emergencyContacts?: ContactPerson[];
}
```

### Story and Timeline Types

```typescript
/**
 * Relationship milestone
 */
export interface StoryMilestone {
  /** Milestone ID */
  id: string;
  /** Date of milestone */
  date: Date;
  /** Milestone title */
  title: string;
  /** Description */
  description: string;
  /** Associated image */
  image?: string;
  /** Location */
  location?: string;
  /** Milestone type */
  type:
    | "first-meeting"
    | "first-date"
    | "relationship"
    | "engagement"
    | "other";
}

/**
 * Complete love story
 */
export interface LoveStory {
  /** Story title */
  title: string;
  /** Story introduction */
  introduction: string;
  /** Story milestones */
  milestones: StoryMilestone[];
  /** Story conclusion */
  conclusion?: string;
}
```

---

## UI State Types

### Loading and Error States

```typescript
/**
 * Async operation state
 */
export type AsyncState<T, E = Error> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: E };

/**
 * Component loading state
 */
export interface LoadingState {
  /** Is loading */
  loading: boolean;
  /** Loading message */
  message?: string;
  /** Progress percentage */
  progress?: number;
}

/**
 * Component error state
 */
export interface ErrorState {
  /** Error object */
  error: Error | null;
  /** Error message */
  message?: string;
  /** Error code */
  code?: string;
  /** Recovery suggestions */
  suggestions?: string[];
}
```

### Modal and Dialog Types

```typescript
/**
 * Modal configuration
 */
export interface ModalConfig {
  /** Modal title */
  title?: string;
  /** Modal content */
  content?: any;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Custom styles */
  styles?: {
    backdrop?: string;
    modal?: string;
    content?: string;
  };
}

/**
 * Dialog actions
 */
export interface DialogAction {
  /** Action label */
  label: string;
  /** Action handler */
  action: QRL<() => void | Promise<void>>;
  /** Action variant */
  variant?: "primary" | "secondary" | "danger";
  /** Action disabled state */
  disabled?: boolean;
}

/**
 * Confirmation dialog props
 */
export interface ConfirmationDialogProps {
  /** Dialog title */
  title: string;
  /** Dialog message */
  message: string;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm action */
  onConfirm: QRL<() => void | Promise<void>>;
  /** Cancel action */
  onCancel: QRL<() => void>;
  /** Dangerous action indicator */
  dangerous?: boolean;
}
```

---

## Utility Types

### Helper Types

```typescript
/**
 * Make specific properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties required
 */
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Exclude null and undefined
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Event handler type
 */
export type EventHandler<T = Event> = QRL<(event: T) => void>;

/**
 * Async event handler type
 */
export type AsyncEventHandler<T = Event> = QRL<(event: T) => Promise<void>>;

/**
 * Component with ref
 */
export type ComponentWithRef<T extends HTMLElement = HTMLElement> = {
  ref?: Signal<T | undefined>;
};
```

### Date and Time Types

```typescript
/**
 * Date range
 */
export interface DateRange {
  /** Start date */
  start: Date;
  /** End date */
  end: Date;
}

/**
 * Time of day
 */
export interface TimeOfDay {
  /** Hour (0-23) */
  hour: number;
  /** Minute (0-59) */
  minute: number;
  /** Second (0-59) */
  second?: number;
}

/**
 * Timezone information
 */
export interface TimezoneInfo {
  /** Timezone identifier */
  id: string;
  /** Timezone name */
  name: string;
  /** UTC offset in minutes */
  offset: number;
  /** Daylight saving time active */
  dst: boolean;
}
```

---

## Type Guards

### Runtime Type Checking

```typescript
/**
 * Type guard for checking if value is defined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Type guard for checking if value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

/**
 * Type guard for checking if object is PhotoItem
 */
export function isPhotoItem(obj: unknown): obj is PhotoItem {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    "alt" in obj &&
    (typeof (obj as any).id === "string" ||
      typeof (obj as any).id === "number") &&
    typeof (obj as any).alt === "string"
  );
}

/**
 * Type guard for checking if object is RSVPFormData
 */
export function isRSVPFormData(obj: unknown): obj is RSVPFormData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "name" in obj &&
    "email" in obj &&
    "attending" in obj &&
    "guestCount" in obj &&
    typeof (obj as any).name === "string" &&
    typeof (obj as any).email === "string" &&
    typeof (obj as any).attending === "boolean" &&
    typeof (obj as any).guestCount === "number"
  );
}

/**
 * Type guard for checking if error is validation error
 */
export function isValidationError(error: unknown): error is ValidationResult {
  return (
    typeof error === "object" &&
    error !== null &&
    "isValid" in error &&
    "errors" in error &&
    typeof (error as any).isValid === "boolean" &&
    typeof (error as any).errors === "object"
  );
}
```

---

## Related Documentation

- [`components-api.md`](./components-api.md) - Component interfaces and specifications
- [`utilities-api.md`](./utilities-api.md) - Helper functions and utilities
- [`../development/setup-guide.md`](../development/setup-guide.md) - Development setup
- [`../examples/component-templates/component-template.md`](../examples/component-templates/component-template.md) - Component examples

---

_Documentation for Alfina & Mugni's Wedding Website - Generated on November 2025_

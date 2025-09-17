# Utilities API Documentation

_Helper functions, utilities, and shared functionality for Alfina & Mugni's Wedding Website_

---

## Table of Contents

- [Overview](#overview)
- [Date & Time Utilities](#date--time-utilities)
- [Form Validation Utilities](#form-validation-utilities)
- [Animation Utilities](#animation-utilities)
- [Wedding Theme Utilities](#wedding-theme-utilities)
- [RSVP Management Utilities](#rsvp-management-utilities)
- [Image & Media Utilities](#image--media-utilities)
- [Navigation Utilities](#navigation-utilities)
- [Local Storage Utilities](#local-storage-utilities)
- [API Integration Utilities](#api-integration-utilities)

---

## Overview

This document provides comprehensive documentation for all utility functions used throughout the wedding website. These utilities handle common functionality like date formatting, form validation, animations, and wedding-specific operations.

**Wedding Context:**

- **Couple:** Alfina & Mugni
- **Date:** November 29, 2025
- **Location:** Jakarta, Indonesia
- **Timezone:** Asia/Jakarta (UTC+7)

---

## Date & Time Utilities

### Date Formatting Functions

```typescript
/**
 * Formats a date for display in wedding context
 * @param date - Date to format
 * @param format - Format style ('full', 'short', 'elegant')
 * @returns Formatted date string
 */
export function formatWeddingDate(
  date: Date | string,
  format: "full" | "short" | "elegant" = "elegant",
): string {
  const weddingDate = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "Asia/Jakarta",
    ...(format === "full" && {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    ...(format === "short" && {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    ...(format === "elegant" && {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  return weddingDate.toLocaleDateString("en-US", options);
}

/**
 * Calculates countdown to wedding day
 * @param weddingDate - Wedding date
 * @returns Countdown object with days, hours, minutes, seconds
 */
export function getWeddingCountdown(weddingDate: Date | string) {
  const wedding =
    typeof weddingDate === "string" ? new Date(weddingDate) : weddingDate;
  const now = new Date();
  const timeDiff = wedding.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

/**
 * Checks if current date is past RSVP deadline
 * @param deadline - RSVP deadline date
 * @returns Boolean indicating if deadline has passed
 */
export function isRSVPDeadlinePassed(deadline: Date | string): boolean {
  const deadlineDate =
    typeof deadline === "string" ? new Date(deadline) : deadline;
  return new Date() > deadlineDate;
}

/**
 * Formats time for event schedule display
 * @param time - Time string (HH:MM)
 * @param locale - Locale for formatting ('en-US', 'id-ID')
 * @returns Formatted time string
 */
export function formatEventTime(
  time: string,
  locale: "en-US" | "id-ID" = "en-US",
): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Jakarta",
  });
}
```

---

## Form Validation Utilities

### RSVP Form Validation

```typescript
interface RSVPFormData {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
  dietaryRestrictions?: string;
  message?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates RSVP form data
 * @param data - RSVP form data to validate
 * @returns Validation result with errors
 */
export function validateRSVPForm(data: RSVPFormData): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name?.trim()) {
    errors.name = "Name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  // Email validation
  if (!data.email?.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Guest count validation
  if (data.attending && (!data.guestCount || data.guestCount < 1)) {
    errors.guestCount = "Please specify number of guests";
  } else if (data.guestCount > 10) {
    errors.guestCount = "Maximum 10 guests allowed";
  }

  // Message length validation
  if (data.message && data.message.length > 500) {
    errors.message = "Message must be less than 500 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns Boolean indicating valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Sanitizes user input for security
 * @param input - User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}
```

---

## Animation Utilities

### Scroll-based Animations

```typescript
/**
 * Observes elements for scroll-based animations
 * @param selector - CSS selector for elements to observe
 * @param options - Intersection observer options
 */
export function initScrollAnimations(
  selector: string = ".animate-on-scroll",
  options: IntersectionObserverInit = {},
): void {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px 0px -100px 0px",
    threshold: 0.1,
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        entry.target.classList.remove("animate-out");
      } else {
        entry.target.classList.add("animate-out");
        entry.target.classList.remove("animate-in");
      }
    });
  }, defaultOptions);

  document.querySelectorAll(selector).forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Smooth scroll to element with offset
 * @param elementId - Target element ID
 * @param offset - Offset from top in pixels
 */
export function smoothScrollTo(elementId: string, offset: number = 80): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const elementPosition = element.offsetTop - offset;

  window.scrollTo({
    top: elementPosition,
    behavior: "smooth",
  });
}

/**
 * Creates parallax effect for hero sections
 * @param selector - CSS selector for parallax elements
 * @param speed - Parallax speed factor (0-1)
 */
export function initParallaxEffect(
  selector: string = ".parallax",
  speed: number = 0.5,
): void {
  const elements = document.querySelectorAll(selector);

  const handleScroll = () => {
    const scrolled = window.pageYOffset;

    elements.forEach((element) => {
      const rate = scrolled * -speed;
      (element as HTMLElement).style.transform = `translateY(${rate}px)`;
    });
  };

  window.addEventListener("scroll", handleScroll);
}
```

---

## Wedding Theme Utilities

### Theme Management

```typescript
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

/**
 * Gets wedding theme colors
 * @returns Wedding theme color object
 */
export function getWeddingTheme(): WeddingTheme {
  return {
    cream: "#faf7f5",
    beige: "#f0e3d9",
    sage: "#d9e5e0",
    lavender: "#e0d9e5",
    brown: "#4d3326",
    accent: "#b2804d",
    textPrimary: "#4d3326",
    textSecondary: "#80664d",
    textMuted: "#998066",
  };
}

/**
 * Applies theme to CSS custom properties
 * @param theme - Theme object to apply
 */
export function applyWeddingTheme(theme: Partial<WeddingTheme> = {}): void {
  const defaultTheme = getWeddingTheme();
  const finalTheme = { ...defaultTheme, ...theme };

  Object.entries(finalTheme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--wedding-${key}`, value);
  });
}

/**
 * Generates contrast-safe text color for background
 * @param backgroundColor - Background color hex
 * @returns Appropriate text color (light/dark)
 */
export function getContrastTextColor(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#4d3326" : "#faf7f5";
}
```

---

## RSVP Management Utilities

### RSVP Data Handling

```typescript
interface RSVPData extends RSVPFormData {
  id: string;
  submittedAt: Date;
  status: "pending" | "confirmed" | "declined";
}

/**
 * Submits RSVP data to backend
 * @param data - RSVP form data
 * @returns Promise with submission result
 */
export async function submitRSVP(
  data: RSVPFormData,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to submit RSVP");
    }

    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generates RSVP confirmation message
 * @param data - RSVP data
 * @returns Formatted confirmation message
 */
export function generateRSVPConfirmation(data: RSVPFormData): string {
  const { name, attending, guestCount } = data;

  if (attending) {
    const guestText = guestCount === 1 ? "guest" : "guests";
    return `Thank you ${name}! We're excited to celebrate with you${guestCount > 1 ? ` and your ${guestCount - 1} ${guestText}` : ""} on November 29, 2025.`;
  } else {
    return `Thank you ${name} for letting us know. We'll miss you on our special day, but we understand.`;
  }
}

/**
 * Creates calendar event data for RSVP confirmation
 * @param attending - Whether guest is attending
 * @returns Calendar event object
 */
export function createCalendarEvent(attending: boolean) {
  if (!attending) return null;

  const weddingDate = new Date("2025-11-29T14:00:00+07:00"); // 2 PM Jakarta time
  const endDate = new Date("2025-11-29T22:00:00+07:00"); // 10 PM Jakarta time

  return {
    title: "Alfina & Mugni Wedding",
    startDate: weddingDate,
    endDate: endDate,
    description:
      "Join us for a celebration of love as Alfina and Mugni tie the knot!",
    location: "Jakarta, Indonesia",
  };
}
```

---

## Image & Media Utilities

### Image Handling

```typescript
/**
 * Optimizes image URLs for different screen sizes
 * @param src - Original image URL
 * @param width - Target width
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
export function optimizeImageUrl(
  src: string,
  width: number,
  quality: number = 80,
): string {
  // For production, this would integrate with image optimization service
  // For now, return original URL
  return src;
}

/**
 * Lazy loads images with intersection observer
 * @param selector - CSS selector for images to lazy load
 */
export function initLazyLoading(selector: string = "img[data-src]"): void {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;

        if (src) {
          img.src = src;
          img.removeAttribute("data-src");
          img.classList.add("loaded");
          imageObserver.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll(selector).forEach((img) => {
    imageObserver.observe(img);
  });
}

/**
 * Creates placeholder for missing gallery images
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @param backgroundColor - Background color
 * @returns Data URL for placeholder image
 */
export function createImagePlaceholder(
  width: number = 400,
  height: number = 500,
  backgroundColor: string = "#f0e3d9",
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  if (ctx) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Add camera icon
    ctx.fillStyle = "#998066";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📷", width / 2, height / 2 + 16);
  }

  return canvas.toDataURL();
}
```

---

## Navigation Utilities

### Navigation Management

```typescript
/**
 * Gets current active section based on scroll position
 * @param sections - Array of section IDs
 * @param offset - Offset from top for active detection
 * @returns Active section ID
 */
export function getActiveSection(
  sections: string[],
  offset: number = 100,
): string | null {
  const scrollY = window.scrollY + offset;

  for (let i = sections.length - 1; i >= 0; i--) {
    const section = document.getElementById(sections[i]);
    if (section && section.offsetTop <= scrollY) {
      return sections[i];
    }
  }

  return sections[0] || null;
}

/**
 * Initializes navigation highlighting based on scroll
 * @param navSelector - CSS selector for navigation links
 * @param sections - Array of section IDs to track
 */
export function initNavigationHighlight(
  navSelector: string = 'nav a[href^="#"]',
  sections: string[] = [
    "hero",
    "story",
    "details",
    "gallery",
    "rsvp",
    "contact",
  ],
): void {
  const updateActiveNav = () => {
    const activeSection = getActiveSection(sections);
    const navLinks = document.querySelectorAll(navSelector);

    navLinks.forEach((link) => {
      const href = (link as HTMLAnchorElement).getAttribute("href");
      const sectionId = href?.substring(1);

      if (sectionId === activeSection) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  };

  window.addEventListener("scroll", updateActiveNav);
  updateActiveNav(); // Initial call
}

/**
 * Handles mobile menu toggle
 * @param menuSelector - CSS selector for mobile menu
 * @param toggleSelector - CSS selector for menu toggle button
 */
export function initMobileMenu(
  menuSelector: string = ".mobile-menu",
  toggleSelector: string = ".menu-toggle",
): void {
  const menu = document.querySelector(menuSelector);
  const toggle = document.querySelector(toggleSelector);

  if (!menu || !toggle) return;

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
    toggle.classList.toggle("active");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !menu.contains(e.target as Node) &&
      !toggle.contains(e.target as Node)
    ) {
      menu.classList.remove("open");
      toggle.classList.remove("active");
    }
  });
}
```

---

## Local Storage Utilities

### Data Persistence

```typescript
/**
 * Saves RSVP draft to local storage
 * @param data - Partial RSVP form data
 */
export function saveRSVPDraft(data: Partial<RSVPFormData>): void {
  try {
    localStorage.setItem("rsvp-draft", JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save RSVP draft:", error);
  }
}

/**
 * Loads RSVP draft from local storage
 * @returns Saved RSVP draft data or null
 */
export function loadRSVPDraft(): Partial<RSVPFormData> | null {
  try {
    const draft = localStorage.getItem("rsvp-draft");
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.warn("Failed to load RSVP draft:", error);
    return null;
  }
}

/**
 * Clears RSVP draft from local storage
 */
export function clearRSVPDraft(): void {
  try {
    localStorage.removeItem("rsvp-draft");
  } catch (error) {
    console.warn("Failed to clear RSVP draft:", error);
  }
}

/**
 * Saves user preferences to local storage
 * @param preferences - User preferences object
 */
export function saveUserPreferences(preferences: Record<string, any>): void {
  try {
    localStorage.setItem("wedding-preferences", JSON.stringify(preferences));
  } catch (error) {
    console.warn("Failed to save preferences:", error);
  }
}

/**
 * Loads user preferences from local storage
 * @returns Saved preferences or default values
 */
export function loadUserPreferences(): Record<string, any> {
  try {
    const prefs = localStorage.getItem("wedding-preferences");
    return prefs ? JSON.parse(prefs) : {};
  } catch (error) {
    console.warn("Failed to load preferences:", error);
    return {};
  }
}
```

---

## API Integration Utilities

### External Service Integration

```typescript
/**
 * Integrates with Google Maps for venue directions
 * @param address - Venue address
 * @returns Google Maps URL
 */
export function getDirectionsUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address);
  return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
}

/**
 * Generates WhatsApp contact URL
 * @param phoneNumber - Phone number in international format
 * @param message - Pre-filled message
 * @returns WhatsApp URL
 */
export function getWhatsAppUrl(
  phoneNumber: string,
  message: string = "",
): string {
  const cleanNumber = phoneNumber.replace(/[^\d]/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}${message ? `?text=${encodedMessage}` : ""}`;
}

/**
 * Creates calendar download link
 * @param eventData - Event data object
 * @returns Calendar file blob URL
 */
export function createCalendarDownload(eventData: {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  location: string;
}): string {
  const { title, startDate, endDate, description, location } = eventData;

  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[:-]/g, "").split(".")[0] + "Z";
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Website//EN",
    "BEGIN:VEVENT",
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar" });
  return URL.createObjectURL(blob);
}

/**
 * Shares wedding details via Web Share API
 * @param details - Wedding details to share
 */
export async function shareWeddingDetails(details: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<boolean> {
  if (!navigator.share) {
    // Fallback for browsers without Web Share API
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(details.url || window.location.href);
      return true;
    }
    return false;
  }

  try {
    await navigator.share({
      title: details.title || "Alfina & Mugni Wedding",
      text:
        details.text ||
        "Join us for our wedding celebration on November 29, 2025!",
      url: details.url || window.location.href,
    });
    return true;
  } catch (error) {
    console.warn("Failed to share:", error);
    return false;
  }
}
```

---

## Related Documentation

- [`components-api.md`](./components-api.md) - Component interfaces and specifications
- [`types-api.md`](./types-api.md) - TypeScript type definitions
- [`../development/setup-guide.md`](../development/setup-guide.md) - Development setup
- [`../examples/integration-examples/third-party-integrations.md`](../examples/integration-examples/third-party-integrations.md) - Integration examples

---

_Documentation for Alfina & Mugni's Wedding Website - Generated on November 2025_

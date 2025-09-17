# Wedding Theme Design System

**Alfina & Mugni's Wedding Website - Complete Design System & Styling Guide**

_This document provides comprehensive styling guidelines, design tokens, and implementation patterns for the wedding website's visual design system._

## 🎨 Design Philosophy

### Wedding Design Principles

- **Romantic Elegance**: Sophisticated design reflecting the couple's refined taste
- **Indonesian Heritage**: Subtle cultural elements and warm color palette
- **Timeless Beauty**: Classic design that will age gracefully
- **Accessibility First**: Inclusive design for all wedding guests
- **Mobile Excellence**: Optimized for mobile-first guest experience

### Visual Identity Goals

- Create an intimate, welcoming atmosphere
- Reflect the November 29, 2025 Jakarta celebration
- Balance modern web design with romantic aesthetics
- Ensure readability across all devices and lighting conditions

## 🌈 Color Palette

### Primary Wedding Colors

```css
:root {
  /* Primary Brand Colors */
  --wedding-cream: #faf7f5; /* Soft cream background */
  --wedding-beige: #f0e3d9; /* Warm section backgrounds */
  --wedding-sage: #d9e5e0; /* Gentle sage accents */
  --wedding-lavender: #e0d9e5; /* Romantic lavender touches */

  /* Primary Text & Interactive Colors */
  --wedding-brown: #4d3326; /* Primary headings & navigation */
  --wedding-accent: #b2804d; /* Interactive elements & CTAs */
  --wedding-gold: #d4af37; /* Special highlights & borders */

  /* Text Hierarchy */
  --wedding-text-primary: #4d3326; /* Primary body text */
  --wedding-text-secondary: #80664d; /* Secondary text & subtitles */
  --wedding-text-muted: #998066; /* Captions & less important text */
  --wedding-text-light: #b8a899; /* Placeholder text & disabled states */

  /* Semantic Colors */
  --wedding-success: #10b981; /* Success states & confirmations */
  --wedding-warning: #f59e0b; /* Warning states & alerts */
  --wedding-error: #ef4444; /* Error states & validation */
  --wedding-info: #3b82f6; /* Information & links */

  /* Neutral Grays */
  --wedding-white: #ffffff; /* Pure white for contrasts */
  --wedding-gray-50: #f9fafb; /* Very light gray */
  --wedding-gray-100: #f3f4f6; /* Light gray borders */
  --wedding-gray-200: #e5e7eb; /* Medium light gray */
  --wedding-gray-300: #d1d5db; /* Medium gray */
  --wedding-gray-400: #9ca3af; /* Medium dark gray */
  --wedding-gray-500: #6b7280; /* Dark gray */
  --wedding-gray-600: #4b5563; /* Very dark gray */
  --wedding-gray-700: #374151; /* Almost black */
  --wedding-gray-800: #1f2937; /* Near black */
  --wedding-gray-900: #111827; /* Pure black alternative */
}
```

### Color Usage Guidelines

#### Background Colors

```css
/* Section Backgrounds */
.bg-wedding-cream {
  background-color: var(--wedding-cream);
}
.bg-wedding-beige {
  background-color: var(--wedding-beige);
}
.bg-wedding-sage {
  background-color: var(--wedding-sage);
}
.bg-wedding-lavender {
  background-color: var(--wedding-lavender);
}

/* Gradient Backgrounds */
.bg-wedding-gradient-primary {
  background: linear-gradient(
    135deg,
    var(--wedding-cream),
    var(--wedding-beige)
  );
}

.bg-wedding-gradient-romantic {
  background: linear-gradient(
    45deg,
    var(--wedding-sage),
    var(--wedding-lavender)
  );
}

.bg-wedding-gradient-warm {
  background: linear-gradient(
    135deg,
    var(--wedding-beige),
    var(--wedding-accent)
  );
}
```

#### Text Colors

```css
/* Text Color Classes */
.text-wedding-primary {
  color: var(--wedding-text-primary);
}
.text-wedding-secondary {
  color: var(--wedding-text-secondary);
}
.text-wedding-muted {
  color: var(--wedding-text-muted);
}
.text-wedding-light {
  color: var(--wedding-text-light);
}
.text-wedding-brown {
  color: var(--wedding-brown);
}
.text-wedding-accent {
  color: var(--wedding-accent);
}
.text-wedding-gold {
  color: var(--wedding-gold);
}
```

#### Interactive Colors

```css
/* Button & Link States */
.interactive-wedding-primary {
  background: linear-gradient(135deg, var(--wedding-accent), #996b3f);
  color: var(--wedding-white);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-wedding-primary:hover {
  background: linear-gradient(135deg, #996b3f, var(--wedding-accent));
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(178, 128, 77, 0.4);
}

.interactive-wedding-secondary {
  background: transparent;
  color: var(--wedding-accent);
  border: 2px solid var(--wedding-accent);
}

.interactive-wedding-secondary:hover {
  background: var(--wedding-accent);
  color: var(--wedding-white);
}
```

## 🔤 Typography System

### Font Families

```css
:root {
  /* Primary Font Stack */
  --font-family-serif: "Playfair Display", "Georgia", serif;
  --font-family-sans: "Inter", "Helvetica Neue", "Arial", sans-serif;
  --font-family-mono: "JetBrains Mono", "Monaco", "Courier New", monospace;
}

/* Google Fonts Import */
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap");
```

### Typography Scale

```css
/* Heading Styles */
.wedding-heading-xl {
  font-family: var(--font-family-serif);
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 300;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--wedding-brown);
}

.wedding-heading-lg {
  font-family: var(--font-family-serif);
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--wedding-brown);
}

.wedding-heading-md {
  font-family: var(--font-family-serif);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 400;
  line-height: 1.3;
  color: var(--wedding-brown);
}

.wedding-heading-sm {
  font-family: var(--font-family-serif);
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 400;
  line-height: 1.4;
  color: var(--wedding-accent);
}

.wedding-heading-xs {
  font-family: var(--font-family-serif);
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 500;
  line-height: 1.4;
  color: var(--wedding-accent);
}

/* Body Text Styles */
.wedding-body-lg {
  font-family: var(--font-family-sans);
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 400;
  line-height: 1.7;
  color: var(--wedding-text-secondary);
}

.wedding-body-md {
  font-family: var(--font-family-sans);
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 400;
  line-height: 1.6;
  color: var(--wedding-text-secondary);
}

.wedding-body-sm {
  font-family: var(--font-family-sans);
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  font-weight: 400;
  line-height: 1.5;
  color: var(--wedding-text-muted);
}

.wedding-body-xs {
  font-family: var(--font-family-sans);
  font-size: clamp(0.75rem, 1.25vw, 0.875rem);
  font-weight: 400;
  line-height: 1.4;
  color: var(--wedding-text-muted);
}

/* Special Text Styles */
.wedding-script {
  font-family: var(--font-family-serif);
  font-style: italic;
  font-weight: 300;
  color: var(--wedding-accent);
}

.wedding-caps {
  font-family: var(--font-family-sans);
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--wedding-text-muted);
}

.wedding-quote {
  font-family: var(--font-family-serif);
  font-style: italic;
  font-size: 1.25rem;
  color: var(--wedding-text-secondary);
  border-left: 3px solid var(--wedding-accent);
  padding-left: 1.5rem;
  margin: 2rem 0;
}
```

### Responsive Typography

```css
/* Responsive Typography Utilities */
@media (max-width: 768px) {
  .wedding-heading-xl {
    font-size: clamp(2.5rem, 10vw, 3.5rem);
  }
  .wedding-heading-lg {
    font-size: clamp(2rem, 8vw, 2.5rem);
  }
  .wedding-heading-md {
    font-size: clamp(1.75rem, 6vw, 2rem);
  }
  .wedding-heading-sm {
    font-size: clamp(1.5rem, 5vw, 1.75rem);
  }

  .wedding-body-lg {
    font-size: 1.125rem;
  }
  .wedding-body-md {
    font-size: 1rem;
  }
  .wedding-body-sm {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .wedding-heading-xl {
    font-size: clamp(2rem, 12vw, 3rem);
  }
  .wedding-heading-lg {
    font-size: clamp(1.75rem, 10vw, 2.25rem);
  }

  .wedding-quote {
    font-size: 1.125rem;
    padding-left: 1rem;
    margin: 1.5rem 0;
  }
}
```

## 📐 Spacing & Layout System

### Spacing Scale

```css
:root {
  /* Spacing Scale (based on 8px grid) */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */
  --space-32: 8rem; /* 128px */
  --space-40: 10rem; /* 160px */
  --space-48: 12rem; /* 192px */
  --space-64: 16rem; /* 256px */

  /* Wedding-specific spacing */
  --wedding-section-padding: clamp(3rem, 8vw, 5rem);
  --wedding-container-padding: clamp(1rem, 4vw, 2rem);
  --wedding-component-gap: clamp(1.5rem, 4vw, 3rem);
}
```

### Layout Components

```css
/* Container System */
.wedding-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--wedding-container-padding);
  width: 100%;
}

.wedding-container--narrow {
  max-width: 800px;
}

.wedding-container--wide {
  max-width: 1400px;
}

.wedding-container--full {
  max-width: none;
  padding: 0;
}

/* Section Layout */
.wedding-section {
  padding: var(--wedding-section-padding) 0;
  position: relative;
}

.wedding-section--hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wedding-section--compact {
  padding: clamp(2rem, 5vw, 3rem) 0;
}

.wedding-section--spacious {
  padding: clamp(4rem, 10vw, 8rem) 0;
}

/* Grid System */
.wedding-grid {
  display: grid;
  gap: var(--wedding-component-gap);
}

.wedding-grid--2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.wedding-grid--3 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.wedding-grid--4 {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* Flexbox Utilities */
.wedding-flex {
  display: flex;
  gap: var(--space-4);
}

.wedding-flex--column {
  flex-direction: column;
}

.wedding-flex--center {
  align-items: center;
  justify-content: center;
}

.wedding-flex--between {
  justify-content: space-between;
}

.wedding-flex--wrap {
  flex-wrap: wrap;
}
```

### Responsive Layout

```css
/* Responsive Grid Adjustments */
@media (max-width: 768px) {
  .wedding-grid--2,
  .wedding-grid--3,
  .wedding-grid--4 {
    grid-template-columns: 1fr;
  }

  .wedding-container {
    padding: 0 var(--space-4);
  }

  .wedding-section {
    padding: clamp(2rem, 6vw, 3rem) 0;
  }
}

@media (max-width: 480px) {
  .wedding-container {
    padding: 0 var(--space-3);
  }

  .wedding-section {
    padding: var(--space-16) 0;
  }

  .wedding-flex {
    gap: var(--space-3);
  }
}
```

## 🎯 Component Styling Patterns

### Button Components

```css
/* Base Button Styles */
.wedding-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4) var(--space-8);
  border-radius: 2rem;
  font-family: var(--font-family-sans);
  font-weight: 500;
  font-size: 1rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

/* Button Variants */
.wedding-button--primary {
  background: linear-gradient(135deg, var(--wedding-accent), #996b3f);
  color: var(--wedding-white);
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

.wedding-button--secondary {
  background: transparent;
  color: var(--wedding-accent);
  border: 2px solid var(--wedding-accent);
}

.wedding-button--secondary:hover {
  background: var(--wedding-accent);
  color: var(--wedding-white);
}

.wedding-button--ghost {
  background: transparent;
  color: var(--wedding-text-secondary);
  border: 1px solid var(--wedding-gray-300);
}

.wedding-button--ghost:hover {
  background: var(--wedding-gray-50);
  border-color: var(--wedding-accent);
  color: var(--wedding-accent);
}

/* Button Sizes */
.wedding-button--small {
  padding: var(--space-2) var(--space-6);
  font-size: 0.875rem;
}

.wedding-button--large {
  padding: var(--space-5) var(--space-12);
  font-size: 1.125rem;
}

.wedding-button--full {
  width: 100%;
}

/* Button States */
.wedding-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.wedding-button--loading {
  color: transparent;
}

.wedding-button--loading::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  top: 50%;
  left: 50%;
  margin-left: -8px;
  margin-top: -8px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: wedding-spin 1s linear infinite;
}
```

### Card Components

```css
/* Base Card Styles */
.wedding-card {
  background: var(--wedding-white);
  border-radius: 1rem;
  padding: var(--space-8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--wedding-gray-100);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wedding-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Card Variants */
.wedding-card--elevated {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.wedding-card--bordered {
  border: 2px solid var(--wedding-accent);
  box-shadow: none;
}

.wedding-card--romantic {
  background: linear-gradient(
    135deg,
    var(--wedding-cream),
    var(--wedding-beige)
  );
  border: 1px solid var(--wedding-accent);
}

/* Card Components */
.wedding-card-header {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--wedding-gray-100);
}

.wedding-card-title {
  font-family: var(--font-family-serif);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--wedding-brown);
  margin-bottom: var(--space-2);
}

.wedding-card-subtitle {
  color: var(--wedding-text-muted);
  font-size: 0.875rem;
}

.wedding-card-content {
  margin-bottom: var(--space-6);
}

.wedding-card-footer {
  padding-top: var(--space-4);
  border-top: 1px solid var(--wedding-gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### Form Components

```css
/* Form Base Styles */
.wedding-form {
  max-width: 600px;
  margin: 0 auto;
}

.wedding-form-group {
  margin-bottom: var(--space-6);
}

/* Label Styles */
.wedding-label {
  display: block;
  font-family: var(--font-family-sans);
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--wedding-text-primary);
  margin-bottom: var(--space-2);
}

.wedding-label--required::after {
  content: " *";
  color: var(--wedding-error);
}

/* Input Styles */
.wedding-input,
.wedding-textarea,
.wedding-select {
  width: 100%;
  padding: var(--space-4);
  border: 2px solid var(--wedding-gray-200);
  border-radius: 0.5rem;
  font-family: var(--font-family-sans);
  font-size: 1rem;
  background: var(--wedding-white);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wedding-input:focus,
.wedding-textarea:focus,
.wedding-select:focus {
  outline: none;
  border-color: var(--wedding-accent);
  box-shadow: 0 0 0 3px rgba(178, 128, 77, 0.1);
}

.wedding-input--error,
.wedding-textarea--error,
.wedding-select--error {
  border-color: var(--wedding-error);
}

.wedding-input--error:focus,
.wedding-textarea--error:focus,
.wedding-select--error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Textarea Specific */
.wedding-textarea {
  resize: vertical;
  min-height: 120px;
}

/* Radio & Checkbox Styles */
.wedding-radio-group,
.wedding-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.wedding-radio-label,
.wedding-checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  font-weight: 400;
}

.wedding-radio,
.wedding-checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--wedding-accent);
}

/* Error Messages */
.wedding-error {
  display: block;
  color: var(--wedding-error);
  font-size: 0.875rem;
  margin-top: var(--space-2);
}

/* Fieldset Styles */
.wedding-fieldset {
  border: 1px solid var(--wedding-gray-200);
  border-radius: 0.5rem;
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.wedding-legend {
  font-weight: 500;
  color: var(--wedding-text-primary);
  padding: 0 var(--space-2);
}
```

## ✨ Animation & Transitions

### Keyframe Animations

```css
/* Wedding-specific animations */
@keyframes wedding-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes wedding-fade-in-down {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes wedding-scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes wedding-slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes wedding-slide-in-right {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes wedding-bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -30px, 0);
  }
  70% {
    transform: translate3d(0, -15px, 0);
  }
  90% {
    transform: translate3d(0, -4px, 0);
  }
}

@keyframes wedding-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes wedding-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes wedding-shimmer {
  0% {
    background-position: -1200px 0;
  }
  100% {
    background-position: 1200px 0;
  }
}
```

### Animation Utility Classes

```css
/* Animation utility classes */
.animate-fade-in-up {
  animation: wedding-fade-in-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-fade-in-down {
  animation: wedding-fade-in-down 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-scale-in {
  animation: wedding-scale-in 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-slide-in-left {
  animation: wedding-slide-in-left 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-slide-in-right {
  animation: wedding-slide-in-right 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.animate-bounce {
  animation: wedding-bounce 2s infinite;
}

.animate-spin {
  animation: wedding-spin 1s linear infinite;
}

.animate-pulse {
  animation: wedding-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Animation delays */
.animate-delay-100 {
  animation-delay: 100ms;
}
.animate-delay-200 {
  animation-delay: 200ms;
}
.animate-delay-300 {
  animation-delay: 300ms;
}
.animate-delay-500 {
  animation-delay: 500ms;
}
.animate-delay-700 {
  animation-delay: 700ms;
}
.animate-delay-1000 {
  animation-delay: 1000ms;
}

/* Animation durations */
.animate-duration-200 {
  animation-duration: 200ms;
}
.animate-duration-300 {
  animation-duration: 300ms;
}
.animate-duration-500 {
  animation-duration: 500ms;
}
.animate-duration-700 {
  animation-duration: 700ms;
}
.animate-duration-1000 {
  animation-duration: 1000ms;
}
```

### Transition Utilities

```css
/* Transition utilities */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-wedding {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition:
    color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-transform {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-opacity {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(178, 128, 77, 0.3);
}
```

## 📱 Responsive Design Patterns

### Breakpoint System

```css
/* Breakpoint variables */
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Media query mixins (for reference) */
/* sm: @media (min-width: 640px) { ... } */
/* md: @media (min-width: 768px) { ... } */
/* lg: @media (min-width: 1024px) { ... } */
/* xl: @media (min-width: 1280px) { ... } */
/* 2xl: @media (min-width: 1536px) { ... } */
```

### Mobile-First Responsive Patterns

```css
/* Mobile-first responsive typography */
.wedding-responsive-text {
  font-size: 1rem;
  line-height: 1.5;
}

@media (min-width: 640px) {
  .wedding-responsive-text {
    font-size: 1.125rem;
    line-height: 1.6;
  }
}

@media (min-width: 768px) {
  .wedding-responsive-text {
    font-size: 1.25rem;
    line-height: 1.7;
  }
}

/* Responsive spacing */
.wedding-responsive-padding {
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .wedding-responsive-padding {
    padding: var(--space-8);
  }
}

@media (min-width: 1024px) {
  .wedding-responsive-padding {
    padding: var(--space-12);
  }
}

/* Responsive visibility */
.hidden-mobile {
  display: none;
}

@media (min-width: 768px) {
  .hidden-mobile {
    display: block;
  }
}

.hidden-desktop {
  display: block;
}

@media (min-width: 768px) {
  .hidden-desktop {
    display: none;
  }
}
```

## ♿ Accessibility Features

### High Contrast Support

```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --wedding-brown: #000000;
    --wedding-text-primary: #000000;
    --wedding-text-secondary: #333333;
    --wedding-accent: #0066cc;
    --wedding-error: #cc0000;
    --wedding-success: #009900;
  }

  .wedding-button--primary {
    background: #000000;
    border: 2px solid #000000;
  }

  .wedding-button--secondary {
    border-width: 3px;
  }

  .wedding-input:focus,
  .wedding-textarea:focus,
  .wedding-select:focus {
    outline: 3px solid #0066cc;
    outline-offset: 2px;
  }
}
```

### Reduced Motion Support

```css
/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .animate-bounce {
    animation: none;
  }

  .animate-spin {
    animation: none;
  }
}
```

### Focus Styles

```css
/* Focus management */
.wedding-focus-ring:focus {
  outline: 2px solid var(--wedding-accent);
  outline-offset: 2px;
}

.wedding-focus-ring:focus:not(:focus-visible) {
  outline: none;
}

/* Skip links */
.wedding-skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--wedding-accent);
  color: var(--wedding-white);
  padding: 8px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  z-index: 1000;
}

.wedding-skip-link:focus {
  top: 6px;
}
```

## 🎨 Component-Specific Styling Examples

### Navigation Styling

```css
.wedding-navigation {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--wedding-gray-100);
  position: sticky;
  top: 0;
  z-index: 50;
}

.wedding-nav-link {
  color: var(--wedding-text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: var(--space-2) var(--space-4);
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wedding-nav-link:hover,
.wedding-nav-link--active {
  color: var(--wedding-accent);
  background: rgba(178, 128, 77, 0.1);
}
```

### Hero Section Styling

```css
.wedding-hero {
  background: linear-gradient(
    135deg,
    var(--wedding-cream),
    var(--wedding-beige)
  );
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
}

.wedding-hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("/path/to/pattern.svg") center/cover;
  opacity: 0.05;
  pointer-events: none;
}

.wedding-hero-content {
  max-width: 800px;
  padding: var(--space-8);
  position: relative;
  z-index: 1;
}

.wedding-hero-names {
  font-family: var(--font-family-serif);
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 300;
  color: var(--wedding-brown);
  margin-bottom: var(--space-6);
  line-height: 1.1;
}

.wedding-hero-date {
  font-size: clamp(1.5rem, 4vw, 2rem);
  color: var(--wedding-accent);
  margin-bottom: var(--space-8);
}

.wedding-hero-scroll {
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  animation: wedding-bounce 2s infinite;
}
```

### Gallery Styling

```css
.wedding-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
  padding: var(--space-8);
}

.wedding-gallery-item {
  position: relative;
  overflow: hidden;
  border-radius: 1rem;
  aspect-ratio: 1;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wedding-gallery-item:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.wedding-gallery-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.wedding-gallery-item:hover .wedding-gallery-image {
  transform: scale(1.1);
}

.wedding-gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7));
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-end;
  padding: var(--space-6);
}

.wedding-gallery-item:hover .wedding-gallery-overlay {
  opacity: 1;
}

.wedding-gallery-caption {
  color: var(--wedding-white);
  font-weight: 500;
}
```

## 📚 Usage Guidelines

### Best Practices

1. **Consistency**: Always use the defined color variables and spacing scale
2. **Accessibility**: Ensure sufficient color contrast and focus indicators
3. **Performance**: Use CSS transforms for animations, not layout properties
4. **Responsive**: Design mobile-first and progressively enhance
5. **Semantic**: Use meaningful class names that reflect purpose, not appearance

### Implementation Example

```css
/* ✅ Good: Using design system variables and meaningful names */
.wedding-rsvp-form {
  max-width: 600px;
  margin: 0 auto;
  padding: var(--space-8);
  background: var(--wedding-white);
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.wedding-rsvp-submit {
  background: linear-gradient(135deg, var(--wedding-accent), #996b3f);
  color: var(--wedding-white);
  padding: var(--space-4) var(--space-8);
  border-radius: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ❌ Bad: Hard-coded values and non-semantic names */
.form {
  max-width: 600px;
  margin: 0 auto;
  padding: 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.button-brown {
  background: #b2804d;
  color: white;
  padding: 16px 32px;
  border-radius: 32px;
}
```

## 📚 Related Documentation

- **System Architecture**: [`../../architecture/system-overview.md`](../../architecture/system-overview.md)
- **Component Templates**: [`../component-templates/component-template.md`](../component-templates/component-template.md)
- **Development Setup**: [`../../development/setup-guide.md`](../../development/setup-guide.md)
- **Troubleshooting**: [`../../troubleshooting/common-issues.md`](../../troubleshooting/common-issues.md)
- **AI Development Context**: [`../../../config/ai/context-templates/development-context.md`](../../../config/ai/context-templates/development-context.md)

---

_For specific styling questions, refer to [`CLAUDE.md`](../../../CLAUDE.md) or the design team._

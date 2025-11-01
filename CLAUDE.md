# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a wedding website for Alfina & Mugni's wedding (November 29, 2025, Jakarta, Indonesia) built with Qwik, TypeScript, and Tailwind CSS. The site is a single-page application with multiple sections including hero, story, details, RSVP, gallery, contact, and footer.

## Development Commands

### Development Scripts

```bash
# Primary development server with SSR support
pnpm run dev         # Start Vite development server with SSR mode
                     # Use case: Main development workflow, hot reloading, SSR testing
                     # Output: http://localhost:5173 with full SSR capabilities

# Alternative development server with browser auto-open
pnpm run start       # Same as dev but automatically opens browser
                     # Use case: Quick development start, demo purposes
                     # Output: Auto-opens http://localhost:5173

# Debug mode development server
pnpm run dev.debug   # Start dev server with Node.js inspector for debugging
                     # Use case: Debugging SSR issues, server-side code inspection
                     # Output: Debugger available at chrome://inspect
```

### Building & Production Scripts

```bash
# Full production build (recommended)
pnpm run build       # Complete Qwik build with SSR optimization and static generation
                     # Use case: Production deployment, creates dist/ with optimized bundles
                     # Output: dist/ folder with client and server builds

# Client-only build
pnpm run build.client # Vite build for client-side only (no SSR)
                      # Use case: Static hosting, SPA deployment, CDN distribution
                      # Output: dist/ with client-side assets only

# Preview build for local testing
pnpm run build.preview # SSR build optimized for local preview testing
                       # Use case: Testing SSR behavior locally before deployment
                       # Output: Optimized build for vite preview command

# TypeScript compilation check
pnpm run build.types # TypeScript compilation without output files
                     # Use case: Type checking before commits, CI/CD validation
                     # Output: Type errors/warnings, no files generated

# Build and preview locally
pnpm run preview     # Builds production and starts local preview server
                     # Use case: Testing production build locally, final QA
                     # Output: Production server at http://localhost:4173
```

### Code Quality Scripts

```bash
# Code formatting
pnpm run fmt         # Format all files with Prettier using project config
                     # Use case: Consistent code style, pre-commit formatting
                     # Output: Modifies files in place according to .prettierrc

# Format validation
pnpm run fmt.check   # Check if files are properly formatted without changes
                     # Use case: CI/CD checks, pre-commit hooks, code review
                     # Output: Lists improperly formatted files, exit code 1 if issues

# Code linting
pnpm run lint        # Run ESLint on all TypeScript files in src/
                     # Use case: Code quality checks, identifying potential issues
                     # Output: Lint errors/warnings, follows eslint.config.js rules
```

### Testing Scripts

```bash
# Run all tests
pnpm run test        # Run test suite in watch mode using Vitest
                     # Use case: Development testing, continuous feedback
                     # Output: Interactive test runner at http://localhost:51204

# Test UI interface
pnpm run test:ui     # Launch Vitest UI for visual test management
                     # Use case: Visual test debugging, test result analysis
                     # Output: Web interface for test visualization

# Single test run
pnpm run test:run    # Run all tests once and exit (for CI/CD)
                     # Use case: CI/CD pipelines, automated testing
                     # Output: Test results summary with pass/fail status

# Test coverage
pnpm run test:coverage # Generate test coverage report using @vitest/coverage-v8
                       # Use case: Code quality assessment, coverage analysis
                       # Output: Coverage report in coverage/ directory
```

### Utility Scripts

```bash
# Deployment guidance
pnpm run deploy      # Shows message about adding server adapter
                     # Use case: Deployment setup guidance, adapter installation
                     # Output: Instructions to run "npm run qwik add"

# Qwik CLI access
pnpm run qwik        # Direct access to Qwik CLI commands
                     # Use case: Adding integrations, generating components
                     # Output: Qwik CLI help and available commands
```

**Important**: Always run `pnpm run build.types` and `pnpm run lint` before committing to ensure code quality.

## Architecture

**Framework**: Qwik v1.14.1 with Qwik City for routing
**Deployment**: Hybrid Static + API (SSG pages + Cloudflare Functions for APIs)
**Styling**: Tailwind CSS v4.1.8 + custom wedding theme in CSS variables
**Build Tool**: Vite 5.3.5
**Package Manager**: pnpm (required - efficient, disk space-saving package manager)
**Language**: TypeScript 5.4.5
**Hosting**: Cloudflare Pages with D1 database, R2 storage, and KV namespaces

### pnpm Benefits

The project migrated to pnpm for better dependency management:

- **Disk Efficiency**: pnpm dedupes dependencies, reducing disk usage by 30-50%
- **Installation Speed**: Faster installs due to efficient dependency resolution
- **Strict Mode**: Prevents phantom dependencies and improves dependency security
- **Workspace Support**: Ready for future monorepo expansion
- **Better Lockfiles**: More reliable and deterministic installations

### Hybrid Static + API Architecture (Simplified!)

The project uses a **simplified hybrid architecture** that eliminates most deployment complexity:

#### How It Works

1. **Static Pages (SSG)**: All public pages (home, story, details, contact) are pre-generated as static HTML at build time
   - Super fast loading (no server processing needed)
   - Simple development with `pnpm run dev`
   - No Cloudflare bindings needed for UI work

2. **Dynamic API Routes**: API endpoints (`/api/*`) run as Cloudflare Functions
   - Have full access to D1 (database), R2 (storage), KV (key-value)
   - Handle RSVP submissions, wishes, photo uploads, admin auth
   - Test with `pnpm run preview` (builds + runs with real bindings)

#### Development Workflow

**For UI/Page Development** (90% of the time):
```bash
pnpm run dev       # Fast Vite dev server, no build needed, no bindings
```
- Instant hot reload
- No Cloudflare complexity
- Just edit components and see changes immediately

**To Test API Routes** (when needed):
```bash
pnpm run preview   # Builds project + runs with real Cloudflare bindings
```
- Full D1, R2, KV access
- Test forms, authentication, database operations
- Matches production environment

**Why This is Better**:
- ✅ Simple dev workflow (just `pnpm run dev`)
- ✅ No stub environments or complex workarounds
- ✅ Fast builds (static HTML generation)
- ✅ Wedding guests get instant page loads
- ✅ Still uses Cloudflare D1/R2/KV for backend features
- ✅ Clear separation: static UI + dynamic APIs

### Key Directories

- `src/components/` - Wedding UI components (hero, story, details, RSVP, gallery, contact, footer, navigation)
- `src/routes/` - Page routing (index.tsx is the main wedding page)
- `src/global.css` - Global styles with wedding theme CSS variables
- `tailwind.config.js` - Wedding color palette and theme configuration

### Component Architecture

All components follow Qwik patterns using `component$()`. The main page (`src/routes/index.tsx`) imports and renders all wedding sections in sequence:

```tsx
Navigation → HeroSection → StorySection → DetailsSection →
RsvpSection → GallerySection → ContactSection → FooterSection
```

### Wedding Theme System

The project uses a consistent wedding color palette defined in both CSS variables (`src/global.css`) and Tailwind config:

- `--wedding-cream`: #faf7f5 (background)
- `--wedding-beige`: #f0e3d9 (secondary background)
- `--wedding-sage`: #d9e5e0 (accent)
- `--wedding-lavender`: #e0d9e5 (accent)
- `--wedding-brown`: #4d3326 (primary text)
- `--wedding-accent`: #b2804d (buttons, highlights)

Typography uses Playfair Display (serif) for headings and Inter (sans-serif) for body text.

### Styling Patterns

- Use `.wedding-section` class for full-height sections
- Use `.wedding-heading` for section titles
- Use `.wedding-button` for CTA buttons
- Use `.wedding-card` for content containers
- Mobile-first responsive design with breakpoints in global.css

## Development Guidelines

1. **Component Creation**: Follow existing component patterns in `src/components/`
2. **Styling**: Use Tailwind classes with wedding theme colors, or CSS variables for custom styles
3. **TypeScript**: All components should be properly typed with Qwik component patterns
4. **Mobile-First**: Prioritize mobile experience (wedding guests primarily use phones)
5. **Performance**: Leverage Qwik's automatic optimizations and lazy loading
6. **Testing**: Write tests for new components using Vitest and @testing-library/react
7. **Forms**: Use @modular-forms/qwik for form validation and management
8. **Icons**: Use @qwikest/icons for consistent iconography (see Icon Library section below)
9. **Animations**: Use motion library for smooth animations and transitions

## Icon Library Usage (IMPORTANT!)

**⚠️ Common Mistake to Avoid**: Do NOT import icons from `lucide-react` in Qwik components!

### The Problem

Importing from `lucide-react` in Qwik components causes runtime errors:

```tsx
// ❌ WRONG - Causes runtime error!
import { Upload, X, Image } from "lucide-react";

// Error: "The <Type> of the JSX element must be either a string or a function.
//         Instead, it's a 'object': [object Object]."
```

**Why?** `lucide-react` exports React components (objects with React-specific properties like `$$typeof`), which Qwik cannot render.

### The Solution

Always use `@qwikest/icons/lucide` for icon imports in Qwik components:

```tsx
// ✅ CORRECT - Works perfectly in Qwik!
import { LuUpload, LuX, LuImage } from "@qwikest/icons/lucide";

// Usage in JSX
<LuUpload class="w-5 h-5" />
<LuX class="w-4 h-4" />
<LuImage class="w-6 h-6" />
```

### Icon Naming Convention

All icons from `@qwikest/icons/lucide` have the **`Lu` prefix**:

| React Name (lucide-react) | Qwik Name (@qwikest/icons) |
|---------------------------|----------------------------|
| `Upload`                  | `LuUpload`                 |
| `X`                       | `LuX`                      |
| `Image`                   | `LuImage`                  |
| `Video`                   | `LuVideo`                  |
| `Check`                   | `LuCheck`                  |
| `ChevronDown`             | `LuChevronDown`            |
| `Search`                  | `LuSearch`                 |
| `Trash2`                  | `LuTrash2`                 |

### ESLint Protection

The project has ESLint configured to prevent `lucide-react` imports:

```bash
pnpm run lint  # Will catch lucide-react imports and show helpful error message
```

### Testing

Two tests ensure icon hygiene:

1. **Static Analysis Test** (`tests/integration/icon-imports.test.ts`):
   - Scans all files in `src/components/` and `src/routes/`
   - Fails if any file imports from `lucide-react`
   - Run: `pnpm test:run tests/integration/icon-imports.test.ts`

2. **Component Render Test** (`tests/integration/gallery-components.test.tsx`):
   - Verifies gallery components render without JSX type errors
   - Ensures icons are Qwik-compatible

### When is `lucide-react` OK?

`lucide-react` is only acceptable in:
- React-specific directories (e.g., `pinterest-ui/`)
- Non-Qwik configuration files

For all Qwik components in `src/`, always use `@qwikest/icons/lucide`.

## Configuration Files

- `vite.config.ts` - Vite build configuration with Qwik plugins
- `vitest.config.ts` - Vitest testing framework configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Wedding theme colors and fonts
- `postcss.config.js` - PostCSS with Tailwind and Autoprefixer
- `eslint.config.js` - ESLint rules for code quality
- `.prettierrc` - Code formatting configuration

## Wedding Context

This is a personal wedding website celebrating Indonesian wedding traditions. The design reflects elegance and cultural sensitivity with warm earth tones. The site serves wedding guests with information about the ceremony, love story, RSVP functionality, and contact details.

## Key Dependencies

### Core Dependencies
- **@builder.io/qwik**: v1.14.1 - Main framework
- **@builder.io/qwik-city**: v1.14.1 - Routing and SSR
- **tailwindcss**: v3.4.14 - Utility-first CSS framework
- **typescript**: v5.4.5 - Type safety
- **vite**: v5.3.5 - Build tool and dev server
- **vitest**: v3.2.4 - Testing framework

### Form & Validation
- **@modular-forms/qwik**: v0.29.1 - Form management
- **zod**: v4.1.5 - Schema validation

### UI & Styling
- **@qwikest/icons**: v0.0.13 - Icon library
- **motion**: v12.23.11 - Animation library
- **class-variance-authority**: v0.7.1 - Component variants
- **clsx**: v2.1.1 & **tailwind-merge**: v3.3.1 - Conditional styling
- **tailwindcss-animate**: v1.0.7 - CSS animations
- **lucide-react**: v0.542.0 - Icon components

### Utilities
- **date-fns**: v4.1.0 - Date manipulation
- **sonner**: v2.0.7 - Toast notifications

## Motion Animation Library

Read the latest documentation from motion by fetching the entry point of their documentation at https://llms.motion.dev/ from there you will know where to navigate

or also you can also use context7

## Testing Strategy

The project uses Vitest with @testing-library/react for component testing:
- Unit tests for UI components in `tests/unit/`
- Integration tests for complex features
- Coverage reporting with @vitest/coverage-v8
- JSDOM environment for DOM testing
- UI interface available at http://localhost:51204 during test runs

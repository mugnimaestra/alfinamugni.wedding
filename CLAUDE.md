# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a wedding website for Alfina & Mugni's wedding (November 29, 2025, Jakarta, Indonesia) built with Qwik, TypeScript, and Tailwind CSS. The site is a single-page application with multiple sections including hero, story, details, RSVP, gallery, contact, and footer.

## Development Commands

### Development Scripts

```bash
# Primary development server with SSR support
bun run dev          # Start Vite development server with SSR mode
                     # Use case: Main development workflow, hot reloading, SSR testing
                     # Output: http://localhost:5173 with full SSR capabilities

# Alternative development server with browser auto-open
bun run start        # Same as dev but automatically opens browser
                     # Use case: Quick development start, demo purposes
                     # Output: Auto-opens http://localhost:5173

# Debug mode development server
bun run dev.debug    # Start dev server with Node.js inspector for debugging
                     # Use case: Debugging SSR issues, server-side code inspection
                     # Output: Debugger available at chrome://inspect
```

### Building & Production Scripts

```bash
# Full production build (recommended)
bun run build        # Complete Qwik build with SSR optimization and static generation
                     # Use case: Production deployment, creates dist/ with optimized bundles
                     # Output: dist/ folder with client and server builds

# Client-only build
bun run build.client # Vite build for client-side only (no SSR)
                     # Use case: Static hosting, SPA deployment, CDN distribution
                     # Output: dist/ with client-side assets only

# Preview build for local testing
bun run build.preview # SSR build optimized for local preview testing
                      # Use case: Testing SSR behavior locally before deployment
                      # Output: Optimized build for vite preview command

# TypeScript compilation check
bun run build.types  # TypeScript compilation without output files
                     # Use case: Type checking before commits, CI/CD validation
                     # Output: Type errors/warnings, no files generated

# Build and preview locally
bun run preview      # Builds production and starts local preview server
                     # Use case: Testing production build locally, final QA
                     # Output: Production server at http://localhost:4173
```

### Code Quality Scripts

```bash
# Code formatting
bun run fmt          # Format all files with Prettier using project config
                     # Use case: Consistent code style, pre-commit formatting
                     # Output: Modifies files in place according to .prettierrc

# Format validation
bun run fmt.check    # Check if files are properly formatted without changes
                     # Use case: CI/CD checks, pre-commit hooks, code review
                     # Output: Lists improperly formatted files, exit code 1 if issues

# Code linting
bun run lint         # Run ESLint on all TypeScript files in src/
                     # Use case: Code quality checks, identifying potential issues
                     # Output: Lint errors/warnings, follows eslint.config.js rules
```

### Utility Scripts

```bash
# Deployment guidance
bun run deploy       # Shows message about adding server adapter
                     # Use case: Deployment setup guidance, adapter installation
                     # Output: Instructions to run "npm run qwik add"

# Qwik CLI access
bun run qwik         # Direct access to Qwik CLI commands
                     # Use case: Adding integrations, generating components
                     # Output: Qwik CLI help and available commands
```

**Important**: Always run `bun run build.types` and `bun run lint` before committing to ensure code quality.

## Architecture

**Framework**: Qwik v1.14.1 with Qwik City for routing
**Styling**: Tailwind CSS v4.1.8 + custom wedding theme in CSS variables
**Build Tool**: Vite 5.3.5
**Package Manager**: Bun (preferred) or npm
**Language**: TypeScript 5.4.5

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

## Configuration Files

- `vite.config.ts` - Vite build configuration with Qwik plugins
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Wedding theme colors and fonts
- `postcss.config.js` - PostCSS with Tailwind and Autoprefixer

## Wedding Context

This is a personal wedding website celebrating Indonesian wedding traditions. The design reflects elegance and cultural sensitivity with warm earth tones. The site serves wedding guests with information about the ceremony, love story, RSVP functionality, and contact details.

## Motion Animation Library

Read the latest documentation from motion by fetching the entry point of their documentation at https://llms.motion.dev/ from there you will know where to navigate

or also you can also use context7

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit application for a wedding website (alfinamugni-wedding-sveltekit) using Svelte 5, TypeScript, and Vite. The project uses pnpm as the package manager.

## Development Commands

**Development Server**
```bash
pnpm dev
```

**Build**
```bash
pnpm build
```

**Preview Production Build**
```bash
pnpm preview
```

**Type Checking**
```bash
pnpm check              # Run once
pnpm check:watch        # Watch mode
```

**Testing**
```bash
pnpm test               # Run tests with Vitest
```

**Linting & Formatting**
```bash
pnpm lint               # Check code style
pnpm format             # Auto-format code
```

## Architecture

**SvelteKit Structure**
- Uses SvelteKit file-based routing in `src/routes/`
- Global layout defined in `src/routes/+layout.svelte` imports `app.css` for global styles
- Root template in `src/app.html`
- Uses `@sveltejs/adapter-cloudflare` for Cloudflare Pages deployment

**Technology Stack**
- Svelte 5 with TypeScript
- Vite 6 for build tooling
- Vitest for testing (configured with jsdom environment)
- Tailwind CSS 3.4.14 for styling with wedding-themed color palette
- PostCSS with autoprefixer
- ESLint + Prettier for code quality
- shadcn-svelte for UI components
- Test files pattern: `src/**/*.{test,spec}.{js,ts}`

**Backend & Database**
- Cloudflare Pages for hosting
- Cloudflare D1 (SQLite) for database
- Configured via `wrangler.toml` and environment variables in `.env`

**Key Configuration**
- `svelte.config.js`: SvelteKit configuration with Cloudflare adapter
- `vite.config.ts` & `vitest.config.ts`: Vite and Vitest setup with SvelteKit plugin
- `tailwind.config.js`: Wedding color palette and custom animations
- `postcss.config.js`: CSS processing pipeline
- TypeScript strict mode enabled
- Package manager locked to pnpm 10.19.0

## Cloudflare Deployment

**Setup**
1. Install Wrangler: `pnpm install -g wrangler`
2. Authenticate: `wrangler login`
3. Create D1 database: `wrangler d1 create alfinamugni-wedding`
4. Configure `wrangler.toml` with your database ID

**Local Development**
```bash
pnpm dev                    # Run local dev server
wrangler pages dev          # Run with Wrangler (includes D1 bindings)
```

**Database Migrations**
```bash
wrangler d1 execute alfinamugni-wedding --file migrations/0001_initial_schema.sql
```

**Deploy to Production**
```bash
pnpm build
wrangler pages deploy dist
```

## Project Structure

**Core Components** (`src/lib/components/`)
- `HeroSection.svelte` - Landing hero with couple names and wedding date
- `CountdownSection.svelte` - Live countdown timer
- `AudioPlayer.svelte` - Background music player (fixed position)

**Utilities** (`src/lib/`)
- `utils.ts` - Helper functions (formatDate, calculateDaysUntil, cn, etc.)
- `validators.ts` - Zod schemas for form validation (RSVP, Wishes, Contact)
- `server/database.ts` - D1 database client wrapper

**Styling**
- `src/app.css` - Global styles with Tailwind directives, custom animations, wedding colors
- Wedding color palette: cream, beige, sage, lavender, brown, accent
- Fonts: Playfair Display (serif) for headings, Inter (sans) for body

**Pages**
- `src/routes/+page.svelte` - Main landing page with all sections
- `src/routes/+layout.svelte` - Global layout with footer and audio player

## Features Implemented

✅ **Hero Section** - Beautiful landing with couple names and countdown
✅ **Countdown Timer** - Days, hours, minutes, seconds until wedding
✅ **Story Section** - Couple's story narrative
✅ **Wedding Details** - Ceremony and reception info
✅ **RSVP Form** - Guest attendance confirmation (ready for backend integration)
✅ **Background Music** - Audio player with controls
✅ **Responsive Design** - Mobile-friendly layout
✅ **Wedding Theme** - Custom color palette and typography

## Features to Add Later

⏸️ **Admin Panel** - RSVP management and guest list
⏸️ **Gallery System** - Photo upload and sharing
⏸️ **Guest Messages** - Wishes and congratulations
⏸️ **PWA Features** - Offline support and app installation
⏸️ **Analytics** - Event tracking
⏸️ **Email Notifications** - RSVP confirmations

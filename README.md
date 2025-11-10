# Alfina & Mugni Wedding Website

A modern, feature-rich wedding website built with SvelteKit, featuring RSVP management, photo galleries, guest wishes, and an admin panel for managing wedding content.

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Usage](#usage)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Database Migrations](#database-migrations)
- [Deployment](#deployment)
- [Configuration Files](#configuration-files)
- [Additional Resources](#additional-resources)
- [Credits](#credits)
- [License](#license)

## About the Project

### What is this project?

This is a comprehensive wedding website solution built for Alfina & Mugni's wedding celebration. It provides a complete digital experience for wedding guests, including RSVP management, photo sharing, guest wishes, and detailed wedding information.

### Why was this project built?

Traditional wedding websites often lack the flexibility and features needed for a personalized celebration. This project was created to:

- **Solve the RSVP problem**: Provide an easy-to-use RSVP system with meal preferences and accommodation needs, eliminating the need for multiple communication channels
- **Enable photo sharing**: Allow guests to upload and share their wedding photos in organized sessions, creating a collaborative memory collection
- **Create a personalized experience**: Customize every aspect of the website to reflect the couple's style and story
- **Simplify event management**: Provide an admin panel for managing RSVPs, moderating content, and organizing photos

### What makes this project stand out?

- **Modern Tech Stack**: Built with SvelteKit 5 and TypeScript for optimal performance and developer experience
- **Smart Photo Compression**: Network-aware image compression that adapts to connection speed, ensuring fast uploads even on slower networks
- **Session-based Galleries**: Organize photos by event sessions (ceremony, reception, etc.) with QR code access for easy sharing
- **Cloudflare Integration**: Leverages Cloudflare Pages and D1 for fast, global performance and cost-effective hosting
- **Mobile-first Design**: Fully responsive with optimized mobile experience for guests on-the-go
- **Admin Panel**: Comprehensive admin interface for managing all aspects of the wedding website

## Badges

![SvelteKit](https://img.shields.io/badge/SvelteKit-2.0-FF3E00?style=flat-square&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red?style=flat-square)

## Features

### Main Website
- **Hero Section** - Beautiful landing page with couple names and wedding date
- **Countdown Timer** - Live countdown to the wedding day
- **Story Section** - Couple's story narrative
- **Wedding Details** - Ceremony and reception information
- **RSVP System** - Guest attendance confirmation with meal preferences
- **Photo Gallery** - Public gallery with photo upload capabilities
- **Guest Wishes** - Messages and congratulations from guests
- **Gift Section** - Gift registry information
- **Contact Section** - Contact information and form
- **Background Music** - Audio player with controls
- **Responsive Design** - Mobile-friendly layout with wedding-themed styling

### Admin Panel
- **Gallery Management** - Create and manage photo gallery sessions
- **Session Management** - Organize photos by event sessions
- **QR Code Generation** - Generate QR codes for easy gallery access
- **Photo Moderation** - Review and manage uploaded photos
- **RSVP Management** - View and manage guest RSVPs

### Photo Features
- **Multi-format Support** - JPEG, PNG, WebP, HEIC
- **Smart Compression** - Network-aware image compression
- **Batch Upload** - Upload multiple photos at once
- **Photo Editing** - Basic editing capabilities before upload
- **Session-based Galleries** - Organize photos by event sessions

## Tech Stack

- **Framework**: [SvelteKit 2](https://kit.svelte.dev/) with [Svelte 5](https://svelte.dev/)
- **Language**: TypeScript (strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom wedding color palette
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite)
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Package Manager**: pnpm 10.19.0
- **Build Tool**: Vite 6

### Key Dependencies
- `motion` - Animation library
- `lottie-web` - Lottie animations
- `sonner` - Toast notifications
- `sveltekit-superforms` - Form handling
- `zod` - Schema validation
- `qrcode` - QR code generation
- `date-fns` - Date utilities
- `lucide-svelte` - Icon library

## Prerequisites

- **Node.js** - Version 18 or higher
- **pnpm** - Version 10.19.0 (specified in package.json)
- **Cloudflare Account** - For deployment and D1 database
- **Wrangler CLI** - Cloudflare's CLI tool

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alfinamugni-wedding-sveltekit
```

2. Install dependencies:
```bash
pnpm install
```

3. Install Wrangler CLI globally (if not already installed):
```bash
pnpm install -g wrangler
```

4. Authenticate with Cloudflare:
```bash
wrangler login
```

## Development

### Local Development Server

Start the development server:
```bash
pnpm dev
```

The site will be available at `http://localhost:5173`

### Database Setup

1. Create a D1 database:
```bash
wrangler d1 create alfinamugni-wedding
```

2. Update `wrangler.toml` with your database ID (for both preview and production environments)

3. Run migrations:
```bash
# Run initial schema
wrangler d1 execute alfinamugni-wedding --file migrations/0001_initial_schema.sql

# Run additional migrations
wrangler d1 execute alfinamugni-wedding --file migrations/0002_gallery_sessions.sql
wrangler d1 execute alfinamugni-wedding --file migrations/0003_enhanced_photo_metadata.sql
wrangler d1 execute alfinamugni-wedding --file migrations/0004_unified_wishes_rsvp.sql
```

4. For local development with D1 bindings:
```bash
wrangler pages dev
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm check` - Run TypeScript type checking
- `pnpm check:watch` - Run type checking in watch mode
- `pnpm test` - Run tests with Vitest
- `pnpm lint` - Check code style with ESLint and Prettier
- `pnpm format` - Auto-format code with Prettier

## Usage

### For Guests

#### RSVP Submission
1. Navigate to the RSVP section on the main page
2. Fill in your details (name, email, phone)
3. Select attendance (both events, ceremony only, reception only, or unable to attend)
4. Add meal preferences and any dietary restrictions
5. Submit your RSVP

#### Uploading Photos
1. Go to the Gallery section or navigate to `/gallery`
2. Click "Upload" tab
3. Select photos from your device (supports drag & drop)
4. Photos are automatically compressed based on your network speed
5. Optionally categorize photos before uploading
6. Click "Upload All" to submit

#### Viewing Session Galleries
1. Access a session-specific gallery via QR code or direct link (`/g/[session_id]`)
2. Browse photos uploaded by other guests
3. Upload your own photos to the session

#### Leaving a Wish
1. Scroll to the Wishes section
2. Enter your name and message
3. Submit your wish (will be reviewed before public display)

### For Administrators

#### Accessing Admin Panel
1. Navigate to `/admin` (authentication required)
2. Use admin credentials to log in

#### Managing RSVPs
1. Go to Admin → RSVPs
2. View all RSVP submissions
3. Filter by attendance status
4. Export RSVP data as CSV
5. Edit or delete RSVP entries

#### Creating Gallery Sessions
1. Go to Admin → Sessions
2. Click "Create New Session"
3. Enter session details (name, date, description)
4. Generate QR code for easy sharing
5. Activate/deactivate sessions as needed

#### Managing Photos
1. Go to Admin → Gallery
2. View all uploaded photos
3. Feature/unfeature photos for public display
4. Delete inappropriate content
5. Move photos between sessions

For detailed usage instructions, see [USER_DOCUMENTATION.md](./USER_DOCUMENTATION.md).

## Testing

### Running Tests

The project uses [Vitest](https://vitest.dev/) for unit testing. Run tests with:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

### Test Structure

Tests are located alongside source files using the pattern `*.test.ts` or `*.spec.ts`:

```
src/
├── lib/
│   ├── utils.test.ts
│   └── validators.test.ts
└── routes/
    └── api/
        └── wishes-rsvp/
            └── +server.test.ts
```

### Example Test

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate } from '$lib/utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2024-12-25');
    expect(formatDate(date)).toBe('December 25, 2024');
  });
});
```

### Network Testing

For testing photo upload functionality under various network conditions, see [TESTING_GUIDE.md](./TESTING_GUIDE.md) which includes:

- Network simulation scenarios (4G, 3G, 2G)
- Chrome DevTools setup for throttling
- Expected compression ratios and upload times
- Mobile device testing guidelines

### E2E Testing

The project is configured for Playwright E2E testing. Test files should be placed in the `tests/` directory:

```bash
# Run E2E tests
pnpm test:e2e
```

## Project Structure

```
src/
├── lib/
│   ├── components/          # Svelte components
│   │   ├── admin/          # Admin panel components
│   │   ├── animations/     # Lottie animation components
│   │   └── gallery/        # Gallery-specific components
│   ├── server/             # Server-side utilities
│   │   └── database.ts     # D1 database wrapper
│   ├── stores/             # Svelte stores
│   ├── utils/              # Utility functions
│   │   ├── advanced-compression.ts
│   │   ├── device.ts
│   │   ├── image-processor.ts
│   │   └── network-utils.ts
│   ├── utils.ts            # General utilities
│   └── validators.ts       # Zod validation schemas
├── routes/                 # SvelteKit routes
│   ├── admin/             # Admin panel routes
│   │   ├── gallery/       # Gallery management
│   │   └── sessions/      # Session management
│   ├── api/               # API endpoints
│   │   ├── admin/         # Admin API routes
│   │   ├── gallery/       # Gallery API routes
│   │   └── wishes-rsvp/   # RSVP and wishes API
│   ├── g/                 # Public gallery pages
│   │   └── [session_id]/  # Session-specific gallery
│   ├── gallery/           # Main gallery page
│   ├── +layout.svelte     # Global layout
│   ├── +page.svelte       # Home page
│   └── +page.server.ts    # Server-side data loading
└── app.css                # Global styles

migrations/                # Database migration files
static/                    # Static assets
├── animations/           # Lottie JSON files
└── photos/              # Static photo assets
```

## Database Migrations

Migrations are located in the `migrations/` directory and should be run in order:

1. `0001_initial_schema.sql` - Initial database schema (RSVPs, wishes)
2. `0002_gallery_sessions.sql` - Gallery sessions support
3. `0003_enhanced_photo_metadata.sql` - Enhanced photo metadata
4. `0004_unified_wishes_rsvp.sql` - Unified wishes and RSVP tables

To run migrations:
```bash
wrangler d1 execute <database-name> --file migrations/<migration-file>.sql
```

## Deployment

### Cloudflare Pages Deployment

1. Build the project:
```bash
pnpm build
```

2. Deploy to Cloudflare Pages:
```bash
wrangler pages deploy dist
```

Or connect your repository to Cloudflare Pages for automatic deployments.

### Environment Configuration

The project uses `wrangler.toml` for configuration:
- D1 database bindings for preview and production
- Environment variables
- Cloudflare Pages build output directory

### Production Database Setup

1. Create production database:
```bash
wrangler d1 create wedding-database --env production
```

2. Update `wrangler.toml` with production database ID

3. Run migrations on production database:
```bash
wrangler d1 execute wedding-database --file migrations/0001_initial_schema.sql --env production
# ... run other migrations
```

## Configuration Files

- `svelte.config.js` - SvelteKit configuration with Cloudflare adapter
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Vitest test configuration
- `tailwind.config.js` - Tailwind CSS configuration with wedding theme
- `tsconfig.json` - TypeScript configuration (strict mode)
- `wrangler.toml` - Cloudflare Workers/Pages configuration
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration

## Additional Resources

- [USER_DOCUMENTATION.md](./USER_DOCUMENTATION.md) - User guide for gallery upload system
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing guidelines and best practices
- [CLAUDE.md](./CLAUDE.md) - Development guidelines and conventions

## Credits

### Technologies & Libraries

This project is built with amazing open-source technologies:

- **[SvelteKit](https://kit.svelte.dev/)** - The web framework used
- **[Svelte](https://svelte.dev/)** - The UI framework
- **[Cloudflare](https://www.cloudflare.com/)** - Hosting and database infrastructure
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Vitest](https://vitest.dev/)** - Fast unit test framework
- **[Playwright](https://playwright.dev/)** - End-to-end testing framework

### Resources & Documentation

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [freeCodeCamp README Best Practices](https://www.freecodecamp.org/news/how-to-write-a-good-readme-file/)

### Inspiration

This project was inspired by the need for a modern, customizable wedding website solution that combines beautiful design with practical functionality for managing wedding events.

## License

This is a **private project** created for personal use. All rights reserved.

**Copyright © 2024 Alfina & Mugni Wedding Website**

This project is not open source and is not licensed for public use, modification, or distribution. If you're interested in creating a similar project, please refer to the technologies and resources listed in the [Credits](#credits) section and build your own solution.

For questions about licensing or usage, please contact the project maintainers.


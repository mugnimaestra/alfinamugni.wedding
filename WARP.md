# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Wedding website for Alfina & Mugni (November 29, 2025, Jakarta) built with **Qwik 1.14.1**, featuring RSVP, photo gallery, event details, and guest interaction. The architecture leverages Qwik's resumability for instant page loads and optimal performance.

## Development Commands

### Essential Commands

```bash
# Development (primary workflow)
pnpm run dev              # SSR dev server at http://localhost:5173
pnpm run start            # Dev server with auto-open browser

# Production builds
pnpm run build            # Full production build (SSR + static)
pnpm run build.client     # Client-only build for static hosting
pnpm run build.preview    # SSR preview build for local testing
pnpm run preview          # Build and preview locally at http://localhost:4173

# Code quality
pnpm run fmt              # Format with Prettier (2-space, no semicolons)
pnpm run fmt.check        # Check formatting without changes
pnpm run lint             # ESLint on src/**/*.ts*
pnpm run build.types      # TypeScript type checking

# Testing
pnpm run test             # Vitest watch mode
pnpm run test:ui          # Visual test interface at http://localhost:51204
pnpm run test:run         # Single test run (for CI/CD)
pnpm run test:coverage    # Generate coverage report
```

### Running Specific Tests

```bash
# Run a single test file
pnpm run test -- path/to/test.test.tsx

# Run tests matching a pattern
pnpm run test:run -- --reporter=verbose button

# Debug a specific test
pnpm run test -- --inspect-brk path/to/test.test.tsx
```

**Pre-commit checklist**: Always run `pnpm run build.types` and `pnpm run lint` before committing.

## Architecture

### Framework Stack

- **Qwik 1.14.1**: Framework with resumability (no hydration, instant interactivity)
- **Qwik City**: File-based routing with SSR support
- **TypeScript 5.4.5**: Full type safety
- **Vite 5.3.5**: Build tool with HMR
- **Tailwind CSS 3.4.14**: Utility-first styling
- **Vitest 3.2.4**: Testing framework with jsdom
- **pnpm**: Package manager (faster installs, disk efficiency)

### Key Qwik Patterns

**Signals for Reactive State** (not useState):
```typescript
const count = useSignal(0);
const isOpen = useSignal(false);

// Access/modify with .value
count.value++;
```

**Event Handlers with `$` suffix** (lazy-loaded):
```typescript
const handleClick = $(() => {
  console.log('Clicked');
});

<button onClick$={handleClick}>Click</button>
```

**Component Definition** (always use `component$()`):
```typescript
export default component$(() => {
  return <div>Hello</div>;
});
```

**Server Functions** (use `server$()` for backend logic):
```typescript
const getData = server$(async () => {
  // Server-side only code
  return fetchData();
});
```

**Tasks for Side Effects** (not useEffect):
```typescript
useTask$(({ track }) => {
  track(() => signal.value);
  // Runs when signal changes
});
```

### Directory Structure

```
src/
├── components/           # Wedding section components
│   ├── ui/              # 40+ reusable UI components (shadcn/ui adapted for Qwik)
│   │   └── button.tsx, input.tsx, card.tsx, dialog.tsx, etc.
│   ├── hero-section.tsx
│   ├── countdown-section.tsx
│   ├── story-section.tsx
│   ├── rsvp-section.tsx
│   ├── gallery-section.tsx
│   └── navigation.tsx
├── routes/              # File-based routing (Qwik City)
│   ├── index.tsx        # Main wedding page (homepage)
│   ├── admin/           # Admin dashboard routes
│   ├── gallery/         # Gallery page
│   └── components-test/ # Component testing page
├── hooks/               # Custom Qwik hooks
│   ├── use-mobile.tsx   # Device detection hooks
│   ├── use-toast.ts     # Toast notification system
│   └── index.ts
├── services/            # Business logic
│   └── gallery-service.ts
├── utils/               # Helper functions
│   ├── animations.ts
│   ├── performance-monitor.ts
│   └── network-utils.ts
├── lib/
│   └── utils.ts         # cn() utility for Tailwind
├── root.tsx             # App root with QwikCityProvider
├── global.css           # Global styles + CSS variables
└── entry.*.tsx          # Entry points for different platforms
```

### Component Flow

Main page (`routes/index.tsx`) renders sections sequentially:
```
Navigation → HeroSection → CountdownSection → StorySection → 
DetailsSection → GiftSection → RsvpSection → WishesSection → 
GallerySection → QrCodeSection → ContactSection → FooterSection
```

### Wedding Theme System

**CSS Variables** (defined in `src/global.css`):
- `--wedding-cream`: #faf7f5 (background)
- `--wedding-beige`: #f0e3d9 (secondary background)
- `--wedding-sage`: #d9e5e0 (accent)
- `--wedding-lavender`: #e0d9e5 (accent)
- `--wedding-brown`: #4d3326 (primary text)
- `--wedding-accent`: #b2804d (buttons, highlights)

**Typography**:
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

**Styling Conventions**:
- Use Tailwind utilities first (prefer `className="bg-wedding-cream text-wedding-brown"`)
- CSS classes for complex styles: `.wedding-section`, `.wedding-heading`, `.wedding-button`, `.wedding-card`
- Mobile-first responsive design

### State Management

- **Signals**: Local component state (use `useSignal()`)
- **Context**: Shared state across components (use `createContextId()` + `useContextProvider()`)
- **Stores**: Complex state objects (use `useStore()`)
- **Server State**: Server functions with `server$()` for API calls

Example Context:
```typescript
const ThemeContext = createContextId<{ theme: Signal<string> }>('theme');

// Provider
const theme = useSignal('light');
useContextProvider(ThemeContext, { theme });

// Consumer
const { theme } = useContext(ThemeContext);
```

## Coding Guidelines

### File Naming

- **Components**: PascalCase (`HeroSection.tsx`, `RsvpSection.tsx`)
- **Hooks**: camelCase with `use` prefix (`useGallery.ts`, `useMobile.tsx`)
- **Routes**: kebab-case directories (`admin/`, `gallery/`, `components-test/`)
- **Utilities**: kebab-case or camelCase (`utils.ts`, `gallery-service.ts`)

### Import Paths

Use TypeScript path alias `~` for src:
```typescript
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
```

### Component Structure

```typescript
import { component$, useSignal } from "@builder.io/qwik";

export default component$(() => {
  // 1. Signals and state
  const count = useSignal(0);
  
  // 2. Event handlers (with $ suffix)
  const handleClick = $(() => {
    count.value++;
  });
  
  // 3. Return JSX
  return (
    <div class="wedding-section">
      <button onClick$={handleClick}>Count: {count.value}</button>
    </div>
  );
});
```

### Validation & Forms

Use **Zod** for schema validation and **@modular-forms/qwik** for forms:
```typescript
import { z } from "zod";
import { useForm } from "@modular-forms/qwik";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email()
});

type FormData = z.infer<typeof schema>;

const [form, { Form, Field }] = useForm<FormData>({
  validate: zodValidator(schema)
});
```

### Styling Best Practices

1. **Tailwind utilities first**: `class="flex items-center gap-4 bg-wedding-cream"`
2. **Wedding theme colors**: Use predefined variables (`bg-wedding-beige`, `text-wedding-brown`)
3. **Responsive design**: Mobile-first with Tailwind breakpoints (`sm:`, `md:`, `lg:`)
4. **Conditional classes**: Use `cn()` from `~/lib/utils`
   ```typescript
   import { cn } from "~/lib/utils";
   
   <div class={cn(
     "base-classes",
     isActive && "active-classes",
     isPending && "pending-classes"
   )} />
   ```

### Error Handling

Use Qwik's error boundaries:
```typescript
import { ErrorBoundary } from "@builder.io/qwik-city";

<ErrorBoundary
  fallback={(error) => <div>Error: {error.message}</div>}
>
  <MyComponent />
</ErrorBoundary>
```

### Testing

Write tests in `tests/unit/` mirroring src structure:
```typescript
import { describe, it, expect } from 'vitest';
import { createDOM } from '@builder.io/qwik/testing';

describe('Button', () => {
  it('should render', async () => {
    const { screen, render } = await createDOM();
    await render(<Button>Click me</Button>);
    expect(screen.innerHTML).toContain('Click me');
  });
});
```

## Important Notes

### Motion Animation Library

For animations, use the **motion** library (v12.23.11). Fetch documentation from https://llms.motion.dev/ for latest patterns.

### Qwik-Specific Gotchas

1. **No `useEffect`**: Use `useTask$()` or `useVisibleTask$()` instead
2. **No `useState`**: Use `useSignal()` or `useStore()`
3. **Event handlers need `$`**: `onClick$`, `onInput$`, etc.
4. **Server functions**: Wrap with `server$()` for backend logic
5. **Lazy loading**: Components load only when visible (automatic)

### UI Components

40+ UI components in `src/components/ui/` adapted from shadcn/ui for Qwik:
- Forms: Button, Input, Textarea, Select, Checkbox, Radio, Switch
- Layout: Card, Dialog, Sheet, Tabs, Accordion, Sidebar
- Interactive: DropdownMenu, Popover, Tooltip, HoverCard
- Specialized: Badge (with RSVP/Vendor variants), Carousel, Table, Calendar

### Wedding Context

Indonesian wedding celebration (November 29, 2025, Jakarta). Design reflects cultural elegance with warm earth tones. Mobile-first design is critical as most guests access via phones.

### Performance Considerations

- Qwik's resumability means no hydration overhead
- Components lazy-load automatically when visible
- Use `useVisibleTask$()` for client-side interactions that need to run on visibility
- Images should use WebP format with progressive loading
- Test Core Web Vitals after changes (LCP < 2.5s target)

## Configuration Files

- `vite.config.ts`: Vite with Qwik plugins, build optimization
- `vitest.config.ts`: Vitest with jsdom environment for component tests
- `tailwind.config.js`: Wedding theme colors, typography (Playfair Display + Inter)
- `tsconfig.json`: TypeScript config with `~` path alias
- `eslint.config.js`: ESLint rules for code quality
- `.prettierrc`: Prettier formatting (2-space indent, no semicolons)

## Deployment

Built for **Cloudflare Pages** (see `entry.cloudflare-pages.tsx`). Also supports Vercel, Netlify via adapters.

```bash
# Cloudflare Pages
wrangler pages deploy dist

# Vercel
vercel deploy

# Netlify
netlify deploy --prod --dir=dist
```

## External Documentation

- **Qwik Docs**: https://qwik.builder.io/docs/
- **Qwik City Routing**: https://qwik.builder.io/docs/routing/
- **Motion Library**: https://llms.motion.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vitest**: https://vitest.dev/

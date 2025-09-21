# Coding Agent Guidelines for Wedding Site

## Build & Test Commands

- **Install**: `bun install` (preferred) or `npm install`
- **Dev**: `npm run dev` (SSR dev server), `npm run start` (with browser)
- **Build**: `npm run build` (production), `npm run build.preview` (SSR preview)
- **Format**: `npm run fmt` (Prettier), `npm run fmt.check` (check only)
- **Lint**: `npm run lint` (ESLint on src/\*_/_.ts\*)
- **Test**: `npm run test` (watch), `npm run test:run` (single run), `npm run test:coverage` (with coverage)
- **Single test**: `npm run test -- path/to/test.test.tsx` or `npm run test:run -- --reporter=verbose button`

## Code Style & Conventions

- **Formatting**: Prettier with 2-space indent, no semicolons
- **Components**: PascalCase files (`HeroSection.tsx`), export default component
- **Hooks**: `use` prefix (`useGallery.ts`), camelCase files
- **Routes**: kebab-case directories under `src/routes/` (Qwik City routing)
- **Imports**: TypeScript paths with `~` alias for src (`import { cn } from "~/lib/utils"`)
- **Styling**: Tailwind utilities preferred, shared styles in `src/global.css`
- **Types**: Zod schemas for validation, typed APIs, avoid `any`
- **Error Handling**: Use Qwik's error boundaries, typed error responses

## Project Structure

- **Components**: `src/components/` (shared), `src/components/ui/` (shadcn/ui)
- **Routes**: `src/routes/` (file-based routing, kebab-case directories)
- **Utils**: `src/utils/`, `src/hooks/`, `src/lib/` (shared logic)
- **Tests**: `tests/unit/` (\*.test.tsx), mirror src structure
- **Config**: `/config/` (build/deploy), root for Tailwind/ESLint/Vite

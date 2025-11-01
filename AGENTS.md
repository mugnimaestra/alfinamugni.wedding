# Coding Agent Guidelines for Wedding Site

## Build & Test Commands

- **Install**: `pnpm install` (preferred) or `npm install`
- **Dev**: `npm run dev` (SSR dev server), `npm run start` (with browser)
- **Build**: `npm run build` (production), `npm run preview` (preview build)
- **Format**: `npm run fmt` (Prettier), `npm run fmt.check` (check only)
- **Lint**: `npm run lint` (ESLint on src/\*_/_.ts\*)
- **Test**: `npm run test` (watch), `npm run test:run` (single run), `npm run test:coverage` (with coverage)
- **Single test**: `npm run test -- path/to/test.test.tsx` or `npm run test:run -- --reporter=verbose button`

## Code Style & Conventions

- **Package Manager**: Use pnpm (v9.15.4) for all operations
- **Formatting**: Prettier with 2-space indent, no semicolons
- **Components**: PascalCase files (`HeroSection.tsx`), export default component
- **Hooks**: `use` prefix (`useGallery.ts`), camelCase files
- **Routes**: kebab-case directories under `src/routes/` (Qwik City routing)
- **Imports**: TypeScript paths with `~` alias for src (`import { cn } from "~/lib/utils"`)
- **Styling**: Tailwind utilities preferred, shared styles in `src/global.css`
- **Types**: Zod schemas for validation, typed APIs, avoid `any`
- **Error Handling**: Use Qwik's error boundaries, typed error responses
- **Database**: Cloudflare D1 with migrations in `migrations/` directory

## Project Structure

- **Components**: `src/components/` (shared), `src/components/ui/` (shadcn/ui)
- **Routes**: `src/routes/` (file-based routing, kebab-case directories)
- **Utils**: `src/utils/`, `src/hooks/`, `src/lib/` (shared logic)
- **Tests**: `tests/unit/` (\*.test.tsx), mirror src structure
- **Config**: `/config/` (build/deploy), root for Tailwind/ESLint/Vite

## Figma Integration (Cursor Rules)

- Use MCP tools for Figma design integration
- Always join channel before sending Figma commands
- Get document overview with `get_document_info` first
- Check selection with `get_selection` before modifications
- Use component instances for consistency
- Handle errors appropriately as all commands can throw exceptions

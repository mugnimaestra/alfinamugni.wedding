# Repository Guidelines

## Project Structure & Module Organization
The Qwik app lives in `src/`, with route files under `src/routes/` (Qwik City naming drives URLs). Shared building blocks live in `src/components/`, `src/hooks/`, and `src/utils/`; keep new modules small and colocate tests when practical. Configuration for Tailwind, ESLint, and build tooling sits in `/config`, while static assets (icons, open graph images, fonts) belong in `public/`. Testing assets are separated in `tests/` with `unit/`, `integration/`, `e2e/`, and `visual/` suites—use these directories to mirror the scope of your change. Built artifacts land in `dist/` and should never be committed manually.

## Build, Test, and Development Commands
Install dependencies with `bun install` (preferred) or `npm install`. Run `npm run dev` for the SSR dev server, and `npm run start` to open the site locally with default settings. `npm run build` (or `npm run build.preview` for SSR) produces deployable output in `dist/`. Guard formatting with `npm run fmt`, lint with `npm run lint`, and execute component tests via `npm run test` or `npm run test:run`. Use `npm run test:coverage` to validate the coverage report before merging.

## Coding Style & Naming Conventions
This codebase relies on Prettier (2-space indentation, semicolons off) and ESLint with `eslint-plugin-qwik`; always run `npm run fmt` before committing. Author Qwik components with PascalCase filenames (e.g., `HeroSection.tsx`), hooks with `use` prefixes, and utility modules in camelCase. Route directory names should remain kebab-case to match Qwik City's routing. Favor Tailwind utility classes for styling; if styles are shared, extract them into `src/components` variants or `src/global.css`. Prefer typed APIs (Zod schemas, typed fetchers) to keep the RSVP flow robust.

## Testing Guidelines
Write unit specs in `tests/unit/*.test.tsx`, mirroring the component or helper under test. Integration behavior belongs in `tests/integration/`, while `tests/e2e/` covers wedding guest journeys; keep scenarios focused and reset state between steps. Visual regressions should update snapshots within `tests/visual/` via the existing tooling. Run `npm run test:coverage` and include the summary in your PR description; new components need meaningful assertions, not snapshot-only coverage.

## Commit & Pull Request Guidelines
Follow a conventional message format (`feat:`, `fix:`, `chore:`) to match the repository history—write imperative, present-tense summaries under 72 characters. Each PR should describe the why and how, list testing commands executed, and link Jira/GitHub issues where relevant. Include before/after screenshots or recordings for UI tweaks, note any configuration changes, and request review from the wedding site maintainers before merging.

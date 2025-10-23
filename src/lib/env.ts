/**
 * Simplified Environment Provider for Static + API Hybrid Architecture
 *
 * With the new SSG (Static Site Generation) approach:
 * - Pages are pre-generated at build time (no runtime bindings needed)
 * - API routes run as Cloudflare Functions (have access to bindings)
 * - Use `pnpm run dev` for UI development (pages are client-side)
 * - Use `pnpm run preview` to test API routes (runs with real Wrangler bindings)
 *
 * This module provides a clear error message if API routes are called without bindings.
 */

import type { Env } from './database';

/**
 * Get environment from platform
 *
 * In production and preview (wrangler pages dev), platform.env contains
 * real Cloudflare bindings (D1, R2, KV, etc.)
 *
 * @param platformEnv - The platform.env object from Qwik City context
 * @returns Env object with all required bindings
 * @throws Error if bindings are not available
 */
export function getEnv(platformEnv?: any): Env {
  // If we have Cloudflare bindings, use them
  if (platformEnv && (platformEnv.DB || platformEnv.ADMIN_KV)) {
    return platformEnv as Env;
  }

  // API routes need Cloudflare bindings to function
  // If you're seeing this error, you need to test API routes using:
  //   pnpm run preview    (builds and runs with wrangler)
  throw new Error(
    '❌ Cloudflare bindings not available!\n\n' +
    'API routes require D1, KV, and R2 bindings to function.\n\n' +
    'How to fix this:\n' +
    '1. For UI development (pages): Use `pnpm run dev` - APIs not needed\n' +
    '2. To test API routes: Use `pnpm run preview` - builds and runs with real bindings\n' +
    '3. In production: Bindings are automatically available\n\n' +
    'Current mode: API route called without Cloudflare environment'
  );
}

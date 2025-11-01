/*
 * WHAT IS THIS FILE?
 *
 * It's the entry point for Cloudflare Pages when building for production.
 *
 * Learn more about the Cloudflare Pages integration here:
 * - https://qwik.builder.io/docs/deployments/cloudflare-pages/
 *
 */
import { createQwikCity } from '@builder.io/qwik-city/middleware/cloudflare-pages';
import qwikCityPlan from '@qwik-city-plan';
import { manifest } from '@qwik-client-manifest';
import render from './entry.ssr';

import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnvironment {
    DB: D1Database;
    WEDDING_PHOTOS: R2Bucket;
    WEDDING_ASSETS: R2Bucket;
    RESEND_API_KEY: string;
    ENVIRONMENT: string;
  }
}

const fetch = createQwikCity({ render, qwikCityPlan, manifest });

export { fetch };
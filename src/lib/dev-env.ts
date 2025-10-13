/**
 * Development environment mock for Cloudflare bindings
 * This provides in-memory implementations for D1, KV, and R2 during local development
 */

import type { Env } from './database';

// In-memory KV store for development
class MockKV {
  private store: Map<string, { value: string; expiration?: number }> = new Map();

  async get<T = unknown>(key: string, type?: 'text' | 'json'): Promise<T | null> {
    const item = this.store.get(key);
    if (!item) return null;

    // Check expiration
    if (item.expiration && Date.now() > item.expiration) {
      this.store.delete(key);
      return null;
    }

    if (type === 'json') {
      return JSON.parse(item.value) as T;
    }
    return item.value as T;
  }

  async put(
    key: string,
    value: string,
    options?: { expirationTtl?: number; expiration?: number }
  ): Promise<void> {
    const expiration = options?.expirationTtl
      ? Date.now() + options.expirationTtl * 1000
      : options?.expiration;

    this.store.set(key, { value, expiration });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(options?: { prefix?: string }): Promise<{ keys: Array<{ name: string }> }> {
    const keys: Array<{ name: string }> = [];
    
    for (const [key] of this.store) {
      if (!options?.prefix || key.startsWith(options.prefix)) {
        keys.push({ name: key });
      }
    }

    return { keys };
  }
}

// Singleton instances for development
let mockAdminKV: MockKV | null = null;
let mockSessionsKV: MockKV | null = null;

/**
 * Get or create a mock environment for development
 * This should only be used in local development mode
 */
export function getDevEnv(): Env {
  // Initialize mock KV stores
  if (!mockAdminKV) {
    mockAdminKV = new MockKV();
  }
  if (!mockSessionsKV) {
    mockSessionsKV = new MockKV();
  }

  // Load environment variables from .dev.vars or process.env
  const env: Env = {
    ADMIN_KV: mockAdminKV as any,
    SESSIONS: mockSessionsKV as any,
    DB: null as any, // Will be mocked or use local D1
    WEDDING_PHOTOS: null as any, // Will be mocked or use local R2
    WEDDING_PHOTOS_PREVIEW: null as any,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@alfinamugni.wedding',
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
    ENVIRONMENT: 'development',
    WEDDING_DATE: '2025-11-29',
    TIMEZONE: 'Asia/Jakarta',
  };

  return env;
}

/**
 * Check if we're in development mode
 */
export function isDevMode(): boolean {
  return process.env.NODE_ENV !== 'production' && !process.env.CF_PAGES;
}

/**
 * Get environment with fallback to dev mock
 * Use this in routes to ensure env is always available
 */
export function getEnvWithFallback(platformEnv: any): Env {
  // If platform.env exists and has the required bindings, use it
  if (platformEnv?.ADMIN_KV && platformEnv?.ADMIN_EMAIL) {
    return platformEnv as Env;
  }

  // Otherwise, use development mock
  console.log('[DEV] Using mock environment for local development');
  return getDevEnv();
}

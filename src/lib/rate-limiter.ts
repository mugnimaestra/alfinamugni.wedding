import type { KVNamespace } from '@cloudflare/workers-types';

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (identifier: string) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

// Rate limit result
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// Rate limit entry stored in KV
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private kv: KVNamespace;
  private config: RateLimitConfig;

  constructor(kv: KVNamespace, config: RateLimitConfig) {
    this.kv = kv;
    this.config = config;
  }

  // Check rate limit for a given identifier
  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;
    
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Get current rate limit entry
      const existing = await this.kv.get<RateLimitEntry>(key, 'json');
      
      if (!existing || now > existing.resetTime) {
        // Create new entry or reset expired entry
        const newEntry: RateLimitEntry = {
          count: 1,
          resetTime: now + this.config.windowMs
        };

        await this.kv.put(key, JSON.stringify(newEntry), {
          expirationTtl: Math.ceil(this.config.windowMs / 1000) + 60 // Add 60s buffer
        });

        return {
          allowed: true,
          limit: this.config.maxRequests,
          remaining: this.config.maxRequests - 1,
          resetTime: newEntry.resetTime
        };
      }

      // Check if limit exceeded
      if (existing.count >= this.config.maxRequests) {
        const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
        
        return {
          allowed: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime: existing.resetTime,
          retryAfter
        };
      }

      // Increment counter
      const updatedEntry: RateLimitEntry = {
        count: existing.count + 1,
        resetTime: existing.resetTime
      };

      await this.kv.put(key, JSON.stringify(updatedEntry), {
        expirationTtl: Math.ceil((updatedEntry.resetTime - now) / 1000) + 60
      });

      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - updatedEntry.count,
        resetTime: updatedEntry.resetTime
      };

    } catch (error) {
      console.error('Rate limiter error:', error);
      // Fail open - allow request if rate limiter fails
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
  }

  // Reset rate limit for a specific identifier
  async resetLimit(identifier: string): Promise<void> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;
    
    await this.kv.delete(key);
  }

  // Get current rate limit status without incrementing
  async getStatus(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : `rate_limit:${identifier}`;
    
    const now = Date.now();

    try {
      const existing = await this.kv.get<RateLimitEntry>(key, 'json');
      
      if (!existing || now > existing.resetTime) {
        return {
          allowed: true,
          limit: this.config.maxRequests,
          remaining: this.config.maxRequests,
          resetTime: now + this.config.windowMs
        };
      }

      const retryAfter = existing.count >= this.config.maxRequests 
        ? Math.ceil((existing.resetTime - now) / 1000)
        : undefined;

      return {
        allowed: existing.count < this.config.maxRequests,
        limit: this.config.maxRequests,
        remaining: Math.max(0, this.config.maxRequests - existing.count),
        resetTime: existing.resetTime,
        retryAfter
      };

    } catch (error) {
      console.error('Rate limiter status error:', error);
      return {
        allowed: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs
      };
    }
  }
}

// Predefined rate limiters for different use cases
export class RateLimiters {
  private static kv: KVNamespace;

  static initialize(kv: KVNamespace) {
    this.kv = kv;
  }

  // RSVP rate limiting - 1 submission per email per hour
  static getRsvpLimiter(): RateLimiter {
    return new RateLimiter(this.kv, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 1,
      keyGenerator: (email: string) => `rsvp_email:${email.toLowerCase()}`
    });
  }

  // RSVP IP-based rate limiting - 3 submissions per IP per hour
  static getRsvpIpLimiter(): RateLimiter {
    return new RateLimiter(this.kv, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
      keyGenerator: (ip: string) => `rsvp_ip:${ip}`
    });
  }

  // Wishes rate limiting - 5 submissions per IP per hour
  static getWishesLimiter(): RateLimiter {
    return new RateLimiter(this.kv, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5,
      keyGenerator: (ip: string) => `wishes_ip:${ip}`
    });
  }

  // Photo upload rate limiting - 10 uploads per IP per hour
  static getPhotoUploadLimiter(): RateLimiter {
    return new RateLimiter(this.kv, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      keyGenerator: (ip: string) => `photo_upload_ip:${ip}`
    });
  }

  // General API rate limiting - 100 requests per IP per minute
  static getGeneralApiLimiter(): RateLimiter {
    return new RateLimiter(this.kv, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      keyGenerator: (ip: string) => `api_general:${ip}`
    });
  }

  // Admin API rate limiting - 1000 requests per IP per hour
  static getAdminApiLimiter(): RateLimiter {
    return new RateLimiter(this.kv, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 1000,
      keyGenerator: (ip: string) => `api_admin:${ip}`
    });
  }
}

// Middleware helper for Qwik routes
export interface RateLimitMiddlewareOptions {
  limiter: RateLimiter;
  identifier: string;
  onRateLimit?: (result: RateLimitResult) => Response;
  skipOnSuccess?: boolean;
  skipOnFailure?: boolean;
}

export async function rateLimitMiddleware(
  options: RateLimitMiddlewareOptions,
  successCallback?: () => void,
  failureCallback?: () => void
): Promise<{ allowed: boolean; response?: Response }> {
  const result = await options.limiter.checkLimit(options.identifier);

  if (!result.allowed) {
    const response = options.onRateLimit?.(result) || new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        success: false,
        message: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: result.resetTime
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': (result.retryAfter || 60).toString()
        }
      }
    );

    return { allowed: false, response };
  }

  return { allowed: true };
}

// Utility to add rate limit headers to responses
export function addRateLimitHeaders(
  response: Response,
  result: RateLimitResult
): Response {
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
  
  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString());
  }

  return response;
}
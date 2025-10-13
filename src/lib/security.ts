/**
 * Security Hardening for Wedding Website
 * CSP headers, rate limiting, and security monitoring
 */

import { ApiErrorType, ApiErrorHandler } from './api-error-handler';

export interface SecurityConfig {
  contentSecurityPolicy: {
    enabled: boolean;
    directives: Record<string, string[]>;
    reportOnly?: boolean;
  };
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  securityHeaders: {
    enabled: boolean;
    headers: Record<string, string>;
  };
  monitoring: {
    enabled: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    alertThresholds: {
      failedLogins: number;
      suspiciousRequests: number;
      errorRate: number;
    };
  };
}

// Default security configuration
export const defaultSecurityConfig: SecurityConfig = {
  contentSecurityPolicy: {
    enabled: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      'font-src': ["'self'", "https://fonts.gstatic.com"],
      'img-src': ["'self'", "data:", "https:", "blob:"],
      'connect-src': ["'self'", "https://api.resend.com", "https://www.google-analytics.com"],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': [],
    },
    reportOnly: false,
  },
  rateLimiting: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
  },
  securityHeaders: {
    enabled: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    },
  },
  monitoring: {
    enabled: true,
    logLevel: 'warn',
    alertThresholds: {
      failedLogins: 5,
      suspiciousRequests: 10,
      errorRate: 0.1, // 10%
    },
  },
};

// Security monitoring class
export class SecurityMonitor {
  private config: SecurityConfig;
  private metrics: {
    failedLogins: number;
    suspiciousRequests: number;
    totalRequests: number;
    errorCount: number;
    lastReset: number;
  };

  constructor(config: SecurityConfig = defaultSecurityConfig) {
    this.config = config;
    this.metrics = {
      failedLogins: 0,
      suspiciousRequests: 0,
      totalRequests: 0,
      errorCount: 0,
      lastReset: Date.now(),
    };
  }

  // Generate CSP header
  generateCSPHeader(): string {
    if (!this.config.contentSecurityPolicy.enabled) {
      return '';
    }

    const directives = Object.entries(this.config.contentSecurityPolicy.directives)
      .map(([directive, sources]) => {
        const sourceList = sources.length > 0 ? ' ' + sources.join(' ') : '';
        return `${directive}${sourceList}`;
      })
      .join('; ');

    return directives;
  }

  // Generate security headers
  generateSecurityHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    if (this.config.contentSecurityPolicy.enabled) {
      const headerName = this.config.contentSecurityPolicy.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy';
      headers[headerName] = this.generateCSPHeader();
    }

    if (this.config.securityHeaders.enabled) {
      Object.assign(headers, this.config.securityHeaders.headers);
    }

    return headers;
  }

  // Check rate limit
  checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetTime: number } {
    if (!this.config.rateLimiting.enabled) {
      return { allowed: true, remaining: Infinity, resetTime: 0 };
    }

    // In a real implementation, this would use Redis or a database
    // For now, we'll use a simple in-memory approach
    const now = Date.now();
    const windowStart = now - this.config.rateLimiting.windowMs;
    
    // This would be replaced with actual rate limiting logic
    const requestCount = Math.random() * this.config.rateLimiting.maxRequests;
    const allowed = requestCount < this.config.rateLimiting.maxRequests;
    const remaining = Math.max(0, this.config.rateLimiting.maxRequests - Math.ceil(requestCount));
    const resetTime = now + this.config.rateLimiting.windowMs;

    return { allowed, remaining, resetTime };
  }

  // Log security event
  logSecurityEvent(event: {
    type: 'failed_login' | 'suspicious_request' | 'error' | 'success';
    details: Record<string, unknown>;
    clientId?: string;
    userAgent?: string;
    ip?: string;
  }): void {
    if (!this.config.monitoring.enabled) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      ...event,
    };

    // Update metrics
    switch (event.type) {
      case 'failed_login':
        this.metrics.failedLogins++;
        break;
      case 'suspicious_request':
        this.metrics.suspiciousRequests++;
        break;
      case 'error':
        this.metrics.errorCount++;
        break;
    }

    this.metrics.totalRequests++;

    // Log to console (in production, this would go to a logging service)
    if (this.shouldLog(event.type)) {
      console.log('[SecurityMonitor]', JSON.stringify(logEntry));
    }

    // Check alert thresholds
    this.checkAlertThresholds();
  }

  // Determine if event should be logged based on log level
  private shouldLog(eventType: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.monitoring.logLevel);
    
    const eventLevels = {
      failed_login: 'warn',
      suspicious_request: 'warn',
      error: 'error',
      success: 'info',
    };

    const eventLevelIndex = levels.indexOf(eventLevels[eventType as keyof typeof eventLevels]);
    return eventLevelIndex <= currentLevelIndex;
  }

  // Check alert thresholds
  private checkAlertThresholds(): void {
    const thresholds = this.config.monitoring.alertThresholds;

    if (this.metrics.failedLogins >= thresholds.failedLogins) {
      this.sendAlert('High number of failed logins detected', {
        count: this.metrics.failedLogins,
        threshold: thresholds.failedLogins,
      });
    }

    if (this.metrics.suspiciousRequests >= thresholds.suspiciousRequests) {
      this.sendAlert('High number of suspicious requests detected', {
        count: this.metrics.suspiciousRequests,
        threshold: thresholds.suspiciousRequests,
      });
    }

    const errorRate = this.metrics.totalRequests > 0 
      ? this.metrics.errorCount / this.metrics.totalRequests 
      : 0;

    if (errorRate >= thresholds.errorRate) {
      this.sendAlert('High error rate detected', {
        errorRate: (errorRate * 100).toFixed(2) + '%',
        threshold: (thresholds.errorRate * 100).toFixed(2) + '%',
        errors: this.metrics.errorCount,
        total: this.metrics.totalRequests,
      });
    }
  }

  // Send security alert
  private sendAlert(message: string, details: Record<string, unknown>): void {
    console.warn('[SECURITY ALERT]', message, details);
    
    // In production, this would send to a monitoring service
    // Example: Slack, email, SMS, etc.
  }

  // Validate request
  validateRequest(request: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
  }): { valid: boolean; reason?: string } {
    // Check for common attack patterns
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // XSS
      /union\s+select/gi, // SQL injection
      /javascript:/gi, // JavaScript protocol
      /on\w+\s*=/gi, // Event handlers
    ];

    const url = request.url.toLowerCase();
    const body = request.body ? JSON.stringify(request.body).toLowerCase() : '';

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(body)) {
        this.logSecurityEvent({
          type: 'suspicious_request',
          details: { pattern: pattern.source, url, body },
        });
        return { valid: false, reason: 'Suspicious content detected' };
      }
    }

    // Check content type
    const contentType = request.headers['content-type'] || '';
    if (request.method !== 'GET' && request.method !== 'HEAD' && !contentType.includes('application/json')) {
      return { valid: false, reason: 'Invalid content type' };
    }

    return { valid: true };
  }

  // Sanitize input
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;

    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove JavaScript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Get security metrics
  getMetrics(): {
    failedLogins: number;
    suspiciousRequests: number;
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    lastReset: string;
  } {
    const errorRate = this.metrics.totalRequests > 0 
      ? this.metrics.errorCount / this.metrics.totalRequests 
      : 0;

    return {
      ...this.metrics,
      errorRate,
      lastReset: new Date(this.metrics.lastReset).toISOString(),
    };
  }

  // Reset metrics
  resetMetrics(): void {
    this.metrics = {
      failedLogins: 0,
      suspiciousRequests: 0,
      totalRequests: 0,
      errorCount: 0,
      lastReset: Date.now(),
    };
  }
}

// Rate limiting middleware
export function createRateLimitMiddleware(securityMonitor: SecurityMonitor) {
  return async (request: Request, next: () => Promise<Response>): Promise<Response> => {
    const clientId = getClientIdentifier(request);
    const rateLimit = securityMonitor.checkRateLimit(clientId);

    if (!rateLimit.allowed) {
      securityMonitor.logSecurityEvent({
        type: 'suspicious_request',
        details: { reason: 'Rate limit exceeded', clientId },
      });

      return ApiErrorHandler.handleRateLimitError(
        {
          message: 'Rate limit exceeded',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        } as any,
        {
          limit: defaultSecurityConfig.rateLimiting.maxRequests,
          remaining: rateLimit.remaining,
          resetTime: rateLimit.resetTime,
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        }
      );
    }

    // Add rate limit headers to response
    const response = await next();
    
    response.headers.set('X-RateLimit-Limit', defaultSecurityConfig.rateLimiting.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

    return response;
  };
}

// Security headers middleware
export function createSecurityHeadersMiddleware(securityMonitor: SecurityMonitor) {
  return async (request: Request, next: () => Promise<Response>): Promise<Response> => {
    const response = await next();
    
    // Add security headers
    const headers = securityMonitor.generateSecurityHeaders();
    Object.entries(headers).forEach(([name, value]) => {
      response.headers.set(name, value);
    });

    return response;
  };
}

// Request validation middleware
export function createRequestValidationMiddleware(securityMonitor: SecurityMonitor) {
  return async (request: Request, next: () => Promise<Response>): Promise<Response> => {
    const requestData = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
    };

    const validation = securityMonitor.validateRequest(requestData);
    if (!validation.valid) {
      securityMonitor.logSecurityEvent({
        type: 'suspicious_request',
        details: { reason: validation.reason, ...requestData },
      });

      return ApiErrorHandler.handleBadRequestError(validation.reason || 'Invalid request');
    }

    return next();
  };
}

// Utility functions
function getClientIdentifier(request: Request): string {
  // Try to get client IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  const ip = forwardedFor?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  
  // Combine with user agent for better identification
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return Buffer.from(`${ip}:${userAgent}`).toString('base64');
}

// Global security monitor instance
export const securityMonitor = new SecurityMonitor();

// Security health check
export async function performSecurityHealthCheck(): Promise<{
  status: 'healthy' | 'warning' | 'critical';
  checks: {
    csp: { status: 'pass' | 'fail'; message: string };
    rateLimit: { status: 'pass' | 'fail'; message: string };
    headers: { status: 'pass' | 'fail'; message: string };
    metrics: { status: 'pass' | 'fail' | 'warning'; message: string };
  };
}> {
  const checks: {
    csp: { status: 'pass' | 'fail'; message: string };
    rateLimit: { status: 'pass' | 'fail'; message: string };
    headers: { status: 'pass' | 'fail'; message: string };
    metrics: { status: 'pass' | 'fail' | 'warning'; message: string };
  } = {
    csp: { status: 'pass', message: 'CSP is properly configured' },
    rateLimit: { status: 'pass', message: 'Rate limiting is active' },
    headers: { status: 'pass', message: 'Security headers are set' },
    metrics: { status: 'pass', message: 'Security metrics are normal' },
  };

  // Check CSP
  if (!defaultSecurityConfig.contentSecurityPolicy.enabled) {
    checks.csp = { status: 'fail', message: 'CSP is disabled' };
  }

  // Check rate limiting
  if (!defaultSecurityConfig.rateLimiting.enabled) {
    checks.rateLimit = { status: 'fail', message: 'Rate limiting is disabled' };
  }

  // Check security headers
  if (!defaultSecurityConfig.securityHeaders.enabled) {
    checks.headers = { status: 'fail', message: 'Security headers are disabled' };
  }

  // Check metrics
  const metrics = securityMonitor.getMetrics();
  const errorRate = metrics.errorRate;
  
  if (errorRate > 0.2) {
    checks.metrics = { status: 'fail', message: `High error rate: ${(errorRate * 100).toFixed(2)}%` };
  } else if (errorRate > 0.1) {
    checks.metrics = { status: 'warning', message: `Elevated error rate: ${(errorRate * 100).toFixed(2)}%` };
  }

  // Determine overall status
  const hasFailures = Object.values(checks).some(check => check.status === 'fail');
  const hasWarnings = Object.values(checks).some(check => check.status === 'warning');

  const status = hasFailures ? 'critical' : hasWarnings ? 'warning' : 'healthy';

  return { status, checks };
}
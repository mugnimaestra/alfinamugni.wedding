/**
 * Content Security Policy (CSP) Configuration
 * Implements strict CSP headers for XSS prevention
 */

export interface CSPConfig {
  directives: {
    defaultSrc: string[]
    scriptSrc: string[]
    styleSrc: string[]
    imgSrc: string[]
    fontSrc: string[]
    connectSrc: string[]
    frameSrc: string[]
    objectSrc: string[]
    mediaSrc: string[]
    workerSrc: string[]
    manifestSrc: string[]
  }
  reportUri?: string
  reportOnly?: boolean
}

export const generateCSP = (nonce?: string, reportOnly = false): string => {
  const config: CSPConfig = {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Qwik inline event handlers
        nonce ? `'nonce-${nonce}'` : "",
        "https://cdn.jsdelivr.net", // For CDN resources
        "https://unpkg.com", // For unpkg CDN
      ].filter(Boolean),
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind and dynamic styles
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
      ],
      imgSrc: [
        "'self'",
        "data:", // For data URIs
        "blob:", // For blob URLs (image uploads)
        "https:", // Allow HTTPS images
        "*.cloudflare.com", // Cloudflare R2 and Images
        "*.r2.dev", // R2 custom domains
        "*.googleusercontent.com", // For potential OAuth avatars
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net",
      ],
      connectSrc: [
        "'self'",
        "https://*.cloudflare.com", // Cloudflare services
        "https://*.r2.dev", // R2 storage
        "https://api.resend.com", // Resend email API
        "wss:", // WebSocket connections
      ],
      frameSrc: ["'none'"], // Deny all frames for clickjacking protection
      objectSrc: ["'none'"], // Deny plugins
      mediaSrc: [
        "'self'",
        "blob:",
        "https:", // Allow media from HTTPS sources
        "*.cloudflare.com",
        "*.r2.dev",
      ],
      workerSrc: ["'self'", "blob:"], // Service workers
      manifestSrc: ["'self'"],
    },
    reportOnly,
  }

  // Build CSP header string
  const directives = Object.entries(config.directives)
    .map(([key, values]) => {
      const kebabKey = key.replace(/([A-Z])/g, "-$1").toLowerCase()
      return `${kebabKey} ${values.join(" ")}`
    })
    .join("; ")

  return directives
}

/**
 * Apply CSP headers to response
 */
export const applyCSPHeaders = (
  headers: Headers,
  nonce?: string,
  reportOnly = false,
): void => {
  const csp = generateCSP(nonce, reportOnly)
  const headerName = reportOnly
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy"

  headers.set(headerName, csp)
}

/**
 * Additional security headers
 */
export const applySecurityHeaders = (headers: Headers): void => {
  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY")

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff")

  // Enable XSS filter in browsers
  headers.set("X-XSS-Protection", "1; mode=block")

  // Referrer policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Permissions policy
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=()",
  )

  // HSTS (HTTP Strict Transport Security)
  // Only enable in production with HTTPS
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    )
  }
}

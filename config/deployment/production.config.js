/**
 * Production Configuration
 * Wedding Website for Alfina & Mugni
 *
 * This file contains production-specific settings and configurations
 * for the wedding website deployment environment.
 *
 * @author Alfina & Mugni Development Team
 * @date November 2025
 */

// Wedding Information (Production)
export const weddingInfo = {
  couple: {
    names: "Alfina & Mugni",
    bride: {
      firstName: "Alfina",
      fullName: "Alfina",
      nicknames: ["Alfina"],
    },
    groom: {
      firstName: "Mugni",
      fullName: "Mugni",
      nicknames: ["Mugni"],
    },
  },
  event: {
    date: "2025-11-29",
    dateFormatted: "November 29, 2025",
    time: {
      ceremony: "14:00",
      reception: "18:00",
    },
    location: {
      city: "Jakarta",
      country: "Indonesia",
      timezone: "Asia/Jakarta",
      venue: {
        name: "Balai Kartini",
        address: "Jl. Gatot Subroto Kav. 37, Jakarta Selatan",
        coordinates: {
          lat: -6.2297,
          lng: 106.8311,
        },
      },
    },
  },
  theme: {
    hashtag: "#AlfinaMugniWedding",
    colors: {
      primary: "#4d3326",
      accent: "#b2804d",
      background: "#faf7f5",
      secondary: "#f0e3d9",
    },
  },
};

// Production Build Configuration
export const buildConfig = {
  sourcemap: false,
  minify: "terser",
  target: "es2020",
  outDir: "dist",
  assetsDir: "assets",
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ["@builder.io/qwik", "@builder.io/qwik-city"],
        utils: ["./src/utils"],
      },
      chunkFileNames: "assets/[name]-[hash].js",
      entryFileNames: "assets/[name]-[hash].js",
      assetFileNames: "assets/[name]-[hash].[ext]",
    },
  },
  reportCompressedSize: true,
  cssCodeSplit: true,
};

// CDN and Static Assets Configuration
export const cdn = {
  enabled: true,
  provider: "cloudflare", // or 'cloudinary', 'aws', 'vercel'
  baseUrl: process.env.VITE_CDN_BASE_URL || "",
  images: {
    optimization: true,
    formats: ["webp", "avif", "jpg"],
    quality: 85,
    sizes: [320, 640, 960, 1280, 1920],
    lazy: true,
  },
  fonts: {
    preload: [
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;500;600;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
    ],
  },
};

// Performance Configuration
export const performance = {
  preloadStrategy: "critical",
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: "50px",
    fadeIn: true,
  },
  caching: {
    staticAssets: "31536000", // 1 year
    htmlPages: "3600", // 1 hour
    apiResponses: "300", // 5 minutes
    images: "2592000", // 30 days
  },
  compression: {
    gzip: true,
    brotli: true,
    level: 9,
  },
  bundleOptimization: {
    treeshaking: true,
    deadCodeElimination: true,
    modulePreload: true,
    prefetch: ["critical-components"],
  },
};

// SEO Configuration
export const seo = {
  meta: {
    title: `${weddingInfo.couple.names} Wedding - ${weddingInfo.event.dateFormatted}`,
    description: `Join us for the wedding celebration of ${weddingInfo.couple.names} on ${weddingInfo.event.dateFormatted} in ${weddingInfo.event.location.city}, ${weddingInfo.event.location.country}. RSVP and find all wedding details here.`,
    keywords: [
      "wedding",
      "Alfina Mugni wedding",
      "Jakarta wedding",
      "November 2025 wedding",
      "wedding invitation",
      "RSVP",
      "wedding celebration",
      "Indonesia wedding",
    ],
    author: `${weddingInfo.couple.names}`,
    robots: "index, follow",
    canonical: process.env.VITE_SITE_URL || "https://alfinamugni.wedding",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    site_name: `${weddingInfo.couple.names} Wedding`,
    title: `${weddingInfo.couple.names} Wedding - ${weddingInfo.event.dateFormatted}`,
    description: `Join us for our wedding celebration on ${weddingInfo.event.dateFormatted} in ${weddingInfo.event.location.city}!`,
    image: "/images/og-wedding-card.jpg",
    url: process.env.VITE_SITE_URL || "https://alfinamugni.wedding",
  },
  twitter: {
    card: "summary_large_image",
    site: "@alfinamugni",
    creator: "@alfinamugni",
    title: `${weddingInfo.couple.names} Wedding`,
    description: `Join us for our wedding celebration on ${weddingInfo.event.dateFormatted}!`,
    image: "/images/twitter-wedding-card.jpg",
  },
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${weddingInfo.couple.names} Wedding Ceremony`,
    startDate: `${weddingInfo.event.date}T${weddingInfo.event.time.ceremony}:00+07:00`,
    endDate: `${weddingInfo.event.date}T22:00:00+07:00`,
    location: {
      "@type": "Place",
      name: weddingInfo.event.location.venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: weddingInfo.event.location.venue.address,
        addressLocality: weddingInfo.event.location.city,
        addressCountry: weddingInfo.event.location.country,
      },
    },
    organizer: {
      "@type": "Person",
      name: weddingInfo.couple.names,
    },
  },
};

// Analytics Configuration (Production)
export const analytics = {
  enabled: true,
  googleAnalytics: {
    measurementId: process.env.VITE_GA_MEASUREMENT_ID,
    config: {
      page_title: seo.meta.title,
      page_location: seo.meta.canonical,
      send_page_view: true,
      anonymize_ip: true,
      cookie_expires: 63072000, // 2 years
    },
  },
  customEvents: {
    rsvpSubmission: "rsvp_submission",
    photoView: "photo_view",
    sectionView: "section_view",
    contactClick: "contact_click",
    directionsClick: "directions_click",
    calendarAdd: "calendar_add",
    socialShare: "social_share",
  },
  ecommerce: false, // Not applicable for wedding site
  demographics: true,
  remarketing: false,
};

// Security Configuration (Production)
export const security = {
  csp: {
    enabled: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": [
        "'self'",
        "'unsafe-inline'", // Required for some analytics
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://apis.google.com",
      ],
      "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
      ],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": [
        "'self'",
        "data:",
        "https:",
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
      ],
      "connect-src": [
        "'self'",
        "https://www.google-analytics.com",
        "https://analytics.google.com",
      ],
      "frame-src": ["https://www.google.com", "https://www.youtube.com"],
    },
    reportOnly: false,
  },
  headers: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  },
  cors: {
    origin: [
      process.env.VITE_SITE_URL,
      "https://alfinamugni.wedding",
      "https://www.alfinamugni.wedding",
    ],
    credentials: false,
  },
};

// API Configuration (Production)
export const api = {
  baseUrl: process.env.VITE_API_BASE_URL || "https://api.alfinamugni.wedding",
  timeout: 10000,
  retries: 3,
  endpoints: {
    rsvp: "/rsvp",
    contact: "/contact",
    gallery: "/gallery",
    guestMessages: "/guest-messages",
    analytics: "/analytics",
  },
  rateLimit: {
    rsvp: "5/minute",
    contact: "3/minute",
    general: "100/hour",
  },
  validation: {
    strict: true,
    sanitization: true,
  },
};

// Database Configuration
export const database = {
  provider: "airtable", // or 'firebase', 'supabase', 'planetscale'
  connection: {
    baseId: process.env.VITE_AIRTABLE_BASE_ID,
    apiKey: process.env.VITE_AIRTABLE_API_KEY,
    tables: {
      rsvps: "RSVPs",
      guestMessages: "Guest Messages",
      contactForms: "Contact Forms",
      analytics: "Analytics",
    },
  },
  backup: {
    enabled: true,
    frequency: "daily",
    retention: "30d",
  },
};

// Email Configuration
export const email = {
  provider: "emailjs", // or 'sendgrid', 'mailgun', 'resend'
  templates: {
    rsvpConfirmation: process.env.VITE_EMAILJS_RSVP_TEMPLATE,
    contactNotification: process.env.VITE_EMAILJS_CONTACT_TEMPLATE,
    weddingReminder: process.env.VITE_EMAILJS_REMINDER_TEMPLATE,
  },
  from: {
    name: weddingInfo.couple.names,
    email: process.env.VITE_CONTACT_EMAIL || "hello@alfinamugni.wedding",
  },
  rateLimiting: {
    enabled: true,
    maxPerHour: 50,
    maxPerDay: 200,
  },
};

// Monitoring Configuration
export const monitoring = {
  errorTracking: {
    enabled: true,
    provider: "sentry", // or 'bugsnag', 'rollbar'
    dsn: process.env.VITE_SENTRY_DSN,
    environment: "production",
    sampleRate: 1.0,
    beforeSend: (event) => {
      // Filter out non-critical errors
      if (event.exception?.values?.[0]?.type === "ChunkLoadError") {
        return null;
      }
      return event;
    },
  },
  performance: {
    enabled: true,
    sampleRate: 0.1, // Sample 10% of transactions
    metrics: [
      "largest-contentful-paint",
      "first-input-delay",
      "cumulative-layout-shift",
      "first-contentful-paint",
    ],
  },
  uptime: {
    enabled: true,
    provider: "uptimerobot",
    interval: "5m",
    alerts: {
      email: process.env.VITE_ALERT_EMAIL,
      webhook: process.env.VITE_ALERT_WEBHOOK,
    },
  },
};

// Deployment Configuration
export const deployment = {
  platform: "netlify", // or 'vercel', 'cloudflare-pages'
  domains: {
    primary: "alfinamugni.wedding",
    aliases: ["www.alfinamugni.wedding"],
    redirects: [
      {
        from: "www.alfinamugni.wedding",
        to: "alfinamugni.wedding",
        status: 301,
      },
    ],
  },
  ssl: {
    enabled: true,
    provider: "letsencrypt",
    hsts: true,
  },
  buildHooks: {
    contentUpdate: process.env.NETLIFY_BUILD_HOOK,
    emergency: process.env.NETLIFY_EMERGENCY_HOOK,
  },
};

// Feature Flags (Production)
export const features = {
  rsvpForm: true,
  photoGallery: true,
  guestMessages: true,
  socialSharing: true,
  calendarIntegration: true,
  mapIntegration: true,
  mobileOptimization: true,
  offlineSupport: true,
  pushNotifications: false, // Future feature
  liveUpdates: false, // Real-time updates
  guestList: false, // Private feature
  adminPanel: false, // Separate deployment
  analytics: true,
  errorTracking: true,
};

// Logging Configuration (Production)
export const logging = {
  level: "warn",
  console: {
    enabled: false, // Disabled in production
    colorize: false,
  },
  remote: {
    enabled: true,
    endpoint: process.env.VITE_LOGGING_ENDPOINT,
    apiKey: process.env.VITE_LOGGING_API_KEY,
    batchSize: 100,
    flushInterval: 5000,
  },
  categories: {
    component: "error",
    api: "warn",
    performance: "info",
    security: "error",
    user: "info",
  },
};

// Environment Variables (Production)
export const env = {
  NODE_ENV: "production",
  VITE_WEDDING_COUPLE: weddingInfo.couple.names,
  VITE_WEDDING_DATE: weddingInfo.event.dateFormatted,
  VITE_WEDDING_LOCATION: `${weddingInfo.event.location.city}, ${weddingInfo.event.location.country}`,
  VITE_WEDDING_HASHTAG: weddingInfo.theme.hashtag,
  VITE_SITE_URL: deployment.domains.primary,
  VITE_API_BASE_URL: api.baseUrl,
  VITE_CDN_BASE_URL: cdn.baseUrl,
  VITE_ENABLE_ANALYTICS: analytics.enabled.toString(),
  VITE_ENABLE_MONITORING: monitoring.errorTracking.enabled.toString(),
};

// Export all configurations
export default {
  weddingInfo,
  buildConfig,
  cdn,
  performance,
  seo,
  analytics,
  security,
  api,
  database,
  email,
  monitoring,
  deployment,
  features,
  logging,
  env,
};

// Production configuration validation
export function validateProductionConfig() {
  const errors = [];
  const warnings = [];

  // Critical validations
  if (!process.env.VITE_SITE_URL) {
    errors.push("VITE_SITE_URL is required for production");
  }

  if (!process.env.VITE_GA_MEASUREMENT_ID && analytics.enabled) {
    warnings.push("Google Analytics ID not configured");
  }

  if (!process.env.VITE_AIRTABLE_API_KEY) {
    errors.push("Airtable API key is required for RSVP functionality");
  }

  if (!process.env.VITE_EMAILJS_SERVICE_ID) {
    warnings.push("Email service not configured - contact forms may not work");
  }

  // Security validations
  if (
    security.csp.enabled &&
    security.csp.directives["script-src"].includes("'unsafe-eval'")
  ) {
    warnings.push("unsafe-eval in CSP should be avoided in production");
  }

  // Performance validations
  if (buildConfig.sourcemap) {
    warnings.push("Source maps should be disabled in production for security");
  }

  if (logging.console.enabled) {
    warnings.push("Console logging should be disabled in production");
  }

  // Output validation results
  if (errors.length > 0) {
    throw new Error(`Production configuration errors:\n${errors.join("\n")}`);
  }

  if (warnings.length > 0) {
    console.warn("Production configuration warnings:\n", warnings.join("\n"));
  }

  return { valid: true, warnings };
}

// Configuration utilities
export const utils = {
  /**
   * Get optimized build settings
   */
  getBuildSettings: () => ({
    ...buildConfig,
    define: {
      "process.env.NODE_ENV": '"production"',
      __WEDDING_INFO__: JSON.stringify(weddingInfo),
      __FEATURES__: JSON.stringify(features),
    },
  }),

  /**
   * Get security headers for deployment
   */
  getSecurityHeaders: () => ({
    ...security.headers,
    "Content-Security-Policy": Object.entries(security.csp.directives)
      .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
      .join("; "),
  }),

  /**
   * Get performance optimization settings
   */
  getPerformanceConfig: () => ({
    preload: cdn.fonts.preload,
    caching: performance.caching,
    compression: performance.compression,
    lazyLoading: performance.lazyLoading,
  }),

  /**
   * Generate sitemap URLs
   */
  getSitemapUrls: () => [
    { url: "/", changefreq: "weekly", priority: 1.0 },
    { url: "/#rsvp", changefreq: "daily", priority: 0.9 },
    { url: "/#gallery", changefreq: "weekly", priority: 0.8 },
    { url: "/#details", changefreq: "monthly", priority: 0.7 },
  ],
};

// Post-deployment checks
export const healthChecks = {
  endpoints: [
    { url: "/", expectedStatus: 200, timeout: 5000 },
    { url: "/robots.txt", expectedStatus: 200, timeout: 2000 },
    { url: "/sitemap.xml", expectedStatus: 200, timeout: 2000 },
  ],
  content: [
    { selector: "h1", expectedText: weddingInfo.couple.names },
    { selector: 'meta[name="description"]', expectedAttribute: "content" },
    {
      selector: '[data-testid="wedding-date"]',
      expectedText: weddingInfo.event.dateFormatted,
    },
  ],
  performance: {
    maxLoadTime: 3000,
    maxLCP: 2500,
    maxFID: 100,
    maxCLS: 0.1,
  },
};

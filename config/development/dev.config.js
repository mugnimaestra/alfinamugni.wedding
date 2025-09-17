/**
 * Development Configuration
 * Wedding Website for Alfina & Mugni
 *
 * This file contains development-specific settings and configurations
 * for the wedding website development environment.
 *
 * @author Alfina & Mugni Development Team
 * @date November 2025
 */

// Wedding Information
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
      primary: "#4d3326", // wedding-brown
      accent: "#b2804d", // wedding-accent
      background: "#faf7f5", // wedding-cream
      secondary: "#f0e3d9", // wedding-beige
    },
  },
};

// Development Server Configuration
export const devServer = {
  port: 5173,
  host: "localhost",
  https: false,
  open: true,
  cors: true,
  hmr: {
    port: 5174,
    overlay: true,
  },
};

// Build Configuration for Development
export const buildConfig = {
  sourcemap: true,
  minify: false,
  target: "esnext",
  outDir: "dist",
  assetsDir: "assets",
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ["@builder.io/qwik", "@builder.io/qwik-city"],
      },
    },
  },
};

// TypeScript Configuration
export const typescript = {
  strict: true,
  noImplicitAny: true,
  noImplicitReturns: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  exactOptionalPropertyTypes: true,
};

// Styling Configuration
export const styling = {
  tailwind: {
    enabled: true,
    configPath: "./tailwind.config.js",
  },
  postcss: {
    enabled: true,
    configPath: "./postcss.config.js",
  },
  css: {
    preprocessor: "postcss",
    modules: false,
    sourcemap: true,
  },
};

// Testing Configuration
export const testing = {
  framework: "vitest",
  environment: "jsdom",
  coverage: {
    enabled: true,
    reporter: ["text", "html", "lcov"],
    threshold: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
  setupFiles: ["./src/test-setup.ts"],
  testFiles: ["**/*.{test,spec}.{js,ts,tsx}", "**/__tests__/**/*.{js,ts,tsx}"],
};

// Linting Configuration
export const linting = {
  eslint: {
    enabled: true,
    configPath: "./eslint.config.js",
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    cache: true,
  },
  prettier: {
    enabled: true,
    configPath: "./.prettierrc",
    extensions: [".ts", ".tsx", ".js", ".jsx", ".css", ".md", ".json"],
  },
  typecheck: {
    enabled: true,
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"],
  },
};

// Development Tools
export const devTools = {
  qwikInsights: {
    enabled: true,
    publicApiKey: process.env.VITE_QWIK_INSIGHTS_KEY,
  },
  bundleAnalyzer: {
    enabled: false, // Enable manually when needed
    openAnalyzer: false,
  },
  profiler: {
    enabled: true,
    logLevel: "info",
  },
};

// Mock Data Configuration
export const mockData = {
  enabled: true,
  rsvp: {
    responses: [
      {
        id: "mock-1",
        name: "John & Jane Doe",
        email: "john.doe@example.com",
        attending: true,
        guestCount: 2,
        submittedAt: "2025-10-01T10:00:00Z",
      },
      {
        id: "mock-2",
        name: "Sarah Smith",
        email: "sarah.smith@example.com",
        attending: false,
        guestCount: 1,
        submittedAt: "2025-10-02T15:30:00Z",
      },
    ],
  },
  gallery: {
    photos: [
      {
        id: "mock-photo-1",
        alt: "Engagement photo 1",
        src: "/images/gallery/placeholder-1.jpg",
        caption: "Our engagement session",
      },
      {
        id: "mock-photo-2",
        alt: "Engagement photo 2",
        src: "/images/gallery/placeholder-2.jpg",
        caption: "A beautiful moment",
      },
    ],
  },
  contacts: [
    {
      role: "bride",
      name: "Alfina",
      relation: "Bride",
      phone: "+62-812-3456-7890",
      email: "alfina@example.com",
      whatsapp: "+62-812-3456-7890",
    },
    {
      role: "groom",
      name: "Mugni",
      relation: "Groom",
      phone: "+62-887-6543-2109",
      email: "mugni@example.com",
      whatsapp: "+62-887-6543-2109",
    },
  ],
};

// API Configuration
export const api = {
  baseUrl: "http://localhost:3000/api",
  timeout: 10000,
  retries: 3,
  endpoints: {
    rsvp: "/rsvp",
    contact: "/contact",
    gallery: "/gallery",
    guestMessages: "/guest-messages",
  },
  mock: {
    enabled: true,
    delay: 500, // Simulate network delay
  },
};

// Performance Configuration
export const performance = {
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: "50px",
  },
  imageOptimization: {
    enabled: true,
    formats: ["webp", "jpg"],
    quality: 80,
    sizes: [400, 600, 800, 1200, 1600],
  },
  caching: {
    staticAssets: "1y",
    apiResponses: "5m",
    images: "30d",
  },
};

// Analytics Configuration (Development)
export const analytics = {
  enabled: false, // Disabled in development
  googleAnalytics: {
    measurementId: process.env.VITE_GA_MEASUREMENT_ID || "G-XXXXXXXXXX",
  },
  customEvents: {
    rsvpSubmission: "rsvp_submission",
    photoView: "photo_view",
    sectionView: "section_view",
    contactClick: "contact_click",
  },
};

// Security Configuration
export const security = {
  csp: {
    enabled: false, // Relaxed for development
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
    },
  },
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  },
};

// Logging Configuration
export const logging = {
  level: "debug",
  console: {
    enabled: true,
    colorize: true,
    timestamp: true,
  },
  file: {
    enabled: false, // Typically disabled in development
    filename: "logs/development.log",
  },
  categories: {
    component: "debug",
    api: "info",
    performance: "warn",
    error: "error",
  },
};

// Feature Flags
export const features = {
  rsvpForm: true,
  photoGallery: true,
  guestMessages: true,
  socialSharing: true,
  calendarIntegration: true,
  mapIntegration: true,
  mobileOptimization: true,
  offlineSupport: false, // Experimental
  pushNotifications: false, // Future feature
  liveUpdates: false, // Real-time updates
};

// Development Helpers
export const devHelpers = {
  showComponentBoundaries: false,
  logRenderCycles: false,
  enableDevOverlay: true,
  hotReload: true,
  autoOpenBrowser: true,
  showBuildProgress: true,
};

// Environment Variables
export const env = {
  NODE_ENV: "development",
  VITE_WEDDING_COUPLE: weddingInfo.couple.names,
  VITE_WEDDING_DATE: weddingInfo.event.dateFormatted,
  VITE_WEDDING_LOCATION: `${weddingInfo.event.location.city}, ${weddingInfo.event.location.country}`,
  VITE_WEDDING_HASHTAG: weddingInfo.theme.hashtag,
  VITE_API_BASE_URL: api.baseUrl,
  VITE_ENABLE_MOCK_DATA: mockData.enabled.toString(),
};

// Export all configurations
export default {
  weddingInfo,
  devServer,
  buildConfig,
  typescript,
  styling,
  testing,
  linting,
  devTools,
  mockData,
  api,
  performance,
  analytics,
  security,
  logging,
  features,
  devHelpers,
  env,
};

// Configuration validation
export function validateConfig(config = {}) {
  const errors = [];

  // Validate wedding info
  if (!weddingInfo.couple?.names) {
    errors.push("Wedding couple names are required");
  }

  if (!weddingInfo.event?.date) {
    errors.push("Wedding date is required");
  }

  // Validate development server
  if (!devServer.port || devServer.port < 1000 || devServer.port > 65535) {
    errors.push("Valid development server port is required");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join("\n")}`);
  }

  return true;
}

// Configuration utilities
export const utils = {
  /**
   * Get environment-specific configuration
   */
  getEnvConfig: (env = "development") => {
    return env === "development" ? devConfig : null;
  },

  /**
   * Merge user configuration with defaults
   */
  mergeConfig: (userConfig = {}) => {
    return {
      ...defaultConfig,
      ...userConfig,
      weddingInfo: {
        ...defaultConfig.weddingInfo,
        ...userConfig.weddingInfo,
      },
    };
  },

  /**
   * Get wedding theme colors for CSS
   */
  getThemeCSS: () => {
    return `
      :root {
        --wedding-brown: ${weddingInfo.theme.colors.primary};
        --wedding-accent: ${weddingInfo.theme.colors.accent};
        --wedding-cream: ${weddingInfo.theme.colors.background};
        --wedding-beige: ${weddingInfo.theme.colors.secondary};
      }
    `;
  },
};

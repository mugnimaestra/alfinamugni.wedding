/**
 * This is the base config for vite.
 * When building, the adapter config is used which loads this file and extends it.
 */
import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import { qwikPWA } from "./vite-pwa-wrapper";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json";

type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};
errorOnDuplicatesPkgDeps(devDependencies, dependencies);

/**
 * Note that Vite normally starts from `index.html` but the qwikCity plugin makes start at `src/entry.ssr.tsx` instead.
 */
export default defineConfig(({ command, mode }): UserConfig => {
  const isProduction = mode === "production";

  return {
    plugins: [
      qwikCity(),
      qwikVite({
        // Enhanced optimization for production builds
        ...(isProduction && {
          symbolsOutput: false, // Reduce bundle size
          inlineOptimizations: true,
        }),
      }),
      tsconfigPaths(),
      qwikPWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff2}"],
          // Indonesian-specific caching strategies for mobile networks
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "unsplash-images",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheKeyWillBeUsed: async ({ request }) => {
                  const url = new URL(request.url);
                  // Remove Unsplash query params for better caching
                  url.searchParams.delete('auto');
                  url.searchParams.delete('fit');
                  url.searchParams.delete('w');
                  url.searchParams.delete('q');
                  return url.href;
                },
              },
            },
            // Indonesian wedding content with extended caching
            {
              urlPattern: /\/(id-ID|indonesia|jakarta)/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "indonesian-content",
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 14, // 14 days for Indonesian content
                },
              },
            },
            // RSVP API with offline queue support
            {
              urlPattern: /\/api\/rsvp/,
              handler: "NetworkFirst",
              options: {
                cacheName: "rsvp-api",
                networkTimeoutSeconds: 5, // Extended for Indonesian networks
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 2, // 2 hours
                },
                backgroundSync: {
                  name: "rsvp-queue",
                  options: {
                    maxRetentionTime: 24 * 60 * 60 * 1000, // 24 hours
                  },
                },
              },
            },
            // Gallery API optimized for Indonesian mobile
            {
              urlPattern: /\/api\/gallery/,
              handler: "NetworkFirst",
              options: {
                cacheName: "gallery-api",
                networkTimeoutSeconds: 8, // Longer timeout for image uploads
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 4, // 4 hours for gallery data
                },
              },
            },
            // Upload API with retry logic
            {
              urlPattern: /\/api\/upload/,
              handler: "NetworkOnly",
              options: {
                cacheName: "upload-api",
                backgroundSync: {
                  name: "upload-queue",
                  options: {
                    maxRetentionTime: 48 * 60 * 60 * 1000, // 48 hours for uploads
                  },
                },
              },
            },
            // Indonesian time zone and cultural data
            {
              urlPattern: /\/(timezone|cultural-info|prayer-times)/i,
              handler: "CacheFirst",
              options: {
                cacheName: "cultural-data",
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
              },
            },
            // Wedding assets with Indonesian mobile optimization
            {
              urlPattern: ({ request }) =>
                request.destination === "document" ||
                request.destination === "script" ||
                request.destination === "style",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "wedding-assets",
                expiration: {
                  maxEntries: 150,
                  maxAgeSeconds: 60 * 60 * 24 * 10, // 10 days for core assets
                },
              },
            },
            // Fonts and static resources
            {
              urlPattern: /\.(woff2|woff|ttf|eot)$/,
              handler: "CacheFirst",
              options: {
                cacheName: "fonts-cache",
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year for fonts
                },
              },
            },
          ],
          // Enhanced offline behavior for Indonesian users
          skipWaiting: true,
          clientsClaim: true,
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/_/, /\/api\//, /\.(?:png|jpg|jpeg|svg|webp)$/],
          // Indonesian mobile network optimizations
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB max for mobile
        },
        devOptions: {
          enabled: true,
          type: "module",
        },
        manifest: {
          name: "Alfina & Mugni Wedding",
          short_name: "A&M Wedding",
          description: "Wedding website for Alfina & Mugni - November 29, 2025, Jakarta, Indonesia",
          theme_color: "#4d3326",
          background_color: "#faf7f5",
          display: "standalone",
          orientation: "portrait",
          scope: "/",
          start_url: "/",
          lang: "id-ID",
          categories: ["lifestyle", "wedding", "photography"],
          icons: [
            {
              src: "/icons/icon-72x72.png",
              sizes: "72x72",
              type: "image/png",
              purpose: "maskable any"
            },
            {
              src: "/icons/icon-96x96.png",
              sizes: "96x96",
              type: "image/png",
              purpose: "maskable any"
            },
            {
              src: "/icons/icon-128x128.png",
              sizes: "128x128",
              type: "image/png",
              purpose: "maskable any"
            },
            {
              src: "/icons/icon-144x144.png",
              sizes: "144x144",
              type: "image/png",
              purpose: "maskable any"
            },
            {
              src: "/icons/icon-152x152.png",
              sizes: "152x152",
              type: "image/png",
              purpose: "maskable any"
            },
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable any"
            },
            {
              src: "/icons/icon-384x384.png",
              sizes: "384x384",
              type: "image/png",
              purpose: "maskable any"
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable any"
            }
          ],
          shortcuts: [
            {
              name: "Photo Gallery",
              short_name: "Gallery",
              description: "View and upload wedding photos",
              url: "/#gallery",
              icons: [
                {
                  src: "/icons/gallery-shortcut.png",
                  sizes: "96x96"
                }
              ]
            },
            {
              name: "RSVP",
              short_name: "RSVP",
              description: "Confirm your attendance",
              url: "/#rsvp",
              icons: [
                {
                  src: "/icons/rsvp-shortcut.png",
                  sizes: "96x96"
                }
              ]
            },
            {
              name: "Wedding Details",
              short_name: "Details",
              description: "Venue and schedule information",
              url: "/#details",
              icons: [
                {
                  src: "/icons/details-shortcut.png",
                  sizes: "96x96"
                }
              ]
            }
          ],
        },
      })
    ],
    css: {
      postcss: './postcss.config.js',
    },
    // This tells Vite which dependencies to pre-build in dev mode.
    optimizeDeps: {
      // Put problematic deps that break bundling here, mostly those with binaries.
      // For example ['better-sqlite3'] if you use that in server functions.
      exclude: [],
    },

    /**
     * This is an advanced setting. It improves the bundling of your server code. To use it, make sure you understand when your consumed packages are dependencies or dev dependencies. (otherwise things will break in production)
     */
    // ssr:
    //   command === "build" && mode === "production"
    //     ? {
    //         // All dev dependencies should be bundled in the server build
    //         noExternal: Object.keys(devDependencies),
    //         // Anything marked as a dependency will not be bundled
    //         // These should only be production binary deps (including deps of deps), CLI deps, and their module graph
    //         // If a dep-of-dep needs to be external, add it here
    //         // For example, if something uses `bcrypt` but you don't have it as a dep, you can write
    //         // external: [...Object.keys(dependencies), 'bcrypt']
    //         external: Object.keys(dependencies),
    //       }
    //     : undefined,

    server: {
      headers: {
        // Don't cache the server response in dev mode
        "Cache-Control": "public, max-age=0",
      },
    },
    preview: {
      headers: {
        // Do cache the server response in preview (non-adapter production build)
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});

// *** utils ***

/**
 * Function to identify duplicate dependencies and throw an error
 * @param {Object} devDependencies - List of development dependencies
 * @param {Object} dependencies - List of production dependencies
 */
function errorOnDuplicatesPkgDeps(
  devDependencies: PkgDep,
  dependencies: PkgDep,
) {
  let msg = "";
  // Create an array 'duplicateDeps' by filtering devDependencies.
  // If a dependency also exists in dependencies, it is considered a duplicate.
  const duplicateDeps = Object.keys(devDependencies).filter(
    (dep) => dependencies[dep],
  );

  // include any known qwik packages
  const qwikPkg = Object.keys(dependencies).filter((value) =>
    /qwik/i.test(value),
  );

  // any errors for missing "qwik-city-plan"
  // [PLUGIN_ERROR]: Invalid module "@qwik-city-plan" is not a valid package
  msg = `Move qwik packages ${qwikPkg.join(", ")} to devDependencies`;

  if (qwikPkg.length > 0) {
    throw new Error(msg);
  }

  // Format the error message with the duplicates list.
  // The `join` function is used to represent the elements of the 'duplicateDeps' array as a comma-separated string.
  msg = `
    Warning: The dependency "${duplicateDeps.join(", ")}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `;

  // Throw an error with the constructed message.
  if (duplicateDeps.length > 0) {
    throw new Error(msg);
  }
}

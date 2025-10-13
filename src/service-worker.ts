/**
 * Enhanced Service Worker for Wedding Website PWA
 * Optimized for Indonesian mobile networks with advanced caching strategies
 */

import { initImageOptimizer, optimizeImage } from './sw-plugins/image-optimizer';
import { initIndonesianCache, cacheIndonesianContent, getIndonesianContent } from './sw-plugins/indonesian-cache';
import { initOfflineQueue } from './sw-plugins/offline-queue';

// Service Worker global scope types
declare const self: ServiceWorkerGlobalScope & {
  clients: Clients;
  skipWaiting(): void;
  registration: ServiceWorkerRegistration;
};

// SyncEvent type for background sync
interface SyncEvent extends ExtendableEvent {
  tag: string;
  lastChance: boolean;
}

// Service Worker version for cache management
const SW_VERSION = '1.0.0';
const CACHE_NAME = `wedding-cache-v${SW_VERSION}`;

// Cache strategies for different content types
const CACHE_STRATEGIES = {
  // Static assets - cache first with long TTL
  static: {
    name: 'static-cache',
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
    maxEntries: 100,
    strategy: 'cacheFirst'
  },
  
  // Images - cache first with medium TTL
  images: {
    name: 'images-cache',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 200,
    strategy: 'cacheFirst'
  },
  
  // API responses - network first with short TTL
  api: {
    name: 'api-cache',
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50,
    strategy: 'networkFirst'
  },
  
  // Pages - stale while revalidate
  pages: {
    name: 'pages-cache',
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 20,
    strategy: 'staleWhileRevalidate'
  }
};

// Indonesian-specific cache configurations
const INDONESIAN_CACHE_CONFIG = {
  weddingContentTTL: 14 * 24 * 60 * 60 * 1000, // 14 days for wedding content
  culturalContentTTL: 30 * 24 * 60 * 60 * 1000, // 30 days for cultural content
  jakartaTimezoneDataTTL: 7 * 24 * 60 * 60 * 1000, // 7 days for timezone data
  carrierOptimizationTTL: 24 * 60 * 60 * 1000, // 24 hours for carrier optimization
  ramadanModeAware: true,
  workingHoursOptimization: true,
};

// Install event - cache critical resources
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log(`[ServiceWorker] Installing version ${SW_VERSION}`);
  
  event.waitUntil(
    (async () => {
      // Initialize plugins
      initImageOptimizer();
      initIndonesianCache(INDONESIAN_CACHE_CONFIG);
      initOfflineQueue();
      
      // Cache critical resources
      const cache = await caches.open(CACHE_NAME);
      const criticalUrls = [
        '/',
        '/manifest.json',
        '/#rsvp',
        '/#gallery',
        '/#details',
        '/#contact',
        // Critical CSS and JS
        '/build/qwik-legacy.js',
        '/build/qwik.css',
        // Critical images
        '/images/hero-banner.webp',
        '/images/wedding-couple.webp',
      ];
      
      try {
        await cache.addAll(criticalUrls);
        console.log('[ServiceWorker] Critical resources cached successfully');
      } catch (error) {
        console.warn('[ServiceWorker] Failed to cache some critical resources:', error);
      }
      
      // Skip waiting to activate immediately
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log(`[ServiceWorker] Activating version ${SW_VERSION}`);
  
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        name.startsWith('wedding-cache-') && name !== CACHE_NAME
      );
      
      await Promise.all(
        oldCaches.map(name => {
          console.log(`[ServiceWorker] Deleting old cache: ${name}`);
          return caches.delete(name);
        })
      );
      
      // Clean up old plugin caches
      await cleanupPluginCaches();
      
      // Take control of all pages
      await self.clients.claim();
      
      console.log('[ServiceWorker] Activation complete');
    })()
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and external resources
  if (request.method !== 'GET' || !url.origin.includes(self.location.origin)) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  try {
    // Route to appropriate handler based on URL pattern
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request);
    } else if (isImageRequest(request)) {
      return handleImageRequest(request);
    } else if (isStaticAsset(request)) {
      return handleStaticRequest(request);
    } else {
      return handlePageRequest(request);
    }
  } catch (error) {
    console.error('[ServiceWorker] Request handling failed:', error);
    return new Response('Service Worker Error', { status: 500 });
  }
}

// Handle API requests with network-first strategy
async function handleApiRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_STRATEGIES.api.name);
  const url = new URL(request.url);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      
      // Cache API data in Indonesian cache for offline access
      if (url.pathname.includes('/rsvp') || url.pathname.includes('/wishes')) {
        const data = await networkResponse.json();
        await cacheIndonesianContent(
          url.pathname,
          data,
          url.pathname.includes('/rsvp') ? 'wedding-details' : 'cultural-info',
          CACHE_STRATEGIES.api.maxAge
        );
      }
      
      return networkResponse;
    }
  } catch (error) {
    console.log('[ServiceWorker] Network request failed, trying cache:', error);
  }
  
  // Fallback to cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Try Indonesian cache for specific endpoints
  if (url.pathname.includes('/rsvp') || url.pathname.includes('/wishes')) {
    const cachedData = await getIndonesianContent(url.pathname);
    if (cachedData) {
      return new Response(JSON.stringify(cachedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Return offline fallback
  return new Response(
    JSON.stringify({ 
      error: 'Offline - Please check your connection',
      offline: true 
    }),
    { 
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Handle image requests with optimization and caching
async function handleImageRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_STRATEGIES.images.name);
  const url = new URL(request.url);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Add cache headers for browser caching
    const headers = new Headers(cachedResponse.headers);
    headers.set('Cache-Control', 'public, max-age=2592000, immutable'); // 30 days
    headers.set('X-Cache', 'HIT');
    
    return new Response(cachedResponse.body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers
    });
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Optimize image if it's a photo upload
      if (url.pathname.includes('/uploads/') || url.pathname.includes('/gallery/')) {
        const blob = await networkResponse.blob();
        const optimizedBlob = await optimizeImage(blob, url.href);
        
        const optimizedResponse = new Response(optimizedBlob, {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers: {
            'Content-Type': optimizedBlob.type,
            'Content-Length': optimizedBlob.size.toString(),
            'Cache-Control': 'public, max-age=2592000, immutable',
            'X-Cache': 'MISS-OPTIMIZED',
            'X-Image-Optimized': 'true'
          }
        });
        
        // Cache optimized version
        await cache.put(request, optimizedResponse.clone());
        return optimizedResponse;
      }
      
      // Cache original image
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      
      // Add cache headers
      const headers = new Headers(networkResponse.headers);
      headers.set('Cache-Control', 'public, max-age=2592000, immutable');
      headers.set('X-Cache', 'MISS');
      
      return new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers
      });
    }
  } catch (error) {
    console.log('[ServiceWorker] Image fetch failed, trying cache:', error);
  }
  
  // Return cached version if available
  const cachedFallback = await cache.match(request);
  if (cachedFallback) {
    return cachedFallback;
  }
  
  // Return placeholder image
  return new Response(
    '<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666">Image unavailable</text></svg>',
    {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' }
    }
  );
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_STRATEGIES.static.name);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    const headers = new Headers(cachedResponse.headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
    headers.set('X-Cache', 'HIT');
    
    return new Response(cachedResponse.body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers
    });
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the response
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      
      // Add cache headers
      const headers = new Headers(networkResponse.headers);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('X-Cache', 'MISS');
      
      return new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers
      });
    }
  } catch (error) {
    console.log('[ServiceWorker] Static asset fetch failed:', error);
  }
  
  // Return cached version if available
  const cachedFallback = await cache.match(request);
  if (cachedFallback) {
    return cachedFallback;
  }
  
  return new Response('Asset not available offline', { status: 404 });
}

// Handle page requests with stale-while-revalidate strategy
async function handlePageRequest(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_STRATEGIES.pages.name);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  
  // Always try to fetch from network in background
  const networkPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not ok');
  }).catch(error => {
    console.log('[ServiceWorker] Page fetch failed:', error);
    return null;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    const headers = new Headers(cachedResponse.headers);
    headers.set('Cache-Control', 'public, max-age=3600');
    headers.set('X-Cache', 'STALE');
    
    // Don't wait for network, but update cache in background
    networkPromise.then(response => {
      if (response) {
        console.log('[ServiceWorker] Page updated in background');
      }
    });
    
    return new Response(cachedResponse.body, {
      status: cachedResponse.status,
      statusText: cachedResponse.statusText,
      headers
    });
  }
  
  // Wait for network if no cache available
  try {
    const networkResponse = await networkPromise;
    if (networkResponse) {
      const headers = new Headers(networkResponse.headers);
      headers.set('Cache-Control', 'public, max-age=3600');
      headers.set('X-Cache', 'MISS');
      
      return new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers
      });
    }
  } catch (error) {
    console.log('[ServiceWorker] Network and cache failed for page:', error);
  }
  
  // Return offline fallback page
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Alfina & Mugni Wedding</title>
      <style>
        body { font-family: system-ui, sans-serif; text-align: center; padding: 2rem; }
        .offline { max-width: 400px; margin: 0 auto; }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
      </style>
    </head>
    <body>
      <div class="offline">
        <div class="icon">📵</div>
        <h1>You're Offline</h1>
        <p>Please check your internet connection and try again.</p>
        <p>Some wedding information may still be available from cache.</p>
        <button onclick="window.location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// Helper functions
function isImageRequest(request: Request): boolean {
  const url = new URL(request.url);
  return /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url.pathname);
}

function isStaticAsset(request: Request): boolean {
  const url = new URL(request.url);
  return /\.(js|css|woff|woff2|ttf|eot|ico)$/i.test(url.pathname);
}

async function cleanupPluginCaches(): Promise<void> {
  try {
    // Clean up old image optimizer cache
    if ('caches' in self) {
      const cacheNames = await caches.keys();
      const pluginCaches = cacheNames.filter(name => 
        name.includes('optimized-images-cache') || 
        name.includes('wedding-indonesian-content') ||
        name.includes('offline-queue')
      );
      
      // Keep only the latest versions
      await Promise.all(
        pluginCaches.map(async (name) => {
          try {
            const cache = await caches.open(name);
            const requests = await cache.keys();
            
            // Remove old entries (older than 7 days)
            const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const oldRequests = requests.filter(async (request) => {
              const response = await cache.match(request);
              const dateHeader = response?.headers.get('date');
              if (dateHeader) {
                return new Date(dateHeader).getTime() < cutoffTime;
              }
              return false;
            });
            
            await Promise.all(oldRequests.map(request => cache.delete(request)));
          } catch (error) {
            console.warn(`[ServiceWorker] Failed to clean plugin cache ${name}:`, error);
          }
        })
      );
    }
  } catch (error) {
    console.warn('[ServiceWorker] Plugin cache cleanup failed:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  const syncEvent = event as SyncEvent;
  if (syncEvent.tag === 'background-sync-rsvp') {
    syncEvent.waitUntil(syncOfflineRSVPs());
  } else if (syncEvent.tag === 'background-sync-wishes') {
    syncEvent.waitUntil(syncOfflineWishes());
  } else if (syncEvent.tag === 'background-sync-photos') {
    syncEvent.waitUntil(syncOfflinePhotos());
  }
});

async function syncOfflineRSVPs(): Promise<void> {
  console.log('[ServiceWorker] Syncing offline RSVPs');
  // Implementation would sync queued RSVP submissions
}

async function syncOfflineWishes(): Promise<void> {
  console.log('[ServiceWorker] Syncing offline wishes');
  // Implementation would sync queued wish submissions
}

async function syncOfflinePhotos(): Promise<void> {
  console.log('[ServiceWorker] Syncing offline photos');
  // Implementation would sync queued photo uploads
}

// Push notification handling
self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Wedding Update', {
        body: data.body || 'There\'s an update for the wedding',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'wedding-update',
        data: {
          url: '/'
        }
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Message handling for cache management
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache(event.data.urls));
  }
});

async function updateCache(urls: string[]): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls);
  console.log('[ServiceWorker] Cache updated for:', urls);
}

export {};
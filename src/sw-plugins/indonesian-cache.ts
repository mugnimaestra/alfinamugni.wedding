/**
 * Indonesian-specific caching strategies
 * Optimized for Indonesian wedding content and cultural context
 */

import type { NetworkConnectionAPI } from '../utils/network-utils';

export interface IndonesianCacheConfig {
  weddingContentTTL: number; // Wedding-specific content cache duration
  culturalContentTTL: number; // Indonesian cultural content cache duration
  jakartaTimezoneDataTTL: number; // Jakarta timezone data cache duration
  carrierOptimizationTTL: number; // Carrier-specific optimization cache duration
  ramadanModeAware: boolean; // Adjust caching during Ramadan
  workingHoursOptimization: boolean; // Optimize for Indonesian working hours
}

const DEFAULT_CONFIG: IndonesianCacheConfig = {
  weddingContentTTL: 14 * 24 * 60 * 60 * 1000, // 14 days
  culturalContentTTL: 30 * 24 * 60 * 60 * 1000, // 30 days
  jakartaTimezoneDataTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
  carrierOptimizationTTL: 24 * 60 * 60 * 1000, // 24 hours
  ramadanModeAware: true,
  workingHoursOptimization: true,
};

export interface CachedContent<T = unknown> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  contentType: IndonesianContentType;
  jakartaTimestamp: string;
  metadata: {
    size: number;
    carrier?: string;
    networkType?: string;
    isRamadan?: boolean;
    isWorkingHours?: boolean;
  };
}

export type IndonesianContentType =
  | 'wedding-details'
  | 'cultural-info'
  | 'prayer-times'
  | 'jakarta-timezone'
  | 'carrier-optimization'
  | 'venue-info'
  | 'transportation'
  | 'accommodation'
  | 'traditional-customs';

export class IndonesianCache {
  private cacheName = 'indonesian-wedding-cache';
  private dbName = 'wedding-indonesian-content';
  private dbVersion = 1;
  private storeName = 'content';
  private db: IDBDatabase | null = null;
  private config: IndonesianCacheConfig;

  constructor(config: Partial<IndonesianCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('contentType', 'contentType', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('jakartaTimestamp', 'jakartaTimestamp', { unique: false });
          store.createIndex('carrier', 'metadata.carrier', { unique: false });
        }
      };
    });
  }

  async cacheContent<T>(
    key: string,
    data: T,
    contentType: IndonesianContentType,
    customTTL?: number
  ): Promise<void> {
    if (!this.db) await this.initDB();

    const now = Date.now();
    const jakartaTime = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const ttl = customTTL || this.getTTLForContentType(contentType);
    const carrier = this.detectIndonesianCarrier();
    const networkType = this.getNetworkType();

    const cachedContent: CachedContent<T> = {
      key,
      data,
      timestamp: now,
      ttl,
      contentType,
      jakartaTimestamp: jakartaTime,
      metadata: {
        size: this.calculateDataSize(data),
        carrier,
        networkType,
        isRamadan: this.isRamadan(),
        isWorkingHours: this.isIndonesianWorkingHours(),
      },
    };

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.put(cachedContent);
      request.onsuccess = () => {
        console.log(`[IndonesianCache] Cached ${contentType} content: ${key}`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getContent<T = unknown>(key: string): Promise<T | null> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => {
        const cached: CachedContent<T> | undefined = request.result;

        if (!cached) {
          resolve(null);
          return;
        }

        // Check if content has expired
        if (this.isExpired(cached)) {
          console.log(`[IndonesianCache] Content expired: ${key}`);
          this.deleteContent(key);
          resolve(null);
          return;
        }

        // Check if carrier or network conditions have changed significantly
        if (!this.isContentValidForCurrentConditions(cached)) {
          console.log(`[IndonesianCache] Content invalid for current conditions: ${key}`);
          resolve(null);
          return;
        }

        console.log(`[IndonesianCache] Retrieved valid content: ${key}`);
        resolve(cached.data as T);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getContentByType(contentType: IndonesianContentType): Promise<CachedContent<unknown>[]> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('contentType');

    return new Promise((resolve, reject) => {
      const request = index.getAll(contentType);

      request.onsuccess = () => {
        const results: CachedContent<unknown>[] = request.result.filter(item => !this.isExpired(item));
        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  private getTTLForContentType(contentType: IndonesianContentType): number {
    switch (contentType) {
      case 'wedding-details':
      case 'venue-info':
        return this.config.weddingContentTTL;

      case 'cultural-info':
      case 'traditional-customs':
        return this.config.culturalContentTTL;

      case 'jakarta-timezone':
        return this.config.jakartaTimezoneDataTTL;

      case 'carrier-optimization':
        return this.config.carrierOptimizationTTL;

      case 'prayer-times':
        // Prayer times change daily, but cache for performance
        return 24 * 60 * 60 * 1000; // 24 hours

      case 'transportation':
      case 'accommodation':
        return 7 * 24 * 60 * 60 * 1000; // 7 days

      default:
        return this.config.weddingContentTTL;
    }
  }

  private detectIndonesianCarrier(): string {
    // Heuristic detection based on network characteristics
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return 'unknown';
    }

    const connection = (navigator as NetworkConnectionAPI).connection;
    const downlink = connection?.downlink || 0;
    const rtt = connection?.rtt || 0;

    // Indonesian carrier detection heuristics
    if (downlink > 20 && rtt < 50) {
      return 'telkomsel'; // Usually has better infrastructure
    } else if (downlink > 15 && rtt < 80) {
      return 'xl-axiata';
    } else if (downlink > 10 && rtt < 100) {
      return 'indosat';
    } else if (downlink > 5) {
      return 'tri-3';
    }

    return 'unknown';
  }

  private getNetworkType(): string {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return '4g';
    }

    const connection = (navigator as NetworkConnectionAPI).connection;
    return connection?.effectiveType || '4g';
  }

  private isExpired(cached: CachedContent<unknown>): boolean {
    const now = Date.now();

    // Adjust TTL based on Indonesian context
    let adjustedTTL = cached.ttl;

    // During Ramadan, extend cache for prayer times and cultural content
    if (this.config.ramadanModeAware && this.isRamadan()) {
      if (cached.contentType === 'prayer-times' || cached.contentType === 'cultural-info') {
        adjustedTTL *= 0.5; // Refresh more frequently during Ramadan
      }
    }

    // During Indonesian working hours, use shorter cache for dynamic content
    if (this.config.workingHoursOptimization && this.isIndonesianWorkingHours()) {
      if (cached.contentType === 'transportation' || cached.contentType === 'venue-info') {
        adjustedTTL *= 0.7; // Refresh more frequently during peak hours
      }
    }

    return (now - cached.timestamp) > adjustedTTL;
  }

  private isContentValidForCurrentConditions(cached: CachedContent<unknown>): boolean {
    const currentCarrier = this.detectIndonesianCarrier();

    // If carrier optimization is important for this content type
    if (cached.contentType === 'carrier-optimization') {
      return cached.metadata.carrier === currentCarrier;
    }

    // For general content, allow cross-carrier usage unless there's a significant difference
    return true;
  }

  private isRamadan(): boolean {
    // Approximate Ramadan detection (would need proper Islamic calendar calculation)
    const now = new Date();
    const year = now.getFullYear();

    // This is a simplified check - in production, use proper Islamic calendar library
    const ramadanStart = new Date(year, 2, 1); // Approximate
    const ramadanEnd = new Date(year, 3, 30); // Approximate

    return now >= ramadanStart && now <= ramadanEnd;
  }

  private isIndonesianWorkingHours(): boolean {
    const jakartaTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
    const hour = new Date(jakartaTime).getHours();

    // Indonesian working hours: 8 AM - 6 PM WIB
    return hour >= 8 && hour <= 18;
  }

  private calculateDataSize<T>(data: T): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  async deleteContent(key: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanExpiredContent(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const allContent: CachedContent<unknown>[] = request.result;
        const deletePromises = allContent
          .filter(content => this.isExpired(content))
          .map(content => this.deleteContent(content.key));

        Promise.all(deletePromises).then(() => resolve()).catch(reject);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    itemsByType: Record<IndonesianContentType, number>;
    oldestItem: Date | null;
  }> {
    if (!this.db) return {
      totalItems: 0,
      totalSize: 0,
      itemsByType: {} as Record<IndonesianContentType, number>,
      oldestItem: null,
    };

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const allContent: CachedContent<unknown>[] = request.result;

        const stats = {
          totalItems: allContent.length,
          totalSize: allContent.reduce((sum, item) => sum + item.metadata.size, 0),
          itemsByType: {} as Record<IndonesianContentType, number>,
          oldestItem: allContent.length > 0
            ? new Date(Math.min(...allContent.map(item => item.timestamp)))
            : null,
        };

        // Count items by type
        allContent.forEach(item => {
          stats.itemsByType[item.contentType] = (stats.itemsByType[item.contentType] || 0) + 1;
        });

        resolve(stats);
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Global instance
let indonesianCache: IndonesianCache;

export function initIndonesianCache(config?: Partial<IndonesianCacheConfig>): void {
  indonesianCache = new IndonesianCache(config);

  // Clean expired content periodically
  setInterval(() => {
    indonesianCache.cleanExpiredContent().catch(console.error);
  }, 60 * 60 * 1000); // Every hour
}

export function cacheIndonesianContent<T>(
  key: string,
  data: T,
  contentType: IndonesianContentType,
  customTTL?: number
): Promise<void> {
  if (!indonesianCache) {
    initIndonesianCache();
  }

  return indonesianCache.cacheContent(key, data, contentType, customTTL);
}

export function getIndonesianContent<T = unknown>(key: string): Promise<T | null> {
  if (!indonesianCache) {
    initIndonesianCache();
  }

  return indonesianCache.getContent(key);
}

export function getIndonesianContentByType(contentType: IndonesianContentType): Promise<CachedContent<unknown>[]> {
  if (!indonesianCache) {
    initIndonesianCache();
  }

  return indonesianCache.getContentByType(contentType);
}

export function getIndonesianCacheStats() {
  return indonesianCache?.getCacheStats() || Promise.resolve({
    totalItems: 0,
    totalSize: 0,
    itemsByType: {} as Record<IndonesianContentType, number>,
    oldestItem: null,
  });
}
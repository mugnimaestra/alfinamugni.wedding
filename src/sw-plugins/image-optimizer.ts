/**
 * Image Optimizer Service Worker Plugin
 * Adaptive image compression based on Indonesian network conditions
 */

import { getNetworkInfo, getOptimalCompressionSettings, type NetworkInfo, type CompressionSettings } from '../utils/network-utils';

export interface ImageOptimizationResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  format: string;
  quality: number;
  processingTime: number;
}

export interface ImageCacheEntry {
  url: string;
  compressedBlob: Blob;
  metadata: ImageOptimizationResult;
  timestamp: number;
  networkConditions: NetworkInfo;
}

export class ImageOptimizer {
  private cacheName = 'optimized-images-cache';
  private dbName = 'wedding-image-cache';
  private dbVersion = 1;
  private storeName = 'images';
  private db: IDBDatabase | null = null;

  constructor() {
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
          const store = db.createObjectStore(this.storeName, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('size', 'metadata.compressedSize', { unique: false });
        }
      };
    });
  }

  async optimizeImage(imageBlob: Blob, targetSettings?: CompressionSettings): Promise<ImageOptimizationResult> {
    const startTime = performance.now();
    const originalSize = imageBlob.size;

    const networkInfo = getNetworkInfo();
    const settings = targetSettings || getOptimalCompressionSettings(networkInfo);

    try {
      // Create image element for processing
      const imageUrl = URL.createObjectURL(imageBlob);
      const image = await this.loadImage(imageUrl);

      // Create canvas for compression
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // Calculate optimal dimensions
      const { width, height } = this.calculateOptimalDimensions(
        image.width,
        image.height,
        settings.maxWidth,
        settings.maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      // Apply Indonesian mobile network optimizations
      if (this.isSlowConnection(networkInfo)) {
        // Reduce quality further for slow connections
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'low';
      } else {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
      }

      // Draw and compress
      ctx.drawImage(image, 0, 0, width, height);

      const compressedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
          `image/${settings.format}`,
          settings.quality
        );
      });

      URL.revokeObjectURL(imageUrl);

      const processingTime = performance.now() - startTime;
      const compressedSize = compressedBlob.size;

      return {
        originalSize,
        compressedSize,
        compressionRatio: originalSize / compressedSize,
        format: settings.format,
        quality: settings.quality,
        processingTime,
      };
    } catch (error) {
      console.error('[ImageOptimizer] Compression failed:', error);
      throw error;
    }
  }

  async optimizeAndCache(url: string, imageBlob: Blob): Promise<Blob> {
    if (!this.db) await this.initDB();

    try {
      // Check if already cached with current network conditions
      const cached = await this.getCachedImage(url);
      if (cached && this.isCacheValid(cached)) {
        console.log(`[ImageOptimizer] Using cached optimized image: ${url}`);
        return cached.compressedBlob;
      }

      // Optimize image
      const result = await this.optimizeImage(imageBlob);
      const compressedBlob = await this.createCompressedBlob(imageBlob);

      // Cache the optimized image
      await this.cacheOptimizedImage(url, compressedBlob, result);

      console.log(`[ImageOptimizer] Optimized and cached: ${url}`, {
        originalSize: (result.originalSize / 1024).toFixed(1) + 'KB',
        compressedSize: (result.compressedSize / 1024).toFixed(1) + 'KB',
        compressionRatio: result.compressionRatio.toFixed(2),
        processingTime: result.processingTime.toFixed(1) + 'ms',
      });

      return compressedBlob;
    } catch (error) {
      console.warn(`[ImageOptimizer] Failed to optimize ${url}:`, error);
      return imageBlob; // Return original on failure
    }
  }

  private async createCompressedBlob(originalBlob: Blob): Promise<Blob> {
    const networkInfo = getNetworkInfo();
    const settings = getOptimalCompressionSettings(networkInfo);

    const imageUrl = URL.createObjectURL(originalBlob);
    const image = await this.loadImage(imageUrl);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const { width, height } = this.calculateOptimalDimensions(
      image.width,
      image.height,
      settings.maxWidth,
      settings.maxHeight
    );

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);

    const compressedBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
        `image/${settings.format}`,
        settings.quality
      );
    });

    URL.revokeObjectURL(imageUrl);
    return compressedBlob;
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      image.src = src;
    });
  }

  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  private isSlowConnection(networkInfo: NetworkInfo): boolean {
    return (
      networkInfo.saveData ||
      networkInfo.effectiveType === '2g' ||
      networkInfo.effectiveType === 'slow-2g' ||
      (networkInfo.downlink && networkInfo.downlink < 5)
    );
  }

  private async getCachedImage(url: string): Promise<ImageCacheEntry | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(url);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async cacheOptimizedImage(
    url: string,
    compressedBlob: Blob,
    metadata: ImageOptimizationResult
  ): Promise<void> {
    if (!this.db) return;

    const cacheEntry: ImageCacheEntry = {
      url,
      compressedBlob,
      metadata,
      timestamp: Date.now(),
      networkConditions: getNetworkInfo(),
    };

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.put(cacheEntry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private isCacheValid(cached: ImageCacheEntry): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const isExpired = Date.now() - cached.timestamp > maxAge;

    if (isExpired) return false;

    // Check if network conditions are similar
    const currentNetwork = getNetworkInfo();
    const cachedNetwork = cached.networkConditions;

    // Allow cached version if network conditions are similar or better
    const networkCompatible =
      currentNetwork.effectiveType === cachedNetwork.effectiveType ||
      this.isNetworkBetter(currentNetwork, cachedNetwork);

    return networkCompatible;
  }

  private isNetworkBetter(current: NetworkInfo, cached: NetworkInfo): boolean {
    const typeOrder = { 'slow-2g': 1, '2g': 2, '3g': 3, '4g': 4 };
    const currentType = typeOrder[current.effectiveType || '4g'];
    const cachedType = typeOrder[cached.effectiveType || '4g'];

    return currentType >= cachedType;
  }

  async cleanCache(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('timestamp');

    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
    const range = IDBKeyRange.upperBound(cutoffTime);

    return new Promise<void>((resolve, reject) => {
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getCacheStats(): Promise<{count: number, totalSize: number}> {
    if (!this.db) return { count: 0, totalSize: 0 };

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        const entries: ImageCacheEntry[] = request.result;
        const totalSize = entries.reduce((sum, entry) => sum + entry.metadata.compressedSize, 0);

        resolve({
          count: entries.length,
          totalSize,
        });
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Global instance
let imageOptimizer: ImageOptimizer;

export function initImageOptimizer(): void {
  imageOptimizer = new ImageOptimizer();

  // Clean cache periodically
  setInterval(() => {
    imageOptimizer.cleanCache().catch(console.error);
  }, 60 * 60 * 1000); // Every hour
}

export function optimizeImage(imageBlob: Blob, url?: string): Promise<Blob> {
  if (!imageOptimizer) {
    initImageOptimizer();
  }

  if (url) {
    return imageOptimizer.optimizeAndCache(url, imageBlob);
  } else {
    return imageOptimizer.optimizeImage(imageBlob).then(() => imageBlob);
  }
}

export function getImageCacheStats() {
  return imageOptimizer?.getCacheStats() || Promise.resolve({ count: 0, totalSize: 0 });
}
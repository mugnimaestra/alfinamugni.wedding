/**
 * Offline Queue Service Worker Plugin
 * Manages offline form submissions and data synchronization
 */

export interface OfflineQueueItem {
  id: string;
  type: 'rsvp' | 'wish' | 'photo' | 'contact';
  data: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  url: string;
  method: string;
  headers: Record<string, string>;
}

export interface OfflineQueueStats {
  totalItems: number;
  itemsByType: Record<string, number>;
  oldestItem: Date | null;
  retryAttempts: number;
}

export class OfflineQueue {
  private dbName = 'wedding-offline-queue';
  private dbVersion = 1;
  private storeName = 'queue';
  private db: IDBDatabase | null = null;
  private syncInProgress = false;

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
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('retryCount', 'retryCount', { unique: false });
        }
      };
    });
  }

  async addItem(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.initDB();

    const queueItem: OfflineQueueItem = {
      ...item,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.put(queueItem);
      request.onsuccess = () => {
        console.log(`[OfflineQueue] Added ${item.type} item to queue`);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getItems(type?: string): Promise<OfflineQueueItem[]> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      let request: IDBRequest;

      if (type) {
        const index = store.index('type');
        request = index.getAll(type);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getNextItem(): Promise<OfflineQueueItem | null> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const request = index.openCursor();
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          resolve(cursor.value);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateItem(id: string, updates: Partial<OfflineQueueItem>): Promise<void> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          const updatedItem = { ...item, ...updates };
          const updateRequest = store.put(updatedItem);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Item not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async removeItem(id: string): Promise<void> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async syncItems(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      console.log('[OfflineQueue] Sync already in progress');
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      while (true) {
        const item = await this.getNextItem();
        if (!item) break;

        try {
          const success = await this.syncItem(item);
          if (success) {
            await this.removeItem(item.id);
            successCount++;
            console.log(`[OfflineQueue] Successfully synced ${item.type} item`);
          } else {
            // Update retry count
            const updatedItem = {
              ...item,
              retryCount: item.retryCount + 1,
            };

            if (updatedItem.retryCount >= updatedItem.maxRetries) {
              await this.removeItem(item.id);
              console.warn(`[OfflineQueue] Max retries exceeded for ${item.type} item`);
              failedCount++;
            } else {
              await this.updateItem(item.id, { retryCount: updatedItem.retryCount });
              console.log(`[OfflineQueue] Retry ${updatedItem.retryCount}/${updatedItem.maxRetries} for ${item.type} item`);
            }
          }
        } catch (error) {
          console.error(`[OfflineQueue] Failed to sync ${item.type} item:`, error);
          failedCount++;
        }
      }
    } finally {
      this.syncInProgress = false;
    }

    return { success: successCount, failed: failedCount };
  }

  private async syncItem(item: OfflineQueueItem): Promise<boolean> {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          ...item.headers,
        },
        body: JSON.stringify(item.data),
      });

      return response.ok;
    } catch (error) {
      console.error(`[OfflineQueue] Network error syncing ${item.type}:`, error);
      return false;
    }
  }

  async getStats(): Promise<OfflineQueueStats> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const items: OfflineQueueItem[] = request.result || [];

        const stats: OfflineQueueStats = {
          totalItems: items.length,
          itemsByType: {},
          oldestItem: items.length > 0 ? new Date(Math.min(...items.map(item => item.timestamp))) : null,
          retryAttempts: items.reduce((sum, item) => sum + item.retryCount, 0),
        };

        // Count items by type
        items.forEach(item => {
          stats.itemsByType[item.type] = (stats.itemsByType[item.type] || 0) + 1;
        });

        resolve(stats);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearQueue(): Promise<void> {
    if (!this.db) await this.initDB();

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        console.log('[OfflineQueue] Queue cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global instance
let offlineQueue: OfflineQueue;

export function initOfflineQueue(): void {
  offlineQueue = new OfflineQueue();
  
  // Try to sync when coming back online
  if ('addEventListener' in self) {
    self.addEventListener('online', () => {
      console.log('[OfflineQueue] Back online, attempting sync');
      offlineQueue.syncItems().catch(console.error);
    });
  }
}

export function addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
  if (!offlineQueue) {
    initOfflineQueue();
  }
  return offlineQueue.addItem(item);
}

export function getOfflineQueueItems(type?: string): Promise<OfflineQueueItem[]> {
  if (!offlineQueue) {
    initOfflineQueue();
  }
  return offlineQueue.getItems(type);
}

export function syncOfflineQueue(): Promise<{ success: number; failed: number }> {
  if (!offlineQueue) {
    initOfflineQueue();
  }
  return offlineQueue.syncItems();
}

export function getOfflineQueueStats(): Promise<OfflineQueueStats> {
  if (!offlineQueue) {
    initOfflineQueue();
  }
  return offlineQueue.getStats();
}

export function clearOfflineQueue(): Promise<void> {
  if (!offlineQueue) {
    initOfflineQueue();
  }
  return offlineQueue.clearQueue();
}
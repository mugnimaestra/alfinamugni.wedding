/**
 * Offline Queue Service Worker Plugin
 * Handles RSVP submissions when offline for Indonesian mobile users
 */

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface QueueConfig {
  maxRetries: number;
  retryDelay: number;
  maxAge: number; // milliseconds
  maxQueueSize: number;
}

const DEFAULT_CONFIG: QueueConfig = {
  maxRetries: 5,
  retryDelay: 2000, // 2 seconds initial delay
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxQueueSize: 50,
};

export class OfflineQueue {
  private dbName = 'wedding-offline-queue';
  private dbVersion = 1;
  private storeName = 'requests';
  private db: IDBDatabase | null = null;
  private config: QueueConfig;

  constructor(config: Partial<QueueConfig> = {}) {
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
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('priority', 'priority', { unique: false });
          store.createIndex('url', 'url', { unique: false });
        }
      };
    });
  }

  async addToQueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    if (!this.db) await this.initDB();

    const queuedRequest: QueuedRequest = {
      ...request,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
    };

    // Clean old entries and check queue size
    await this.cleanQueue();

    const transaction = this.db!.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    await new Promise<void>((resolve, reject) => {
      const request = store.add(queuedRequest);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    console.log(`[OfflineQueue] Added request to queue: ${queuedRequest.url}`);
  }

  async processQueue(): Promise<void> {
    if (!this.db) await this.initDB();

    const requests = await this.getQueuedRequests();

    for (const request of requests) {
      try {
        await this.processRequest(request);
        await this.removeFromQueue(request.id);
        console.log(`[OfflineQueue] Successfully processed: ${request.url}`);
      } catch (error) {
        console.warn(`[OfflineQueue] Failed to process: ${request.url}`, error);

        if (request.retryCount < this.config.maxRetries) {
          await this.updateRetryCount(request.id, request.retryCount + 1);
          // Exponential backoff for Indonesian networks
          setTimeout(() => {
            this.processQueue();
          }, this.config.retryDelay * Math.pow(2, request.retryCount));
        } else {
          console.error(`[OfflineQueue] Max retries reached for: ${request.url}`);
          await this.removeFromQueue(request.id);
        }
      }
    }
  }

  private async processRequest(request: QueuedRequest): Promise<Response> {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers: request.headers,
      body: request.body,
    };

    // Indonesian network optimization
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      fetchOptions.signal = controller.signal;
      const response = await fetch(request.url, fetchOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async getQueuedRequests(): Promise<QueuedRequest[]> {
    if (!this.db) return [];

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('priority');

    return new Promise((resolve, reject) => {
      const requests: QueuedRequest[] = [];
      const cursorRequest = index.openCursor();

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          requests.push(cursor.value);
          cursor.continue();
        } else {
          // Sort by priority and timestamp
          requests.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority];
            const bPriority = priorityOrder[b.priority];

            if (aPriority !== bPriority) {
              return bPriority - aPriority; // Higher priority first
            }
            return a.timestamp - b.timestamp; // Older first for same priority
          });
          resolve(requests);
        }
      };

      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  }

  private async removeFromQueue(id: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateRetryCount(id: string, retryCount: number): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise<void>((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const request = getRequest.result;
        if (request) {
          request.retryCount = retryCount;
          const updateRequest = store.put(request);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  private async cleanQueue(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('timestamp');

    const cutoffTime = Date.now() - this.config.maxAge;
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

  async getQueueStatus(): Promise<{count: number, oldestTimestamp: number | null}> {
    if (!this.db) return { count: 0, oldestTimestamp: null };

    const requests = await this.getQueuedRequests();
    return {
      count: requests.length,
      oldestTimestamp: requests.length > 0 ? Math.min(...requests.map(r => r.timestamp)) : null,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Service Worker integration
let offlineQueue: OfflineQueue;

export function initOfflineQueue(config?: Partial<QueueConfig>): void {
  offlineQueue = new OfflineQueue(config);

  // Listen for online events to process queue
  self.addEventListener('online', () => {
    console.log('[OfflineQueue] Device is online, processing queue...');
    offlineQueue.processQueue();
  });
}

export function queueRequest(
  url: string,
  options: RequestInit & { priority?: 'high' | 'medium' | 'low' }
): Promise<void> {
  const { priority = 'medium', ...fetchOptions } = options;

  return offlineQueue.addToQueue({
    url,
    method: fetchOptions.method || 'GET',
    headers: fetchOptions.headers as Record<string, string> || {},
    body: fetchOptions.body as string || '',
    priority,
  });
}

export function getOfflineQueueStatus() {
  return offlineQueue?.getQueueStatus() || Promise.resolve({ count: 0, oldestTimestamp: null });
}
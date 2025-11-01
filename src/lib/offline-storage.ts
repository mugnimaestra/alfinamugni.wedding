/**
 * Offline Storage Utilities
 * IndexedDB wrapper for offline data storage and queue management
 */

export interface OfflineRSVP {
  id: string
  data: {
    guest_name: string
    email: string
    phone?: string
    attending: string
    plus_one_count: number
    plus_one_name?: string
    meal_preference?: string
    plus_one_meal?: string
    accommodation_needed: boolean
    special_requests?: string
    dietary_restrictions?: string
  }
  timestamp: number
  synced: boolean
}

export interface OfflinePhoto {
  id: string
  file: Blob
  metadata: {
    session_id?: string
    filename: string
    uploader_name?: string
    uploader_email?: string
  }
  timestamp: number
  synced: boolean
}

const DB_NAME = "wedding-offline-storage"
const DB_VERSION = 1
const RSVP_STORE = "rsvps"
const PHOTO_STORE = "photos"

class OfflineStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (this.db) return

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create RSVP store
        if (!db.objectStoreNames.contains(RSVP_STORE)) {
          const rsvpStore = db.createObjectStore(RSVP_STORE, { keyPath: "id" })
          rsvpStore.createIndex("synced", "synced", { unique: false })
          rsvpStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        // Create photo store
        if (!db.objectStoreNames.contains(PHOTO_STORE)) {
          const photoStore = db.createObjectStore(PHOTO_STORE, {
            keyPath: "id",
          })
          photoStore.createIndex("synced", "synced", { unique: false })
          photoStore.createIndex("timestamp", "timestamp", { unique: false })
        }
      }
    })
  }

  // RSVP operations
  async saveRSVP(rsvp: OfflineRSVP): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"))

      const transaction = this.db.transaction([RSVP_STORE], "readwrite")
      const store = transaction.objectStore(RSVP_STORE)
      const request = store.put(rsvp)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getUnsyncedRSVPs(): Promise<OfflineRSVP[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"))

      const transaction = this.db.transaction([RSVP_STORE], "readonly")
      const store = transaction.objectStore(RSVP_STORE)
      const index = store.index("synced")
      const request = index.getAll(false)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async markRSVPSynced(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"))

      const transaction = this.db.transaction([RSVP_STORE], "readwrite")
      const store = transaction.objectStore(RSVP_STORE)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const rsvp = getRequest.result
        if (rsvp) {
          rsvp.synced = true
          const updateRequest = store.put(rsvp)
          updateRequest.onerror = () => reject(updateRequest.error)
          updateRequest.onsuccess = () => resolve()
        } else {
          resolve()
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async deleteRSVP(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"))

      const transaction = this.db.transaction([RSVP_STORE], "readwrite")
      const store = transaction.objectStore(RSVP_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  // Photo operations
  async savePhoto(photo: OfflinePhoto): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"))

      const transaction = this.db.transaction([PHOTO_STORE], "readwrite")
      const store = transaction.objectStore(PHOTO_STORE)
      const request = store.put(photo)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getUnsyncedPhotos(): Promise<OfflinePhoto[]> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"))

      const transaction = this.db.transaction([PHOTO_STORE], "readonly")
      const store = transaction.objectStore(PHOTO_STORE)
      const index = store.index("synced")
      const request = index.getAll(false)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  async markPhotoSynced(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"))

      const transaction = this.db.transaction([PHOTO_STORE], "readwrite")
      const store = transaction.objectStore(PHOTO_STORE)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const photo = getRequest.result
        if (photo) {
          photo.synced = true
          const updateRequest = store.put(photo)
          updateRequest.onerror = () => reject(updateRequest.error)
          updateRequest.onsuccess = () => resolve()
        } else {
          resolve()
        }
      }

      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  async deletePhoto(id: string): Promise<void> {
    await this.init()
    return new Promise((resolve, reject) => {
      if (!this.db) return reject(new Error("Database not initialized"))

      const transaction = this.db.transaction([PHOTO_STORE], "readwrite")
      const store = transaction.objectStore(PHOTO_STORE)
      const request = store.delete(id)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getQueuedCount(): Promise<{ rsvps: number; photos: number }> {
    const rsvps = await this.getUnsyncedRSVPs()
    const photos = await this.getUnsyncedPhotos()
    return { rsvps: rsvps.length, photos: photos.length }
  }
}

export const offlineStorage = new OfflineStorage()

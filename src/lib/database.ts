import type { D1Database, R2Bucket, KVNamespace } from '@cloudflare/workers-types';
import { z } from 'zod';
import { RsvpSchema, GuestWishSchema, PhotoUploadSchema } from './validators.js';

// Define D1PreparedStatement interface since it might not be available in workers-types
export interface D1PreparedStatement {
  bind(...values: (string | number | boolean | null | ArrayBuffer)[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<D1Result>;
}

export interface D1Result {
  results?: Record<string, unknown>[];
  changes?: number;
  success?: boolean;
  error?: string;
  meta?: Record<string, unknown>;
}

// Database interface for the wedding website
export interface Env {
  DB: D1Database;
  WEDDING_PHOTOS: R2Bucket;
  WEDDING_ASSETS: R2Bucket;
  KV_RATE_LIMIT: KVNamespace;
  ADMIN_KV: KVNamespace;
  RESEND_API_KEY: string;
  ENVIRONMENT: string;
  AUTH_SECRET: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD_HASH?: string;
}

// Enhanced error classes
export class DatabaseError extends Error {
  constructor(message: string, public readonly operation: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string, public readonly retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Extended Zod schemas that include database fields
// Use merge() instead of extend() since base schemas contain refinements
const DatabaseRsvpSchema = z.object({
  id: z.number().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
}).passthrough(); // Allow additional fields from RsvpSchema

const DatabaseGuestWishSchema = z.object({
  id: z.number().optional(),
  approved: z.boolean().default(false),
  created_at: z.string().optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
}).passthrough(); // Allow additional fields from GuestWishSchema

const DatabasePhotoUploadSchema = z.object({
  id: z.number().optional(),
  approved: z.boolean().default(false),
  featured: z.boolean().default(false),
  upload_date: z.string().optional(),
  approved_at: z.string().optional(),
  approved_by: z.string().optional(),
  ip_address: z.string().optional(),
}).passthrough(); // Allow additional fields from PhotoUploadSchema

// Generic typed helper functions
async function getTypedResult<T>(
  stmt: D1PreparedStatement,
  schema: z.ZodSchema<T>
): Promise<T | null> {
  const result = await stmt.first();
  if (!result) return null;
  
  const parsed = schema.safeParse(result);
  if (!parsed.success) {
    console.warn('Database result validation failed:', parsed.error);
    throw new ValidationError(
      `Database result validation failed: ${parsed.error.message}`,
      'database_result'
    );
  }
  
  return parsed.data;
}

async function getTypedResults<T>(
  stmt: D1PreparedStatement,
  schema: z.ZodSchema<T>
): Promise<T[]> {
  const result = await stmt.all();
  if (!result.results || result.results.length === 0) return [];
  
  const validResults: T[] = [];
  const errors: string[] = [];
  
  for (const row of result.results) {
    const parsed = schema.safeParse(row);
    if (parsed.success) {
      validResults.push(parsed.data);
    } else {
      errors.push(`Row validation failed: ${parsed.error.message}`);
    }
  }
  
  if (errors.length > 0) {
    console.warn('Some database rows failed validation:', errors);
  }
  
  return validResults;
}

async function getTypedSingleResult<T>(
  stmt: D1PreparedStatement,
  schema: z.ZodSchema<T>,
  errorMessage: string
): Promise<T> {
  const result = await getTypedResult(stmt, schema);
  if (!result) {
    throw new Error(errorMessage);
  }
  return result;
}

// Connection pool and retry utilities
class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private retryAttempts = 3;
  private retryDelay = 1000; // Base delay in ms

  static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  async withRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`Database operation failed (attempt ${attempt}/${this.retryAttempts}):`, {
          operation: operationName,
          error: lastError.message,
          attempt
        });

        if (attempt === this.retryAttempts) {
          break;
        }

        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new DatabaseError(
      `Failed to execute ${operationName} after ${this.retryAttempts} attempts: ${lastError!.message}`,
      operationName,
      lastError!
    );
  }

  async executeTransaction<T>(
    database: D1Database,
    operations: ((stmt: D1PreparedStatement) => D1PreparedStatement)[],
    operationName: string
  ): Promise<T> {
    return this.withRetry(async () => {
      // D1 doesn't support explicit transactions yet, so we simulate with batch operations
      const statements = operations.map(op => op(database.prepare('')));

      try {
        // @ts-expect-error: D1 interface version compatibility issue
        const results = await database.batch(statements);
        return results as T;
      } catch (error) {
        throw new Error(`Transaction failed for ${operationName}: ${(error as Error).message}`);
      }
    }, `transaction:${operationName}`);
  }
}

// RSVP data types
export interface RsvpData {
  id?: number;
  guest_name: string;
  email: string;
  phone?: string;
  attending: 'both' | 'akad' | 'reception' | 'unable';
  plus_one_count: number;
  plus_one_name?: string;
  meal_preference?: 'chicken' | 'beef' | 'fish' | 'vegetarian' | 'vegan';
  plus_one_meal?: 'chicken' | 'beef' | 'fish' | 'vegetarian' | 'vegan';
  accommodation_needed: boolean;
  special_requests?: string;
  dietary_restrictions?: string;
  created_at?: string;
  updated_at?: string;
  ip_address?: string;
  user_agent?: string;
}

// Guest wish data types
export interface GuestWish {
  id?: number;
  guest_name: string;
  email?: string;
  message: string;
  approved: boolean;
  created_at?: string;
  ip_address?: string;
  user_agent?: string;
}

// Photo upload data types
export interface PhotoUpload {
  id?: number;
  filename: string;
  original_name: string;
  file_size: number;
  content_type: string;
  width?: number;
  height?: number;
  upload_date?: string;
  uploader_name?: string;
  uploader_email?: string;
  bucket_path: string;
  r2_key: string;
  approved: boolean;
  featured: boolean;
  category: 'ceremony' | 'reception' | 'guests' | 'professional';
  description?: string;
  approved_at?: string;
  approved_by?: string;
  ip_address?: string;
  user_agent?: string;
  screen_resolution?: string;
  device_orientation?: string;
  connection_type?: string;
  country_code?: string;
  camera_model?: string;
}

// Database utility class with enhanced error handling
export class WeddingDatabase {
  private db: D1Database;
  private connectionManager: DatabaseConnectionManager;

  constructor(database: D1Database) {
    this.db = database;
    this.connectionManager = DatabaseConnectionManager.getInstance();
  }

  // RSVP Methods with enhanced error handling
  async createRsvp(rsvpData: Omit<RsvpData, 'id' | 'created_at' | 'updated_at'>): Promise<RsvpData> {
    return this.connectionManager.withRetry(async () => {
      // Check for duplicate email first
      const existing = await this.getRsvpByEmail(rsvpData.email).catch(() => null);
      if (existing) {
        throw new ValidationError('An RSVP with this email already exists', 'email');
      }

      const stmt = this.db.prepare(`
        INSERT INTO rsvps (
          guest_name, email, phone, attending, plus_one_count, plus_one_name,
          meal_preference, plus_one_meal, accommodation_needed, special_requests,
          dietary_restrictions, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = await stmt.bind(
        rsvpData.guest_name,
        rsvpData.email,
        rsvpData.phone || null,
        rsvpData.attending,
        rsvpData.plus_one_count,
        rsvpData.plus_one_name || null,
        rsvpData.meal_preference || null,
        rsvpData.plus_one_meal || null,
        rsvpData.accommodation_needed,
        rsvpData.special_requests || null,
        rsvpData.dietary_restrictions || null,
        rsvpData.ip_address || null,
        rsvpData.user_agent || null
      ).run();

      if (!result.success) {
        throw new Error(`Failed to create RSVP: ${result.error || 'Unknown error'}`);
      }

      return this.getRsvpById(result.meta.last_row_id as number);
    }, 'createRsvp');
  }

  async getRsvpById(id: number): Promise<RsvpData> {
    return this.connectionManager.withRetry(async () => {
      const stmt = this.db.prepare('SELECT * FROM rsvps WHERE id = ?');
      return await getTypedSingleResult(stmt.bind(id), DatabaseRsvpSchema, 'RSVP not found');
    }, 'getRsvpById');
  }

  async getRsvpByEmail(email: string): Promise<RsvpData | null> {
    return this.connectionManager.withRetry(async () => {
      const stmt = this.db.prepare('SELECT * FROM rsvps WHERE email = ?');
      return await getTypedResult(stmt.bind(email), DatabaseRsvpSchema);
    }, 'getRsvpByEmail');
  }

  async getAllRsvps(limit?: number, offset?: number): Promise<RsvpData[]> {
    return this.connectionManager.withRetry(async () => {
      let query = 'SELECT * FROM rsvps ORDER BY created_at DESC';
      const params: (string | number | boolean | null | ArrayBuffer)[] = [];

      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);

        if (offset) {
          query += ' OFFSET ?';
          params.push(offset);
        }
      }

      const stmt = this.db.prepare(query);
      return await getTypedResults(stmt.bind(...params), DatabaseRsvpSchema);
    }, 'getAllRsvps');
  }

  async updateRsvp(id: number, updates: Partial<RsvpData>): Promise<RsvpData> {
    return this.connectionManager.withRetry(async () => {
      // Remove undefined values and system fields
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key, value]) =>
          value !== undefined && !['id', 'created_at'].includes(key)
        )
      );

      if (Object.keys(cleanUpdates).length === 0) {
        throw new ValidationError('No valid fields to update', 'updates');
      }

      const setClause = Object.keys(cleanUpdates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(cleanUpdates);

      const stmt = this.db.prepare(`
        UPDATE rsvps
        SET ${setClause}, updated_at = datetime('now')
        WHERE id = ?
      `);

      const result = await stmt.bind(...values, id).run();

      if (!result.success) {
        throw new Error(`Failed to update RSVP: ${result.error || 'Unknown error'}`);
      }

      return this.getRsvpById(id);
    }, 'updateRsvp');
  }

  // Guest Wishes Methods
  async createGuestWish(wishData: Omit<GuestWish, 'id' | 'created_at'>): Promise<GuestWish> {
    const stmt = this.db.prepare(`
      INSERT INTO guest_wishes (guest_name, email, message, approved, ip_address)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      wishData.guest_name,
      wishData.email || null,
      wishData.message,
      wishData.approved,
      wishData.ip_address || null
    ).run();

    if (!result.success) {
      throw new Error('Failed to create guest wish');
    }

    return this.getGuestWishById(result.meta.last_row_id as number);
  }

  async getGuestWishById(id: number): Promise<GuestWish> {
    const stmt = this.db.prepare('SELECT * FROM guest_wishes WHERE id = ?');
    return await getTypedSingleResult(stmt.bind(id), DatabaseGuestWishSchema, 'Guest wish not found');
  }

  async getApprovedWishes(): Promise<GuestWish[]> {
    const stmt = this.db.prepare('SELECT * FROM guest_wishes WHERE approved = true ORDER BY created_at DESC');
    return await getTypedResults(stmt, DatabaseGuestWishSchema);
  }

  async getAllWishes(): Promise<GuestWish[]> {
    const stmt = this.db.prepare('SELECT * FROM guest_wishes ORDER BY created_at DESC');
    return await getTypedResults(stmt, DatabaseGuestWishSchema);
  }

  async approveWish(id: number): Promise<GuestWish> {
    const stmt = this.db.prepare(`
      UPDATE guest_wishes
      SET approved = true, moderated_at = datetime('now')
      WHERE id = ?
    `);

    const result = await stmt.bind(id).run();

    if (!result.success) {
      throw new Error('Failed to approve wish');
    }

    return this.getGuestWishById(id);
  }

  // Photo Upload Methods
  async createPhotoUpload(photoData: Omit<PhotoUpload, 'id' | 'upload_date'>): Promise<PhotoUpload> {
    const stmt = this.db.prepare(`
      INSERT INTO photo_uploads (
        filename, original_name, file_size, content_type, width, height,
        uploader_name, uploader_email, bucket_path, r2_key, approved, featured,
        category, description, ip_address, user_agent, screen_resolution,
        device_orientation, connection_type, country_code, camera_model
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.bind(
      photoData.filename,
      photoData.original_name,
      photoData.file_size,
      photoData.content_type,
      photoData.width || null,
      photoData.height || null,
      photoData.uploader_name || null,
      photoData.uploader_email || null,
      photoData.bucket_path,
      photoData.r2_key,
      photoData.approved,
      photoData.featured,
      photoData.category,
      photoData.description || null,
      photoData.ip_address || null,
      photoData.user_agent || null,
      photoData.screen_resolution || null,
      photoData.device_orientation || null,
      photoData.connection_type || null,
      photoData.country_code || null,
      photoData.camera_model || null
    ).run();

    if (!result.success) {
      throw new Error('Failed to create photo upload record');
    }

    return this.getPhotoUploadById(result.meta.last_row_id as number);
  }

  async getPhotoUploadById(id: number): Promise<PhotoUpload> {
    const stmt = this.db.prepare('SELECT * FROM photo_uploads WHERE id = ?');
    return await getTypedSingleResult(stmt.bind(id), DatabasePhotoUploadSchema, 'Photo upload not found');
  }

  async getApprovedPhotos(category?: string): Promise<PhotoUpload[]> {
    let query = 'SELECT * FROM photo_uploads WHERE approved = true';
    const params: (string | number | boolean | null | ArrayBuffer)[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY upload_date DESC';

    const stmt = this.db.prepare(query);
    return await getTypedResults(stmt.bind(...params), DatabasePhotoUploadSchema);
  }

  async getAllPhotos(): Promise<PhotoUpload[]> {
    const stmt = this.db.prepare('SELECT * FROM photo_uploads ORDER BY upload_date DESC');
    return await getTypedResults(stmt, DatabasePhotoUploadSchema);
  }

  async approvePhoto(id: number, approvedBy?: string): Promise<PhotoUpload> {
    const stmt = this.db.prepare(`
      UPDATE photo_uploads
      SET approved = true, approved_at = datetime('now'), approved_by = ?
      WHERE id = ?
    `);

    const result = await stmt.bind(approvedBy || null, id).run();

    if (!result.success) {
      throw new Error('Failed to approve photo');
    }

    return this.getPhotoUploadById(id);
  }

  // Analytics Methods
  async logPageView(pageData: {
    page_path: string;
    user_agent?: string;
    ip_address?: string;
    referrer?: string;
    country?: string;
    city?: string;
    device_type?: string;
  }): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT INTO page_views (page_path, user_agent, ip_address, referrer, country, city, device_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.bind(
      pageData.page_path,
      pageData.user_agent || null,
      pageData.ip_address || null,
      pageData.referrer || null,
      pageData.country || null,
      pageData.city || null,
      pageData.device_type || null
    ).run();
  }

  // Settings Methods
  async getSetting(key: string): Promise<string | null> {
    const stmt = this.db.prepare('SELECT setting_value FROM wedding_settings WHERE setting_key = ?');
    const result = await stmt.bind(key).first();
    return result ? (result as Record<string, unknown>).setting_value as string : null;
  }

  async setSetting(key: string, value: string, updatedBy?: string): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO wedding_settings (setting_key, setting_value, updated_by)
      VALUES (?, ?, ?)
    `);

    await stmt.bind(key, value, updatedBy || null).run();
  }

  // Statistics Methods
  async getRsvpStats(): Promise<{
    total: number;
    attending_both: number;
    attending_akad: number;
    attending_reception: number;
    not_attending: number;
    total_guests: number;
  }> {
    const stmt = this.db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN attending = 'both' THEN 1 ELSE 0 END) as attending_both,
        SUM(CASE WHEN attending = 'akad' THEN 1 ELSE 0 END) as attending_akad,
        SUM(CASE WHEN attending = 'reception' THEN 1 ELSE 0 END) as attending_reception,
        SUM(CASE WHEN attending = 'unable' THEN 1 ELSE 0 END) as not_attending,
        SUM(CASE WHEN attending != 'unable' THEN 1 + plus_one_count ELSE 0 END) as total_guests
      FROM rsvps
    `);

    const result = await stmt.first();
    return result as {
      total: number;
      attending_both: number;
      attending_akad: number;
      attending_reception: number;
      not_attending: number;
      total_guests: number;
    };
  }

  // Additional Wish Management Methods
  async getWishById(id: number): Promise<GuestWish | null> {
    try {
      const stmt = this.db.prepare('SELECT * FROM guest_wishes WHERE id = ?');
      return await getTypedResult(stmt.bind(id), DatabaseGuestWishSchema);
    } catch (error) {
      throw new DatabaseError(
        `Failed to retrieve wish with ID ${id}`,
        'getWishById',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async deleteWish(id: number): Promise<void> {
    try {
      const stmt = this.db.prepare('DELETE FROM guest_wishes WHERE id = ?');
      const result = await stmt.bind(id).run() as D1Result;

      if (result.changes === 0) {
        throw new DatabaseError(`Wish with ID ${id} not found`, 'deleteWish');
      }
    } catch (error) {
      throw new DatabaseError(
        `Failed to delete wish with ID ${id}`,
        'deleteWish',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

// Helper function to get database instance
export function getDatabase(env: Env): WeddingDatabase {
  return new WeddingDatabase(env.DB);
}
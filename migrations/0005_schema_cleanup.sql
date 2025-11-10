-- Migration: Schema Cleanup and Simplification
-- Removes unused tables and simplifies schema by eliminating multi-session concept
-- 
-- This migration removes the gallery_sessions system introduced in migration 0002.
-- The session-based upload system is being replaced with a unified gallery approach.
-- 
-- Tables dropped:
-- - rsvps, guest_wishes: Replaced by unified wishes_rsvp table (migration 0004)
-- - email_notifications: Not currently used
-- - gallery_sessions: Session system removed (introduced in 0002, removed here)
--
-- The photo_uploads table is recreated without the session_id column.
-- Run: pnpm run db:migrate:preview (dev) or apply to production

-- Drop unused tables
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS guest_wishes;
DROP TABLE IF EXISTS email_notifications;
DROP TABLE IF EXISTS gallery_sessions;

-- Drop related indexes
DROP INDEX IF EXISTS idx_rsvps_email;
DROP INDEX IF EXISTS idx_rsvps_attending;
DROP INDEX IF EXISTS idx_rsvps_created_at;
DROP INDEX IF EXISTS idx_guest_wishes_approved;
DROP INDEX IF EXISTS idx_guest_wishes_created_at;
DROP INDEX IF EXISTS idx_email_notifications_status;
DROP INDEX IF EXISTS idx_email_notifications_type;
DROP INDEX IF EXISTS idx_sessions_session_id;
DROP INDEX IF EXISTS idx_sessions_active;
DROP INDEX IF EXISTS idx_sessions_created;
DROP INDEX IF EXISTS idx_photos_session_id;

-- Recreate photo_uploads table without session_id column
-- SQLite doesn't support DROP COLUMN, so we need to recreate the table
CREATE TABLE photo_uploads_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  upload_date TEXT DEFAULT (datetime('now')),
  uploader_name TEXT,
  uploader_email TEXT,
  bucket_path TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  category TEXT CHECK (category IN ('ceremony', 'reception', 'guests', 'professional')),
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  screen_resolution TEXT,
  device_orientation TEXT,
  connection_type TEXT,
  country_code TEXT,
  camera_model TEXT,
  compressed_size INTEGER,
  original_size INTEGER,
  compression_ratio REAL,
  thumbnail_url TEXT,
  device_info TEXT,
  network_info TEXT
);

-- Copy data from old table to new table (excluding session_id)
INSERT INTO photo_uploads_new (
  id, filename, original_name, file_size, content_type, width, height,
  upload_date, uploader_name, uploader_email, bucket_path, r2_key, featured,
  category, description, ip_address, user_agent, screen_resolution,
  device_orientation, connection_type, country_code, camera_model,
  compressed_size, original_size, compression_ratio, thumbnail_url,
  device_info, network_info
)
SELECT 
  id, filename, original_name, file_size, content_type, width, height,
  upload_date, uploader_name, uploader_email, bucket_path, r2_key, featured,
  category, description, ip_address, user_agent, screen_resolution,
  device_orientation, connection_type, country_code, camera_model,
  compressed_size, original_size, compression_ratio, thumbnail_url,
  device_info, network_info
FROM photo_uploads;

-- Drop old table and rename new table
DROP TABLE photo_uploads;
ALTER TABLE photo_uploads_new RENAME TO photo_uploads;

-- Recreate existing indexes
CREATE INDEX IF NOT EXISTS idx_photo_uploads_category ON photo_uploads(category);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_upload_date ON photo_uploads(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_country ON photo_uploads(country_code);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device ON photo_uploads(user_agent);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device_info ON photo_uploads(device_info);

-- Add missing performance indexes
CREATE INDEX IF NOT EXISTS idx_photo_uploads_r2_key ON photo_uploads(r2_key);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_featured ON photo_uploads(featured);

-- Migration complete
-- All photos are now part of a single unified gallery


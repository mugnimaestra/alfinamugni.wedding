-- Production Schema Update Migration
-- Updates the existing database schema to match the new structure
-- This migration handles the column name changes and schema updates for all tables

-- Drop existing indexes first
DROP INDEX IF EXISTS idx_rsvps_email;
DROP INDEX IF EXISTS idx_rsvps_attending;
DROP INDEX IF EXISTS idx_rsvps_created_at;

-- Drop and recreate rsvps table with new schema
DROP TABLE IF EXISTS rsvps;
CREATE TABLE rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  attending TEXT NOT NULL CHECK (attending IN ('both', 'akad', 'reception', 'unable')),
  plus_one_count INTEGER DEFAULT 0,
  plus_one_name TEXT,
  meal_preference TEXT CHECK (meal_preference IN ('chicken', 'beef', 'fish', 'vegetarian', 'vegan')),
  plus_one_meal TEXT CHECK (plus_one_meal IN ('chicken', 'beef', 'fish', 'vegetarian', 'vegan')),
  accommodation_needed BOOLEAN DEFAULT FALSE,
  special_requests TEXT,
  dietary_restrictions TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT,
  user_agent TEXT
);

-- Drop and recreate guest_wishes table with new schema
DROP TABLE IF EXISTS wishes;
DROP TABLE IF EXISTS guest_wishes;
CREATE TABLE guest_wishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT,
  moderated_at TEXT,
  moderated_by TEXT
);

-- Drop and recreate photo_uploads table with new schema
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS photo_uploads;
CREATE TABLE photo_uploads (
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
  session_id TEXT
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);
CREATE INDEX IF NOT EXISTS idx_rsvps_attending ON rsvps(attending);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);

CREATE INDEX IF NOT EXISTS idx_guest_wishes_approved ON guest_wishes(approved);
CREATE INDEX IF NOT EXISTS idx_guest_wishes_created_at ON guest_wishes(created_at);

CREATE INDEX IF NOT EXISTS idx_photo_uploads_category ON photo_uploads(category);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_upload_date ON photo_uploads(upload_date);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_country ON photo_uploads(country_code);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device ON photo_uploads(user_agent);

-- Update gallery_sessions table structure
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON gallery_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON gallery_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON gallery_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_photos_session_id ON photo_uploads(session_id);

-- Production Schema Update Migration
-- Creates the final schema state matching migrations 0001-0009
-- This migration sets up the production database with the unified schema
-- (no sessions, unified wishes_rsvp table, enhanced photo metadata, media_type, public_urls)

-- Drop any existing tables that are being replaced
DROP TABLE IF EXISTS rsvps;
DROP TABLE IF EXISTS guest_wishes;
DROP TABLE IF EXISTS wishes;
DROP TABLE IF EXISTS email_notifications;
DROP TABLE IF EXISTS gallery_sessions;
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS photo_uploads;

-- Drop existing indexes
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

-- Create unified wishes_rsvp table (replaces rsvps and guest_wishes)
CREATE TABLE wishes_rsvp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  attending TEXT CHECK (attending IN ('yes', 'no', 'maybe')) DEFAULT NULL,
  visitor_count INTEGER DEFAULT 1,
  approved BOOLEAN DEFAULT FALSE,
  created_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT,
  moderated_at TEXT,
  moderated_by TEXT
);

-- Create photo_uploads table with enhanced metadata (no session_id)
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
  compressed_size INTEGER,
  original_size INTEGER,
  compression_ratio REAL,
  thumbnail_url TEXT,
  device_info TEXT,
  network_info TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  public_url TEXT,
  thumbnail_public_url TEXT
);

-- Create wedding_settings table
CREATE TABLE IF NOT EXISTS wedding_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by TEXT
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  viewed_at TEXT DEFAULT (datetime('now'))
);

-- Create indexes for wishes_rsvp
CREATE INDEX IF NOT EXISTS idx_wishes_rsvp_approved ON wishes_rsvp(approved);
CREATE INDEX IF NOT EXISTS idx_wishes_rsvp_created_at ON wishes_rsvp(created_at);
CREATE INDEX IF NOT EXISTS idx_wishes_rsvp_attending ON wishes_rsvp(attending);

-- Create indexes for photo_uploads
CREATE INDEX IF NOT EXISTS idx_photo_uploads_category ON photo_uploads(category);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_upload_date ON photo_uploads(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_country ON photo_uploads(country_code);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device ON photo_uploads(user_agent);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device_info ON photo_uploads(device_info);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_r2_key ON photo_uploads(r2_key);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_featured ON photo_uploads(featured);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_media_type ON photo_uploads(media_type);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_public_url ON photo_uploads(public_url);

-- Create indexes for page_views
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);

-- Insert default wedding settings
INSERT OR IGNORE INTO wedding_settings (setting_key, setting_value, description) VALUES
('rsvp_deadline', '2025-11-15', 'RSVP deadline date'),
('max_plus_ones', '2', 'Maximum plus ones per invitation'),
('wedding_date', '2025-11-29', 'Wedding date'),
('ceremony_time', '10:00', 'Ceremony start time'),
('reception_time', '18:00', 'Reception start time'),
('venue_name', 'Jakarta Wedding Venue', 'Wedding venue name'),
('venue_address', 'Jakarta, Indonesia', 'Wedding venue address'),
('auto_approve_wishes', 'false', 'Automatically approve guest wishes'),
('email_notifications_enabled', 'true', 'Enable email notifications'),
('guest_photo_uploads_enabled', 'true', 'Allow guests to upload photos'),
('site_maintenance_mode', 'false', 'Enable maintenance mode');

-- Insert default admin user (to be updated with real credentials)
INSERT OR IGNORE INTO admin_users (email, name, role) VALUES
('admin@alfinamugni.wedding', 'Admin User', 'admin');

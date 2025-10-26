-- Wedding Website Database Schema
-- Designed for Cloudflare D1 SQLite database

-- RSVP responses table
CREATE TABLE IF NOT EXISTS rsvps (
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

-- Guest wishes/messages table
CREATE TABLE IF NOT EXISTS guest_wishes (
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

-- Photo uploads metadata table
CREATE TABLE IF NOT EXISTS photo_uploads (
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
  camera_model TEXT
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT,
  active BOOLEAN DEFAULT TRUE
);

-- Email notifications log
CREATE TABLE IF NOT EXISTS email_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  email_type TEXT NOT NULL CHECK (email_type IN ('rsvp_confirmation', 'admin_notification', 'reminder', 'thank_you')),
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  resend_id TEXT,
  error_message TEXT,
  sent_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  related_rsvp_id INTEGER,
  FOREIGN KEY (related_rsvp_id) REFERENCES rsvps(id)
);

-- Wedding settings/configuration
CREATE TABLE IF NOT EXISTS wedding_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by TEXT
);

-- Website analytics (basic tracking)
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

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);
CREATE INDEX IF NOT EXISTS idx_rsvps_attending ON rsvps(attending);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);

CREATE INDEX IF NOT EXISTS idx_guest_wishes_approved ON guest_wishes(approved);
CREATE INDEX IF NOT EXISTS idx_guest_wishes_created_at ON guest_wishes(created_at);

CREATE INDEX IF NOT EXISTS idx_photo_uploads_category ON photo_uploads(category);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_upload_date ON photo_uploads(upload_date);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_country ON photo_uploads(country_code);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device ON photo_uploads(user_agent);

CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_type ON email_notifications(email_type);

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
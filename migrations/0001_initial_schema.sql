-- Wedding Website Database Schema
-- Created for Cloudflare D1 (SQLite)
-- Free tier optimized schema

-- RSVPs table
CREATE TABLE IF NOT EXISTS rsvps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  attendance_status TEXT NOT NULL CHECK (attendance_status IN ('confirmed', 'declined', 'pending')),
  number_of_guests INTEGER DEFAULT 1 CHECK (number_of_guests >= 1 AND number_of_guests <= 10),
  dietary_restrictions TEXT,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Wishes table
CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  r2_key TEXT NOT NULL,
  thumbnail_key TEXT,
  uploaded_by TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin activity log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON rsvps(attendance_status);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);

CREATE INDEX IF NOT EXISTS idx_wishes_public_approved ON wishes(is_public, is_approved);
CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at);

CREATE INDEX IF NOT EXISTS idx_photos_public_approved ON photos(is_public, is_approved);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON photos(created_at);

CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_user ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_action ON admin_activity_log(action);

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO admin_users (
  id,
  username,
  password_hash,
  email,
  role,
  is_active
) VALUES (
  'admin-001',
  'admin',
  '$2b$10$awPfIR79wHqUOwbSjS7aiuvxh1OnTZg7R7/ecJVBwAXFal5nDscX6',
  'admin@alfinamugni.wedding',
  'admin',
  TRUE
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_rsvps_updated_at
  AFTER UPDATE ON rsvps
  FOR EACH ROW
  BEGIN
    UPDATE rsvps SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_wishes_updated_at
  AFTER UPDATE ON wishes
  FOR EACH ROW
  BEGIN
    UPDATE wishes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_photos_updated_at
  AFTER UPDATE ON photos
  FOR EACH ROW
  BEGIN
    UPDATE photos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_admin_users_updated_at
  AFTER UPDATE ON admin_users
  FOR EACH ROW
  BEGIN
    UPDATE admin_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
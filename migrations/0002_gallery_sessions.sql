-- Gallery Sessions Migration
-- Adds session-based collaborative upload system
-- Run: pnpm run db:migrate:local (dev) or pnpm run db:migrate (prod)

-- Create gallery sessions table
CREATE TABLE IF NOT EXISTS gallery_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,           -- "wdng-a7b3c4d5"
  title TEXT NOT NULL,                       -- "Wedding Day - Nov 29, 2025"
  description TEXT,                          -- "Share your moments from our special day!"
  is_active BOOLEAN DEFAULT TRUE,            -- Accept uploads?
  qr_code_url TEXT,                          -- Generated QR code data URL (optional)
  created_at TEXT DEFAULT (datetime('now')),
  created_by TEXT DEFAULT 'admin',           -- Admin who created it
  photo_count INTEGER DEFAULT 0,             -- Denormalized count for performance
  last_upload_at TEXT                        -- Track latest activity
);

-- Add session_id to photo_uploads
ALTER TABLE photo_uploads ADD COLUMN session_id TEXT;

-- Create indexes for session queries
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON gallery_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON gallery_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON gallery_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_photos_session_id ON photo_uploads(session_id);

-- Insert default session for existing photos (migration safety)
INSERT OR IGNORE INTO gallery_sessions (
  session_id, 
  title, 
  description, 
  is_active,
  created_at
) VALUES (
  'default-legacy',
  'Legacy Gallery',
  'Photos uploaded before session system',
  false,
  datetime('now')
);

-- Assign existing photos to legacy session
UPDATE photo_uploads 
SET session_id = 'default-legacy' 
WHERE session_id IS NULL;

-- Insert example test session (optional - can be deleted)
INSERT OR IGNORE INTO gallery_sessions (
  session_id,
  title,
  description,
  is_active
) VALUES (
  'test-example',
  'Test Session - Practice Here',
  'Upload test photos here to try the system',
  true
);

-- Database migration successful
-- Next: Run pnpm run seed:local to test the session system

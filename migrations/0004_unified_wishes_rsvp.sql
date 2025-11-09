-- Unified Wishes & RSVP Migration
-- Creates a simplified table combining wishes and RSVP functionality
-- Following the website format at hi.wekita.co.id/alfina-mugni/

-- Create unified wishes_rsvp table
CREATE TABLE IF NOT EXISTS wishes_rsvp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  attending TEXT CHECK (attending IN ('yes', 'no', 'maybe')) DEFAULT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT,
  moderated_at TEXT,
  moderated_by TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishes_rsvp_approved ON wishes_rsvp(approved);
CREATE INDEX IF NOT EXISTS idx_wishes_rsvp_created_at ON wishes_rsvp(created_at);
CREATE INDEX IF NOT EXISTS idx_wishes_rsvp_attending ON wishes_rsvp(attending);


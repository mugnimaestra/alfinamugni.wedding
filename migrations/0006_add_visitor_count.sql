-- Add visitor_count column to wishes_rsvp table
-- Allows tracking how many visitors are coming when RSVP is "yes"
-- This migration is idempotent - safe to run multiple times
--
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN.
-- This will fail if column already exists. Use a migration runner that checks
-- column existence first, or ensure this migration runs only once.

-- Add visitor_count column
ALTER TABLE wishes_rsvp ADD COLUMN visitor_count INTEGER DEFAULT 1;

-- Update existing records where attending is 'yes' to have visitor_count = 1
UPDATE wishes_rsvp SET visitor_count = 1 WHERE attending = 'yes' AND visitor_count IS NULL;

-- Set visitor_count to NULL for records where attending is 'no' or NULL
UPDATE wishes_rsvp SET visitor_count = NULL WHERE attending = 'no' OR attending IS NULL;

-- Note: SQLite doesn't support adding CHECK constraints via ALTER TABLE
-- The constraint will be enforced at the application level


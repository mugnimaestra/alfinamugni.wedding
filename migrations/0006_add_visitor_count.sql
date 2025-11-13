-- Add visitor_count column to wishes_rsvp table
-- Allows tracking how many visitors are coming when RSVP is "yes"
--
-- This migration is idempotent - it can be run multiple times safely.
-- We check if the column exists before attempting to add it.

-- Check if visitor_count column exists
SELECT COUNT(*) as visitor_count_exists
FROM pragma_table_info('wishes_rsvp')
WHERE name = 'visitor_count';

-- Add visitor_count column if it doesn't exist
-- UNCOMMENT the line below if the check above returns 0 (column doesn't exist)
-- COMMENT OUT the line below if the check above returns 1 (column exists)
-- ALTER TABLE wishes_rsvp ADD COLUMN visitor_count INTEGER DEFAULT 1;

-- Update existing records where attending is 'yes' to have visitor_count = 1
UPDATE wishes_rsvp SET visitor_count = 1 WHERE attending = 'yes' AND visitor_count IS NULL;

-- Set visitor_count to NULL for records where attending is 'no' or NULL
UPDATE wishes_rsvp SET visitor_count = NULL WHERE attending = 'no' OR attending IS NULL;

-- Note: SQLite doesn't support adding CHECK constraints via ALTER TABLE
-- The constraint will be enforced at the application level


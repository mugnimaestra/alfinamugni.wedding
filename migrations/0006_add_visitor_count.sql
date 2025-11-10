-- Add visitor_count column to wishes_rsvp table
-- Allows tracking how many visitors are coming when RSVP is "yes"
-- 
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN.
-- If this migration has been run before and the column already exists, comment out
-- the ALTER TABLE line below to avoid "duplicate column name" error.
-- The UPDATE statements will work correctly whether the column is newly added or already exists.

-- Add visitor_count column with default value of 1
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN.
-- If this column already exists, this statement will fail - that's OK, comment it out if needed.
-- For fresh databases, this should be uncommented:
ALTER TABLE wishes_rsvp ADD COLUMN visitor_count INTEGER DEFAULT 1;

-- Update existing records where attending is 'yes' to have visitor_count = 1
UPDATE wishes_rsvp SET visitor_count = 1 WHERE attending = 'yes' AND visitor_count IS NULL;

-- Set visitor_count to NULL for records where attending is 'no' or NULL
UPDATE wishes_rsvp SET visitor_count = NULL WHERE attending = 'no' OR attending IS NULL;

-- Note: SQLite doesn't support adding CHECK constraints via ALTER TABLE
-- The constraint will be enforced at the application level


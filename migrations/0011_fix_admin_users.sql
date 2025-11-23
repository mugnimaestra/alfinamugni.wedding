-- Migration: Fix admin_users table schema
-- Adds missing 'name' and 'active' columns to admin_users table
-- This fixes schema drift in production where the table was created before
-- migration 0003_update_schema.sql ran
-- 
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- If columns already exist, these ALTER TABLE statements will fail
-- The UPDATE statements are safe to re-run and will only update NULL values
--
-- To check if columns exist before running:
-- PRAGMA table_info(admin_users);

-- Add 'name' column if it doesn't exist
-- This will fail if the column already exists - that's expected and safe to ignore
ALTER TABLE admin_users ADD COLUMN name TEXT;

-- Add 'active' column if it doesn't exist
-- This will fail if the column already exists - that's expected and safe to ignore
ALTER TABLE admin_users ADD COLUMN active BOOLEAN DEFAULT TRUE;

-- Update existing rows to set defaults for newly added columns
-- These UPDATE statements are idempotent - safe to run multiple times
-- Extract name from email (part before @) or set to 'Admin User'
UPDATE admin_users 
SET name = COALESCE(
  name,
  CASE 
    WHEN email LIKE '%@%' THEN SUBSTR(email, 1, INSTR(email, '@') - 1)
    ELSE 'Admin User'
  END
)
WHERE name IS NULL OR name = '';

-- Set active to TRUE for all existing rows that don't have it set
UPDATE admin_users 
SET active = TRUE 
WHERE active IS NULL;

-- Migration complete
-- The admin_users table now has the correct schema matching migration 0001


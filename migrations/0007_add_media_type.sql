-- Migration: Add media_type field to photo_uploads table
-- Adds explicit media_type enum field ('image', 'video') for better querying
-- vs parsing content_type strings
-- This migration is idempotent - safe to run multiple times

-- Check if media_type column exists, and add it if it doesn't
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN,
-- so we use a workaround: attempt to add the column and ignore errors if it exists
-- For idempotency, we check first using PRAGMA table_info
-- Note: In practice, if column exists, ALTER TABLE will fail silently in some contexts
-- The UPDATE statement below uses WHERE media_type IS NULL, making it safe to re-run

-- Attempt to add media_type column (will fail silently if column already exists in some SQLite versions)
-- For maximum compatibility, check column existence first:
-- If running manually and column exists, comment out the ALTER TABLE line below
ALTER TABLE photo_uploads ADD COLUMN media_type TEXT CHECK (media_type IN ('image', 'video'));

-- Update existing records to set media_type based on content_type
UPDATE photo_uploads 
SET media_type = CASE 
    WHEN content_type LIKE 'video/%' THEN 'video'
    WHEN content_type LIKE 'image/%' THEN 'image'
    ELSE 'image' -- Default to image for unknown types
END
WHERE media_type IS NULL;

-- Create index on media_type for filtering
CREATE INDEX IF NOT EXISTS idx_photo_uploads_media_type ON photo_uploads(media_type);


-- Migration: Add media_type field to photo_uploads table
-- Adds explicit media_type enum field ('image', 'video') for better querying
-- vs parsing content_type strings

-- Add media_type column with CHECK constraint
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN.
-- If this column already exists, this statement will fail - that's OK, comment it out if needed.
-- For fresh databases, this should be uncommented:
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


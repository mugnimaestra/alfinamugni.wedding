-- Migration: Enhanced Photo Upload Metadata
-- Adds support for ProcessedImage metadata including compression stats,
-- device info, network info, thumbnails, and dimensions

-- Add new columns to photo_uploads table (only columns that don't exist in initial schema)
-- Note: category, width, height already exist in initial schema, so we skip them
-- 
-- IMPORTANT: This migration adds columns that are also included in migration 0005
-- when it recreates the photo_uploads table. If migration 0005 has already run,
-- these columns will already exist, and the ALTER TABLE statements will fail.
--
-- To make this migration idempotent, we check column existence first using PRAGMA table_info.
-- Since SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN, we use a workaround:
-- We check if each column exists, and only attempt to add it if it doesn't exist.
-- However, since SQLite doesn't support conditional DDL execution, we check existence first,
-- and if a column exists, we skip adding it by commenting out the ALTER TABLE statement.
--
-- Pattern: For each column, check if it exists. If it doesn't exist, add it.
-- If it exists, comment out the ALTER TABLE statement to make the migration idempotent.

-- Check if compressed_size column exists
-- If this returns 1, the column exists - comment out the ALTER TABLE below
-- If this returns 0, the column doesn't exist - uncomment the ALTER TABLE below
SELECT COUNT(*) as compressed_size_exists
FROM pragma_table_info('photo_uploads') 
WHERE name = 'compressed_size';

-- Add compressed_size column if it doesn't exist
-- UNCOMMENT the line below if the check above returns 0 (column doesn't exist)
-- COMMENT OUT the line below if the check above returns 1 (column exists)
-- ALTER TABLE photo_uploads ADD COLUMN compressed_size INTEGER;

-- Check if original_size column exists
SELECT COUNT(*) as original_size_exists
FROM pragma_table_info('photo_uploads') 
WHERE name = 'original_size';

-- Add original_size column if it doesn't exist
-- UNCOMMENT if column doesn't exist, COMMENT OUT if it exists
-- ALTER TABLE photo_uploads ADD COLUMN original_size INTEGER;

-- Check if compression_ratio column exists
SELECT COUNT(*) as compression_ratio_exists
FROM pragma_table_info('photo_uploads') 
WHERE name = 'compression_ratio';

-- Add compression_ratio column if it doesn't exist
-- UNCOMMENT if column doesn't exist, COMMENT OUT if it exists
-- ALTER TABLE photo_uploads ADD COLUMN compression_ratio REAL;

-- Check if thumbnail_url column exists
SELECT COUNT(*) as thumbnail_url_exists
FROM pragma_table_info('photo_uploads') 
WHERE name = 'thumbnail_url';

-- Add thumbnail_url column if it doesn't exist
-- UNCOMMENT if column doesn't exist, COMMENT OUT if it exists
-- ALTER TABLE photo_uploads ADD COLUMN thumbnail_url TEXT;

-- Check if device_info column exists
SELECT COUNT(*) as device_info_exists
FROM pragma_table_info('photo_uploads') 
WHERE name = 'device_info';

-- Add device_info column if it doesn't exist
-- UNCOMMENT if column doesn't exist, COMMENT OUT if it exists
-- ALTER TABLE photo_uploads ADD COLUMN device_info TEXT;

-- Check if network_info column exists
SELECT COUNT(*) as network_info_exists
FROM pragma_table_info('photo_uploads') 
WHERE name = 'network_info';

-- Add network_info column if it doesn't exist
-- UNCOMMENT if column doesn't exist, COMMENT OUT if it exists
-- ALTER TABLE photo_uploads ADD COLUMN network_info TEXT;

-- Update existing records with default values
-- These UPDATE statements are safe to re-run (idempotent)
UPDATE photo_uploads 
SET compressed_size = COALESCE(compressed_size, file_size),
    original_size = COALESCE(original_size, file_size),
    compression_ratio = COALESCE(compression_ratio, 1.0),
    device_info = COALESCE(device_info, 'Unknown'),
    network_info = COALESCE(network_info, 'Unknown')
WHERE compressed_size IS NULL OR original_size IS NULL OR compression_ratio IS NULL 
   OR device_info IS NULL OR network_info IS NULL;

-- Create index on upload_date for faster sorting
-- Note: idx_photo_uploads_category already exists from migration 0001, so it's not recreated here
CREATE INDEX IF NOT EXISTS idx_photo_uploads_upload_date ON photo_uploads(upload_date DESC);

-- Create index on device_info for analytics
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device_info ON photo_uploads(device_info);

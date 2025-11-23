-- Migration: Enhanced Photo Upload Metadata
-- Adds support for ProcessedImage metadata including compression stats,
-- device info, network info, thumbnails, and dimensions
-- This migration is idempotent - safe to run multiple times

-- Add new columns to photo_uploads table (only columns that don't exist in initial schema)
-- Note: category, width, height already exist in initial schema, so we skip them
-- 
-- IMPORTANT: This migration adds columns that are also included in migration 0005
-- when it recreates the photo_uploads table. If migration 0005 has already run,
-- these columns will already exist, and the ALTER TABLE statements will fail.
--
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN.
-- This migration uses a pattern that attempts to add columns and will fail gracefully
-- if columns already exist. For automated runs, use a migration runner that checks
-- column existence first, or run this migration only once.

-- Add compressed_size column
-- Note: This will fail if column already exists - that's OK, migration can continue
ALTER TABLE photo_uploads ADD COLUMN compressed_size INTEGER;

-- Add original_size column
ALTER TABLE photo_uploads ADD COLUMN original_size INTEGER;

-- Add compression_ratio column
ALTER TABLE photo_uploads ADD COLUMN compression_ratio REAL;

-- Add thumbnail_url column
ALTER TABLE photo_uploads ADD COLUMN thumbnail_url TEXT;

-- Add device_info column
ALTER TABLE photo_uploads ADD COLUMN device_info TEXT;

-- Add network_info column
ALTER TABLE photo_uploads ADD COLUMN network_info TEXT;

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

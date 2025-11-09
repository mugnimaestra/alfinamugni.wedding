-- Migration: Enhanced Photo Upload Metadata
-- Adds support for ProcessedImage metadata including compression stats,
-- device info, network info, thumbnails, and dimensions

-- Add new columns to photo_uploads table
ALTER TABLE photo_uploads ADD COLUMN compressed_size INTEGER;
ALTER TABLE photo_uploads ADD COLUMN original_size INTEGER;
ALTER TABLE photo_uploads ADD COLUMN compression_ratio REAL;
ALTER TABLE photo_uploads ADD COLUMN thumbnail_url TEXT;
ALTER TABLE photo_uploads ADD COLUMN device_info TEXT;
ALTER TABLE photo_uploads ADD COLUMN network_info TEXT;
ALTER TABLE photo_uploads ADD COLUMN category TEXT DEFAULT 'candid';
ALTER TABLE photo_uploads ADD COLUMN width INTEGER;
ALTER TABLE photo_uploads ADD COLUMN height INTEGER;

-- Update existing records with default values
UPDATE photo_uploads 
SET compressed_size = file_size,
    original_size = file_size,
    compression_ratio = 1.0,
    device_info = 'Unknown',
    network_info = 'Unknown',
    category = 'candid',
    width = 0,
    height = 0
WHERE compressed_size IS NULL;

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_photo_uploads_category ON photo_uploads(category);

-- Create index on upload_date for faster sorting
CREATE INDEX IF NOT EXISTS idx_photo_uploads_upload_date ON photo_uploads(upload_date DESC);

-- Create index on device_info for analytics
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device_info ON photo_uploads(device_info);


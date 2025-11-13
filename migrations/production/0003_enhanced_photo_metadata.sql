-- Migration: Enhanced Photo Upload Metadata (Production)
-- Adds support for ProcessedImage metadata including compression stats,
-- device info, network info, thumbnails, and dimensions

-- Add new columns to photo_uploads table
ALTER TABLE photo_uploads ADD COLUMN compressed_size INTEGER;
ALTER TABLE photo_uploads ADD COLUMN original_size INTEGER;
ALTER TABLE photo_uploads ADD COLUMN compression_ratio REAL;
ALTER TABLE photo_uploads ADD COLUMN thumbnail_url TEXT;
ALTER TABLE photo_uploads ADD COLUMN device_info TEXT;
ALTER TABLE photo_uploads ADD COLUMN network_info TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device_info ON photo_uploads(device_info);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_thumbnail ON photo_uploads(thumbnail_url);

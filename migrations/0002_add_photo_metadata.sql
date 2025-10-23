-- Migration: Add metadata fields to photo_uploads table
-- Created: 2025-10-23
-- Purpose: Track device and upload metadata for gallery analytics

-- Add new metadata columns to photo_uploads table
ALTER TABLE photo_uploads ADD COLUMN user_agent TEXT;
ALTER TABLE photo_uploads ADD COLUMN screen_resolution TEXT;
ALTER TABLE photo_uploads ADD COLUMN device_orientation TEXT;
ALTER TABLE photo_uploads ADD COLUMN connection_type TEXT;
ALTER TABLE photo_uploads ADD COLUMN country_code TEXT;
ALTER TABLE photo_uploads ADD COLUMN camera_model TEXT;

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_photo_uploads_country ON photo_uploads(country_code);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device ON photo_uploads(user_agent);

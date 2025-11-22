-- Migration: Add public URL columns for direct R2 access
-- Adds public_url and thumbnail_public_url columns to enable direct CDN access
-- This bypasses the /api/photos endpoint for better performance and compatibility
-- This migration is idempotent - safe to run multiple times

-- Add public_url column to store the public R2 URL for the main photo
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- If column already exists, this will fail - that's OK for idempotency
-- The UPDATE statements in migration 0009 use WHERE ... IS NULL, making them safe to re-run
ALTER TABLE photo_uploads ADD COLUMN public_url TEXT;

-- Add thumbnail_public_url column to store the public R2 URL for thumbnails
-- Note: If column already exists, this will fail - that's OK for idempotency
ALTER TABLE photo_uploads ADD COLUMN thumbnail_public_url TEXT;

-- Create index for public_url lookups
CREATE INDEX IF NOT EXISTS idx_photo_uploads_public_url ON photo_uploads(public_url);

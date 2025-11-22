-- Migration: Populate public URL fields for R2 direct access
-- This migration populates the public_url and thumbnail_public_url columns
-- with the correct Cloudflare R2 public URLs for direct CDN access
-- This migration is idempotent - safe to run multiple times
-- UPDATE statements use WHERE ... IS NULL to only update empty fields

-- Update public_url column for main photos
-- Format: https://assets.alfinamugni.wedding/photos/YYYY-MM-DD/{filename}
UPDATE photo_uploads 
SET public_url = 'https://assets.alfinamugni.wedding/' || r2_key
WHERE public_url IS NULL AND r2_key IS NOT NULL;

-- Update thumbnail_public_url column for thumbnails
-- Format: https://assets.alfinamugni.wedding/thumbnails/YYYY-MM-DD/{filename}
UPDATE photo_uploads 
SET thumbnail_public_url = 'https://assets.alfinamugni.wedding/' || thumbnail_url
WHERE thumbnail_public_url IS NULL AND thumbnail_url IS NOT NULL;

-- Verify the update
SELECT id, filename, r2_key, thumbnail_url, public_url, thumbnail_public_url 
FROM photo_uploads 
WHERE public_url IS NOT NULL OR thumbnail_public_url IS NOT NULL
ORDER BY id DESC
LIMIT 10;
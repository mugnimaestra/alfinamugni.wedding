-- Migration: Add Migration Tracking Table
-- Creates a table to track which migrations have been applied
-- This enables proper migration management and prevents duplicate runs
-- This migration is idempotent - safe to run multiple times

-- Create schema_migrations table to track applied migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT UNIQUE NOT NULL,
  applied_at TEXT DEFAULT (datetime('now')),
  checksum TEXT,
  notes TEXT
);

-- Create index on migration_name for faster lookups
CREATE INDEX IF NOT EXISTS idx_schema_migrations_name ON schema_migrations(migration_name);

-- Backfill migration tracking based on schema state
-- This attempts to identify which migrations have already been applied
-- by checking for their characteristic schema changes

-- Check if migration 0001 was applied (has rsvps or photo_uploads table)
-- Note: These tables may have been dropped in later migrations, so we check
-- for tables that should exist after all migrations
INSERT OR IGNORE INTO schema_migrations (migration_name, applied_at, notes)
SELECT '0001_initial_schema.sql', datetime('now'), 'Detected by presence of core tables'
WHERE EXISTS (
  SELECT 1 FROM sqlite_master 
  WHERE type='table' AND name IN ('photo_uploads', 'admin_users', 'wedding_settings', 'page_views')
);

-- Check if migration 0002 was applied (has gallery_sessions table)
-- Note: This table is dropped in migration 0005, so if it exists, 0002 was applied
-- If it doesn't exist and we have wishes_rsvp, then 0005 was applied (which means 0002 was too)
INSERT OR IGNORE INTO schema_migrations (migration_name, applied_at, notes)
SELECT '0002_gallery_sessions.sql', datetime('now'), 'Detected by migration sequence'
WHERE EXISTS (
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='gallery_sessions'
) OR (
  -- If gallery_sessions doesn't exist but wishes_rsvp does, migration 0005 ran (which requires 0002)
  EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='wishes_rsvp')
  AND NOT EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='rsvps')
);

-- Check if migration 0003 was applied (has compressed_size column in photo_uploads)
INSERT OR IGNORE INTO schema_migrations (migration_name, applied_at, notes)
SELECT '0003_enhanced_photo_metadata.sql', datetime('now'), 'Detected by compressed_size column'
WHERE EXISTS (
  SELECT 1 FROM pragma_table_info('photo_uploads') WHERE name = 'compressed_size'
);

-- Check if migration 0004 was applied (has wishes_rsvp table)
INSERT OR IGNORE INTO schema_migrations (migration_name, applied_at, notes)
SELECT '0004_unified_wishes_rsvp.sql', datetime('now'), 'Detected by wishes_rsvp table'
WHERE EXISTS (
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='wishes_rsvp'
);

-- Check if migration 0005 was applied (rsvps and guest_wishes tables dropped)
INSERT OR IGNORE INTO schema_migrations (migration_name, applied_at, notes)
SELECT '0005_schema_cleanup.sql', datetime('now'), 'Detected by absence of rsvps table'
WHERE NOT EXISTS (
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='rsvps'
) AND EXISTS (
  SELECT 1 FROM sqlite_master WHERE type='table' AND name='wishes_rsvp'
);

-- Check if migration 0006 was applied (has visitor_count column in wishes_rsvp)
INSERT OR IGNORE INTO schema_migrations (migration_name, applied_at, notes)
SELECT '0006_add_visitor_count.sql', datetime('now'), 'Detected by visitor_count column'
WHERE EXISTS (
  SELECT 1 FROM pragma_table_info('wishes_rsvp') WHERE name = 'visitor_count'
);

-- Check if migration 0007 was applied (has media_type column in photo_uploads)
INSERT OR IGNORE INTO schema_migrations (migration_name, applied_at, notes)
SELECT '0007_add_media_type.sql', datetime('now'), 'Detected by media_type column'
WHERE EXISTS (
  SELECT 1 FROM pragma_table_info('photo_uploads') WHERE name = 'media_type'
);

-- Check if migration 0008 was applied (has public_url column in photo_uploads)
INSERT OR IGNORE INTO schema_migrations (migration_name, applied_at, notes)
SELECT '0008_add_public_urls.sql', datetime('now'), 'Detected by public_url column'
WHERE EXISTS (
  SELECT 1 FROM pragma_table_info('photo_uploads') WHERE name = 'public_url'
);

-- Check if migration 0009 was applied (public_url values populated)
-- This is harder to detect, so we assume it was applied if 0008 was applied
INSERT OR IGNORE INTO schema_migrations (migration_name, applied_at, notes)
SELECT '0009_populate_public_urls_fixed.sql', datetime('now'), 'Assumed applied with 0008'
WHERE EXISTS (
  SELECT 1 FROM schema_migrations WHERE migration_name = '0008_add_public_urls.sql'
);

-- Migration complete
-- The schema_migrations table now tracks which migrations have been applied
-- Future migrations should insert their name into this table after successful execution


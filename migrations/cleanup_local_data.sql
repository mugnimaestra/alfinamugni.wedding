-- Cleanup script to delete all data rows from local database "wedding-database-preview"
-- This script preserves all tables and schema structure
-- Only deletes data rows, keeping tables intact
-- Suitable for resetting local database during development/testing

DELETE FROM wishes_rsvp;
DELETE FROM photo_uploads;
DELETE FROM admin_users;

-- Verify deletion
SELECT 'wishes_rsvp' as table_name, COUNT(*) as row_count FROM wishes_rsvp
UNION ALL
SELECT 'photo_uploads', COUNT(*) FROM photo_uploads
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;


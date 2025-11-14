-- Cleanup script to delete all data rows from production database
-- This script preserves all tables and schema structure
-- Only deletes data rows, keeping tables intact

DELETE FROM wishes_rsvp;
DELETE FROM photo_uploads;
DELETE FROM admin_users WHERE email != 'admin@alfinamugni.wedding';

-- Verify deletion
SELECT 'wishes_rsvp' as table_name, COUNT(*) as row_count FROM wishes_rsvp
UNION ALL
SELECT 'photo_uploads', COUNT(*) FROM photo_uploads
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;

-- Cleanup script to delete only wishes and RSVP data
-- This script preserves photos and admin users
-- Only deletes wishes_rsvp rows, keeping table structure intact

DELETE FROM wishes_rsvp;

-- Verify deletion
SELECT 'wishes_rsvp' as table_name, COUNT(*) as row_count FROM wishes_rsvp
UNION ALL
SELECT 'photo_uploads', COUNT(*) FROM photo_uploads
UNION ALL
SELECT 'admin_users', COUNT(*) FROM admin_users;

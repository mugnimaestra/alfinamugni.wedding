-- Clear all photo data from photo_uploads table
DELETE FROM photo_uploads;
-- Reset the autoincrement counter
DELETE FROM sqlite_sequence WHERE name='photo_uploads';


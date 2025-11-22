PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "admin_users" VALUES('admin-001','admin','$2b$10$awPfIR79wHqUOwbSjS7aiuvxh1OnTZg7R7/ecJVBwAXFal5nDscX6','admin@alfinamugni.wedding','admin',1,NULL,'2025-10-12 11:10:29','2025-10-12 11:10:29');
CREATE TABLE admin_activity_log (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" VALUES(1,'0001_initial_schema.sql','2025-10-12 13:07:01');
INSERT INTO "d1_migrations" VALUES(2,'0002_gallery_sessions.sql','2025-10-27 16:00:34');
INSERT INTO "d1_migrations" VALUES(3,'0003_update_schema.sql','2025-11-02 11:23:50');
CREATE TABLE wishes_rsvp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_name TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  attending TEXT CHECK (attending IN ('yes', 'no', 'maybe')) DEFAULT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TEXT DEFAULT (datetime('now')),
  ip_address TEXT,
  moderated_at TEXT,
  moderated_by TEXT
, visitor_count INTEGER DEFAULT 1);
INSERT INTO "wishes_rsvp" VALUES(3,'Anaseu',NULL,'Happy to be the witness of y''all journey since the beginning, wishing you guys the absolute happiness ahead!','yes',1,'2025-11-14 09:23:08','110.137.192.33',NULL,NULL,1);
INSERT INTO "wishes_rsvp" VALUES(4,'Grup Mawar Residence',NULL,'Cihuy otw ganz','yes',1,'2025-11-14 09:34:38','2404:8000:1095:32dd:e4f8:8702:f7cc:30c3',NULL,NULL,2);
INSERT INTO "wishes_rsvp" VALUES(5,'Fauzan A.R',NULL,'Tulis ucapan selamat Anda disini...','yes',1,'2025-11-15 16:46:34','118.137.64.213',NULL,NULL,1);
INSERT INTO "wishes_rsvp" VALUES(6,'Dika & Andini',NULL,'Mantap congrats Mugni and Fina','yes',1,'2025-11-16 02:52:08','2404:8000:1001:108b:e58:8431:5679:827c',NULL,NULL,2);
INSERT INTO "wishes_rsvp" VALUES(7,'Suci dan Partner',NULL,'Yuhuuuu otw gays!','yes',1,'2025-11-16 07:22:23','110.137.192.232',NULL,NULL,1);
INSERT INTO "wishes_rsvp" VALUES(8,'Siena si unyuu cantik celaloeee',NULL,'Siap flight dari Papua🛫✈️😆','yes',1,'2025-11-16 08:02:19','2a09:bac3:3999:25b9::3c2:5',NULL,NULL,1);
INSERT INTO "wishes_rsvp" VALUES(9,'Shanti (Haniko)',NULL,replace('YAYY FINALLYYY✨✨✨utiwiiiiii✨\nlancarr sampai hari H yaa beb!🫶🏻🫶🏻🫶🏻','\n',char(10)),'yes',1,'2025-11-16 09:11:12','103.84.7.78',NULL,NULL,1);
INSERT INTO "wishes_rsvp" VALUES(10,'Keluarga Pabuaran',NULL,'Smga lancar sampe  hari H ych teh pipi','yes',1,'2025-11-16 09:21:11','125.161.68.189',NULL,NULL,2);
INSERT INTO "wishes_rsvp" VALUES(11,'Keluarga Pabuaran',NULL,'Mudah"an di lancar kan semua nya. Aamiiin','yes',1,'2025-11-16 10:33:11','114.4.214.228',NULL,NULL,1);
INSERT INTO "wishes_rsvp" VALUES(12,'Azura (Bude Yume)',NULL,'CONGRAATSS BEEB!! MANGATS MOGA LANCAR <33','yes',1,'2025-11-16 13:37:12','140.213.251.86',NULL,NULL,1);
INSERT INTO "wishes_rsvp" VALUES(13,'Menturry',NULL,'MET NIKAHHHHHH SEMOGA SAKINA MAWADAH WAROHMAH PROK PROK PROK Semoga dilancarkan jugaaaa','yes',1,'2025-11-17 00:09:13','2400:9800:1f9:85f2:1878:a23f:705e:b48e',NULL,NULL,1);
CREATE TABLE IF NOT EXISTS "photo_uploads" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  upload_date TEXT DEFAULT (datetime('now')),
  uploader_name TEXT,
  uploader_email TEXT,
  bucket_path TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  category TEXT CHECK (category IN ('ceremony', 'reception', 'guests', 'professional')),
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  screen_resolution TEXT,
  device_orientation TEXT,
  connection_type TEXT,
  country_code TEXT,
  camera_model TEXT,
  compressed_size INTEGER,
  original_size INTEGER,
  compression_ratio REAL,
  thumbnail_url TEXT,
  device_info TEXT,
  network_info TEXT
, media_type TEXT CHECK (media_type IN ('image', 'video')));
INSERT INTO "photo_uploads" VALUES(1,'image.jpg','image.jpg',3041608,'image/jpeg',3024,4032,'2025-11-14 05:39:49','Admin',NULL,'photos/2025-11-14/1763098788460-ipjj3r.jpg','photos/2025-11-14/1763098788460-ipjj3r.jpg',0,NULL,'Yeehaw',NULL,NULL,NULL,NULL,NULL,NULL,NULL,3041608,3041608,1,'thumbnails/2025-11-14/1763098788460-ipjj3r.jpg','iPhone','Unknown','image');
INSERT INTO "photo_uploads" VALUES(2,'image.jpg','image.jpg',2999672,'image/jpeg',3024,4032,'2025-11-14 09:23:02','Anonymous',NULL,'photos/2025-11-14/1763112182404-zj1a3r.jpg','photos/2025-11-14/1763112182404-zj1a3r.jpg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,2999672,2999672,1,'thumbnails/2025-11-14/1763112182404-zj1a3r.jpg','iPhone','Unknown','image');
INSERT INTO "photo_uploads" VALUES(3,'IMG_5695.jpeg','IMG_5695.jpeg',2114478,'image/jpeg',0,0,'2025-11-14 09:23:04','Anonymous',NULL,'photos/2025-11-14/1763112183331-sx014h.jpeg','photos/2025-11-14/1763112183331-sx014h.jpeg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,2114478,2114478,1,'thumbnails/2025-11-14/1763112183331-sx014h.jpeg','iPhone','Unknown','image');
INSERT INTO "photo_uploads" VALUES(4,'image.jpg','image.jpg',2957153,'image/jpeg',3024,4032,'2025-11-14 12:46:41','Anonymous',NULL,'photos/2025-11-14/1763124399236-ckdm4ax.jpg','photos/2025-11-14/1763124399236-ckdm4ax.jpg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,2957153,2957153,1,'thumbnails/2025-11-14/1763124399236-ckdm4ax.jpg','iPhone','Unknown','image');
INSERT INTO "photo_uploads" VALUES(5,'78481718784__DA74DF71-8858-4358-B153-E9560922ACD3.MOV','78481718784__DA74DF71-8858-4358-B153-E9560922ACD3.MOV',316070,'video/quicktime',0,0,'2025-11-14 12:46:42','Anonymous',NULL,'photos/2025-11-14/1763124401469-6kyex9.MOV','photos/2025-11-14/1763124401469-6kyex9.MOV',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,316070,316070,1,'thumbnails/2025-11-14/1763124401469-6kyex9.MOV','iPhone','Unknown','video');
INSERT INTO "photo_uploads" VALUES(6,'IMG_5707.mov','IMG_5707.mov',15806848,'video/quicktime',0,0,'2025-11-14 12:57:34','Test video',NULL,'photos/2025-11-14/1763125052772-zz1xvd.mov','photos/2025-11-14/1763125052772-zz1xvd.mov',0,NULL,'Err',NULL,NULL,NULL,NULL,NULL,NULL,NULL,15806848,15806848,1,'thumbnails/2025-11-14/1763125052772-zz1xvd.mov','iPhone','Unknown','video');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('d1_migrations',3);
INSERT INTO "sqlite_sequence" VALUES('photo_uploads',6);
INSERT INTO "sqlite_sequence" VALUES('wishes_rsvp',13);
CREATE INDEX idx_admin_users_username ON admin_users(username);
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);
CREATE INDEX idx_admin_activity_admin_user ON admin_activity_log(admin_user_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_log(created_at);
CREATE INDEX idx_admin_activity_action ON admin_activity_log(action);
CREATE INDEX idx_wishes_rsvp_approved ON wishes_rsvp(approved);
CREATE INDEX idx_wishes_rsvp_created_at ON wishes_rsvp(created_at);
CREATE INDEX idx_wishes_rsvp_attending ON wishes_rsvp(attending);
CREATE INDEX idx_photo_uploads_category ON photo_uploads(category);
CREATE INDEX idx_photo_uploads_upload_date ON photo_uploads(upload_date DESC);
CREATE INDEX idx_photo_uploads_country ON photo_uploads(country_code);
CREATE INDEX idx_photo_uploads_device ON photo_uploads(user_agent);
CREATE INDEX idx_photo_uploads_device_info ON photo_uploads(device_info);
CREATE INDEX idx_photo_uploads_r2_key ON photo_uploads(r2_key);
CREATE INDEX idx_photo_uploads_featured ON photo_uploads(featured);
CREATE INDEX idx_photo_uploads_media_type ON photo_uploads(media_type);
CREATE TRIGGER update_admin_users_updated_at
  AFTER UPDATE ON admin_users
  FOR EACH ROW
  BEGIN
    UPDATE admin_users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

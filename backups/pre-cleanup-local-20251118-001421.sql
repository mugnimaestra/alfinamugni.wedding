PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'moderator')),
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT,
  active BOOLEAN DEFAULT TRUE
);
CREATE TABLE wedding_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  updated_by TEXT
);
INSERT INTO "wedding_settings" VALUES(1,'rsvp_deadline','2025-11-15','RSVP deadline date','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(2,'max_plus_ones','2','Maximum plus ones per invitation','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(3,'wedding_date','2025-11-29','Wedding date','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(4,'ceremony_time','10:00','Ceremony start time','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(5,'reception_time','18:00','Reception start time','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(6,'venue_name','Jakarta Wedding Venue','Wedding venue name','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(7,'venue_address','Jakarta, Indonesia','Wedding venue address','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(8,'auto_approve_wishes','false','Automatically approve guest wishes','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(9,'email_notifications_enabled','true','Enable email notifications','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(10,'guest_photo_uploads_enabled','true','Allow guests to upload photos','2025-11-10 16:56:13',NULL);
INSERT INTO "wedding_settings" VALUES(11,'site_maintenance_mode','false','Enable maintenance mode','2025-11-10 16:56:13',NULL);
CREATE TABLE page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  viewed_at TEXT DEFAULT (datetime('now'))
);
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
, media_type TEXT CHECK (media_type IN ('image', 'video')), public_url TEXT, thumbnail_public_url TEXT);
INSERT INTO "photo_uploads" VALUES(1,'image.jpg','image.jpg',3041608,'image/jpeg',3024,4032,'2025-11-14 05:39:49','Admin',NULL,'photos/2025-11-14/1763098788460-ipjj3r.jpg','photos/2025-11-14/1763098788460-ipjj3r.jpg',0,NULL,'Yeehaw',NULL,NULL,NULL,NULL,NULL,NULL,NULL,3041608,3041608,1,'thumbnails/2025-11-14/1763098788460-ipjj3r.jpg','iPhone','Unknown','image',NULL,NULL);
INSERT INTO "photo_uploads" VALUES(2,'image.jpg','image.jpg',2999672,'image/jpeg',3024,4032,'2025-11-14 09:23:02','Anonymous',NULL,'photos/2025-11-14/1763112182404-zj1a3r.jpg','photos/2025-11-14/1763112182404-zj1a3r.jpg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,2999672,2999672,1,'thumbnails/2025-11-14/1763112182404-zj1a3r.jpg','iPhone','Unknown','image',NULL,NULL);
INSERT INTO "photo_uploads" VALUES(3,'IMG_5695.jpeg','IMG_5695.jpeg',2114478,'image/jpeg',0,0,'2025-11-14 09:23:04','Anonymous',NULL,'photos/2025-11-14/1763112183331-sx014h.jpeg','photos/2025-11-14/1763112183331-sx014h.jpeg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,2114478,2114478,1,'thumbnails/2025-11-14/1763112183331-sx014h.jpeg','iPhone','Unknown','image',NULL,NULL);
INSERT INTO "photo_uploads" VALUES(4,'image.jpg','image.jpg',2957153,'image/jpeg',3024,4032,'2025-11-14 12:46:41','Anonymous',NULL,'photos/2025-11-14/1763124399236-ckdm4ax.jpg','photos/2025-11-14/1763124399236-ckdm4ax.jpg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,2957153,2957153,1,'thumbnails/2025-11-14/1763124399236-ckdm4ax.jpg','iPhone','Unknown','image',NULL,NULL);
INSERT INTO "photo_uploads" VALUES(5,'78481718784__DA74DF71-8858-4358-B153-E9560922ACD3.MOV','78481718784__DA74DF71-8858-4358-B153-E9560922ACD3.MOV',316070,'video/quicktime',0,0,'2025-11-14 12:46:42','Anonymous',NULL,'photos/2025-11-14/1763124401469-6kyex9.MOV','photos/2025-11-14/1763124401469-6kyex9.MOV',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,316070,316070,1,'thumbnails/2025-11-14/1763124401469-6kyex9.MOV','iPhone','Unknown','video',NULL,NULL);
INSERT INTO "photo_uploads" VALUES(6,'__evelyn_chevalier_zenless_zone_zero_drawn_by_maanu__49d81480c0d238b09bbf4cdc0cb02b41.png','__evelyn_chevalier_zenless_zone_zero_drawn_by_maanu__49d81480c0d238b09bbf4cdc0cb02b41.png',7611179,'image/png',3307,4677,'2025-11-13 15:54:50','Anonymous',NULL,'photos/2025-11-13/1763049290222-ox6rmp.png','photos/2025-11-13/1763049290222-ox6rmp.png',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,7611179,7611179,1,'thumbnails/2025-11-13/1763049290222-ox6rmp.png','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-13/1763049290222-ox6rmp.png','https://assets.alfinamugni.wedding/thumbnails/2025-11-13/1763049290222-ox6rmp.png');
INSERT INTO "photo_uploads" VALUES(7,'_DSC5483.jpg','_DSC5483.jpg',1704714,'image/jpeg',4548,3026,'2025-11-13 15:55:41','Anonymous',NULL,'photos/2025-11-13/1763049340871-z4sa.jpg','photos/2025-11-13/1763049340871-z4sa.jpg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1704714,1704714,1,'thumbnails/2025-11-13/1763049340871-z4sa.jpg','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-13/1763049340871-z4sa.jpg','https://assets.alfinamugni.wedding/thumbnails/2025-11-13/1763049340871-z4sa.jpg');
INSERT INTO "photo_uploads" VALUES(8,'_DSC5622.jpg','_DSC5622.jpg',1668089,'image/jpeg',3936,2624,'2025-11-13 15:55:41','Anonymous',NULL,'photos/2025-11-13/1763049341034-vwh4k.jpg','photos/2025-11-13/1763049341034-vwh4k.jpg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1668089,1668089,1,'thumbnails/2025-11-13/1763049341034-vwh4k.jpg','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-13/1763049341034-vwh4k.jpg','https://assets.alfinamugni.wedding/thumbnails/2025-11-13/1763049341034-vwh4k.jpg');
INSERT INTO "photo_uploads" VALUES(9,'[Sales] Sidebar Block.png','[Sales] Sidebar Block.png',33232,'image/png',298,641,'2025-11-13 15:55:41','Anonymous',NULL,'photos/2025-11-13/1763049341083-8yb05e.png','photos/2025-11-13/1763049341083-8yb05e.png',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,33232,33232,1,'thumbnails/2025-11-13/1763049341083-8yb05e.png','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-13/1763049341083-8yb05e.png','https://assets.alfinamugni.wedding/thumbnails/2025-11-13/1763049341083-8yb05e.png');
INSERT INTO "photo_uploads" VALUES(10,'5a852a9ede55ed9885adeaeafa221028.jpg','5a852a9ede55ed9885adeaeafa221028.jpg',87563,'image/jpeg',736,736,'2025-11-13 15:55:41','Anonymous',NULL,'photos/2025-11-13/1763049341099-z0w9eo.jpg','photos/2025-11-13/1763049341099-z0w9eo.jpg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,87563,87563,1,'thumbnails/2025-11-13/1763049341099-z0w9eo.jpg','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-13/1763049341099-z0w9eo.jpg','https://assets.alfinamugni.wedding/thumbnails/2025-11-13/1763049341099-z0w9eo.jpg');
INSERT INTO "photo_uploads" VALUES(11,'before_compressed.mp4','before_compressed.mp4',880200,'video/mp4',294,638,'2025-11-13 16:13:09','Anonymous',NULL,'photos/2025-11-13/1763050389540-xz0gou.mp4','photos/2025-11-13/1763050389540-xz0gou.mp4',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,880200,880200,1,'thumbnails/2025-11-13/1763050389540-xz0gou.mp4','Mac','4g (10Mbps)','video','https://assets.alfinamugni.wedding/photos/2025-11-13/1763050389540-xz0gou.mp4','https://assets.alfinamugni.wedding/thumbnails/2025-11-13/1763050389540-xz0gou.mp4');
INSERT INTO "photo_uploads" VALUES(12,'313518-pepeee.png','313518-pepeee.png',17905,'image/png',96,96,'2025-11-14 00:00:16','Anonymous',NULL,'photos/2025-11-14/1763078416410-3xdx2.png','photos/2025-11-14/1763078416410-3xdx2.png',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,17905,17905,1,'thumbnails/2025-11-14/1763078416410-3xdx2.png','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-14/1763078416410-3xdx2.png','https://assets.alfinamugni.wedding/thumbnails/2025-11-14/1763078416410-3xdx2.png');
INSERT INTO "photo_uploads" VALUES(13,'pipin colored final.psd.png.png','pipin colored final.psd.png.png',3587952,'image/png',4134,4134,'2025-11-14 03:26:37','Anonymous',NULL,'photos/2025-11-14/1763090796856-gv2aq.png','photos/2025-11-14/1763090796856-gv2aq.png',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,3587952,3587952,1,'thumbnails/2025-11-14/1763090796856-gv2aq.png','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-14/1763090796856-gv2aq.png','https://assets.alfinamugni.wedding/thumbnails/2025-11-14/1763090796856-gv2aq.png');
INSERT INTO "photo_uploads" VALUES(14,'unj-icn.svg','unj-icn.svg',38570,'image/svg+xml',25,24,'2025-11-14 03:26:51','Anonymous',NULL,'photos/2025-11-14/1763090811218-a47ao7.svg','photos/2025-11-14/1763090811218-a47ao7.svg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,38570,38570,1,'thumbnails/2025-11-14/1763090811218-a47ao7.svg','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-14/1763090811218-a47ao7.svg','https://assets.alfinamugni.wedding/thumbnails/2025-11-14/1763090811218-a47ao7.svg');
INSERT INTO "photo_uploads" VALUES(15,'__evelyn_chevalier_zenless_zone_zero_drawn_by_maanu__49d81480c0d238b09bbf4cdc0cb02b41.png','__evelyn_chevalier_zenless_zone_zero_drawn_by_maanu__49d81480c0d238b09bbf4cdc0cb02b41.png',7611179,'image/png',3307,4677,'2025-11-14 03:31:12','Anonymous',NULL,'photos/2025-11-14/1763091072351-8zczgc.png','photos/2025-11-14/1763091072351-8zczgc.png',0,NULL,replace(replace('Evelyn dengan caption\r\n','\r',char(13)),'\n',char(10)),NULL,NULL,NULL,NULL,NULL,NULL,NULL,7611179,7611179,1,'thumbnails/2025-11-14/1763091072351-8zczgc.png','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-14/1763091072351-8zczgc.png','https://assets.alfinamugni.wedding/thumbnails/2025-11-14/1763091072351-8zczgc.png');
INSERT INTO "photo_uploads" VALUES(16,'after_compressed.mp4','after_compressed.mp4',1029213,'video/mp4',0,0,'2025-11-14 03:31:39','Video Upload',NULL,'photos/2025-11-14/1763091099794-fg1pa.mp4','photos/2025-11-14/1763091099794-fg1pa.mp4',0,NULL,'Test video upload',NULL,NULL,NULL,NULL,NULL,NULL,NULL,1029213,1029213,1,'thumbnails/2025-11-14/1763091099794-fg1pa.mp4','Mac','4g (10Mbps)','video','https://assets.alfinamugni.wedding/photos/2025-11-14/1763091099794-fg1pa.mp4','https://assets.alfinamugni.wedding/thumbnails/2025-11-14/1763091099794-fg1pa.mp4');
INSERT INTO "photo_uploads" VALUES(17,'FPU-2.png','FPU-2.png',578823,'image/png',1107,625,'2025-11-14 07:28:03','FPU',NULL,'photos/2025-11-14/1763105283612-jmv8sm.png','photos/2025-11-14/1763105283612-jmv8sm.png',0,NULL,'FPU',NULL,NULL,NULL,NULL,NULL,NULL,NULL,578823,578823,1,'thumbnails/2025-11-14/1763105283612-jmv8sm.png','Mac','4g (5.5Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-14/1763105283612-jmv8sm.png','https://assets.alfinamugni.wedding/thumbnails/2025-11-14/1763105283612-jmv8sm.png');
INSERT INTO "photo_uploads" VALUES(18,'__evelyn_chevalier_zenless_zone_zero_drawn_by_maanu__49d81480c0d238b09bbf4cdc0cb02b41.png','__evelyn_chevalier_zenless_zone_zero_drawn_by_maanu__49d81480c0d238b09bbf4cdc0cb02b41.png',7611179,'image/png',3307,4677,'2025-11-14 07:41:52','Anonymous',NULL,'photos/2025-11-14/1763106112472-0ni59k.png','photos/2025-11-14/1763106112472-0ni59k.png',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,7611179,7611179,1,'thumbnails/2025-11-14/1763106112472-0ni59k.png','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-14/1763106112472-0ni59k.png','https://assets.alfinamugni.wedding/thumbnails/2025-11-14/1763106112472-0ni59k.png');
INSERT INTO "photo_uploads" VALUES(19,'a4e2944a-c67c-44d7-bf5c-c9a0c212173b.jpeg','a4e2944a-c67c-44d7-bf5c-c9a0c212173b.jpeg',52658,'image/jpeg',0,0,'2025-11-14 07:41:52','Anonymous',NULL,'photos/2025-11-14/1763106112786-x26cj.jpeg','photos/2025-11-14/1763106112786-x26cj.jpeg',0,NULL,'',NULL,NULL,NULL,NULL,NULL,NULL,NULL,52658,52658,1,'thumbnails/2025-11-14/1763106112786-x26cj.jpeg','Mac','4g (10Mbps)','image','https://assets.alfinamugni.wedding/photos/2025-11-14/1763106112786-x26cj.jpeg','https://assets.alfinamugni.wedding/thumbnails/2025-11-14/1763106112786-x26cj.jpeg');
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" VALUES('wedding_settings',22);
INSERT INTO "sqlite_sequence" VALUES('admin_users',2);
INSERT INTO "sqlite_sequence" VALUES('wishes_rsvp',13);
INSERT INTO "sqlite_sequence" VALUES('photo_uploads',19);
CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);
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
CREATE INDEX idx_photo_uploads_public_url ON photo_uploads(public_url);
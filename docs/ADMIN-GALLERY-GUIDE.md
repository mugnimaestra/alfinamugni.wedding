# Gallery Session System - Admin Guide

## 📸 Quick Start (5 minutes)

### Step 1: Create Your First Session

1. Login to admin dashboard: `https://alfinamugni.wedding/admin`
2. Navigate to **Gallery → Sessions** (or `/admin/sessions`)
3. Click **"+ Create New Session"**
4. Fill in:
   - **Title**: "Wedding Day - November 29, 2025"
   - **Description**: "Share your favorite moments from our special day!"
   - **Session ID Prefix**: `wdng` (default)
5. Click **Create**

**Result:** You'll get a shareable link like:
```
https://alfinamugni.wedding/g/wdng-a7b3c4d5
```

---

### Step 2: Share with Guests

**Option A: QR Code (Recommended for Wedding Day)**

1. After creating session, QR code modal appears automatically
2. Click **"Download QR"** to save as PNG
3. Print QR code and place at:
   - Wedding entrance
   - Photo booth area
   - Reception tables
   - Guest book station

**Option B: Direct Link (For Pre-Wedding)**

1. Click **"Copy Link"** (📋) button on your session
2. Share via:
   - WhatsApp group
   - Wedding invitation email
   - Instagram story
   - Wedding website

---

### Step 3: Monitor Uploads

**Real-time Dashboard:**
- See photo count update (refresh page to see new count)
- View "Last upload" timestamp
- Check active/inactive status

**View Gallery:**
- Click **"View"** (👁️) button to see all photos
- Same view guests see
- Scroll through Pinterest-style layout

---

## 🎯 Common Scenarios

### Before Wedding: Test with Family

**Goal:** Try system with trusted people before D-day

1. Create session: "Test Session - Family Only"
2. Use prefix: `test` → generates `test-x1y2z3a4`
3. Share link with 5-10 family members
4. Ask them to upload 2-3 photos
5. Verify:
   - ✅ Photos appear immediately
   - ✅ Upload works on their phones
   - ✅ Gallery looks good
6. Review feedback
7. Mark session **Inactive** when done (or leave for reference)

**Pro tip:** Do this 1 week before wedding!

---

### Wedding Day: Main Event

**Goal:** Collect guest photos throughout the day

**Morning (Before Ceremony):**
1. Create fresh session: "Wedding Day - November 29, 2025"
2. Download QR code (will be shown automatically)
3. Print QR code (2-3 copies minimum)
4. Test QR code yourself with your phone
5. Give QR codes to venue staff

**During Event:**
1. Place QR codes at key locations:
   - Entrance/registration table
   - Photo booth
   - Reception dinner tables
   - Near dessert/gift table
2. Mention in MC announcement:
   ```
   "Please scan the QR code on your tables to upload 
   your photos and share your moments from today!"
   ```
3. Monitor dashboard occasionally (refresh to see counts)
4. Delete any inappropriate photos (rare!)

**After Wedding:**
1. Leave session active for 2-3 days
2. Guests continue uploading
3. Then mark session **Inactive**
4. Gallery stays viewable, uploads stopped

---

### After Wedding: View & Download

**View All Photos:**
1. Go to `/admin/sessions`
2. Click **"View"** on your wedding session
3. See all photos in gallery view

**Download Photos:**

Option 1: **Individual Download** (browser)
- Right-click on photo → Save image

Option 2: **Bulk Download** (R2 Dashboard)
```bash
# Using Wrangler CLI
wrangler r2 object list WEDDING_PHOTOS

# Download specific folder
wrangler r2 object get WEDDING_PHOTOS/photos/guests/2025/11/filename.jpg
```

Option 3: **Browser Extension**
- Use download manager extensions
- Filter by session photos

---

## 🛠️ Session Management

### Create Session

**When to create:**
- 1 week before: Test session
- Wedding day morning: Main session
- After wedding: "Extended Uploads" session (if needed)

**Best practices:**
- Use descriptive titles with date
- Include friendly description
- Choose meaningful prefix:
  - `wdng` = wedding day
  - `test` = testing
  - `recv` = reception only
  - `cerm` = ceremony only
- Start as **Active**

**Session ID Format:**
```
{prefix}-{8-char-random}
Examples:
  wdng-a7b3c4d5  (wedding)
  test-x1y2z3a4  (test)
  recv-e8f9g0h1  (reception)
```

---

### Monitor Session

**Dashboard View:**
```
📸 Wedding Day - Nov 29, 2025
   /g/wdng-a7b3c4d5
   342 photos · Last upload: 2min ago
   Status: 🟢 Active
   [Copy Link] [QR Code] [View] [Toggle]
```

**What to check:**
- **Photo count**: Growing? Good!
- **Last upload**: Recent? People are using it!
- **Status**: Green (Active) during event

**Red flags:**
- No uploads for 1+ hours during event
  → Check QR code visibility
  → Ask guests directly
  → Verify WiFi/data available
- Sudden spike (50+ uploads in 1 minute)
  → Possible bot (very rare)
  → Check photo quality

---

### Deactivate Session

**When to deactivate:**
- 2-3 days post-wedding
- When enough photos collected
- Need to stop uploads temporarily

**How:**
1. Click **Toggle** button (🔄) on session
2. Status changes to 🔴 Inactive
3. Gallery stays viewable
4. New uploads blocked

**Note:** Can reactivate anytime by clicking toggle again!

---

### Delete Inappropriate Photo

**If guest uploads wrong photo:**

1. Go to **Gallery → View Session**
2. Find inappropriate photo
3. Click photo to view full size (optional)
4. Use admin delete feature (from gallery page)
5. Confirm deletion

**What happens:**
- Photo removed from database
- File deleted from R2 storage
- Other photos unaffected
- Action is permanent

**When to delete:**
- Accidental duplicate
- Blurry/bad quality (if too many)
- Wrong event
- Inappropriate content (rare!)
- Test photos after testing

---

## 📱 Guest Experience

**What guests see:**

### 1. Scan QR or Open Link
→ Land on gallery page with session title

### 2. See Existing Photos
→ Pinterest-style scrolling
→ Can view all photos uploaded so far
→ See device names (e.g., "iPhone", "Samsung Phone")

### 3. Tap "Upload Photos/Videos" Button
→ Select photos from camera roll
→ Add optional caption (single caption for all)
→ Upload → Photos appear immediately after refresh

### 4. Continue Scrolling
→ See their upload appear
→ See other guests' uploads
→ Enjoy wedding memories!

**No account needed! No login! No forms! Just upload!**

---

## 🔧 Troubleshooting

### Problem: QR code doesn't work

**Check:**
- ✅ Is session Active? (green status)
- ✅ QR code pointing to correct URL?
- ✅ WiFi/mobile data available?
- ✅ URL format: `https://alfinamugni.wedding/g/wdng-...`

**Solutions:**
1. Regenerate QR code:
   - Click **QR Code** button
   - Download again
   - Replace printed versions
2. Share direct link instead (backup)
3. Test on your own phone first

---

### Problem: Photos not appearing after upload

**Check:**
1. Is session Active?
2. Did guest get success message?
3. Try refreshing page (F5 or pull-down)

**Fix:**
- Uploads appear immediately on backend
- Guest needs to refresh to see new photos
- Or navigate back and forth

---

### Problem: Guest sees "Session not found"

**Check:**
- ✅ Correct session ID in URL?
- ✅ Session exists in dashboard?
- ✅ No typos in QR code?

**Fix:**
- Verify URL matches exactly
- Regenerate QR if needed
- Create new session if lost

---

### Problem: Guest sees "Session no longer accepting uploads"

**Reason:** Session is marked Inactive

**Fix:**
1. Go to `/admin/sessions`
2. Find the session
3. Click **Toggle** to Activate
4. Status becomes 🟢 Active
5. Ask guest to retry

---

### Problem: Too many duplicate photos

**Solution:**
- Delete duplicates manually from gallery
- Remind guests to upload only best photos
- Consider asking to review before uploading

---

### Problem: Want to create new session mid-event

**Scenario:** Test session was used, now want fresh one for D-day

**Solution:**
1. Mark test session Inactive
2. Create new session
3. Generate new QR code
4. Replace printed QR codes
5. Announce new link
6. Both galleries remain accessible

**Note:** Old session stays viewable at old URL

---

## 💡 Pro Tips

### 1. Print Multiple QR Codes
- Place at entrance, photo booth, tables, bathroom, exit
- Guests more likely to scan if visible everywhere
- Have staff point out QR to guests

### 2. Announce During Event
- MC can remind guests to upload every hour
- Put on presentation slides
- Include in table cards

### 3. Test Everything First
- Create test session 1 week before
- Test with family members on different phones
- Check both iOS and Android
- Verify QR code works

### 4. Monitor During Event
- Check dashboard every 30min
- See if uploads happening
- Adjust QR placement if low activity
- Engage guests personally

### 5. Keep Session Active Post-Wedding
- Guests upload more photos next day
- Better quality after reviewing their albums
- Extended uploads = more memories!
- Week-long window recommended

### 6. Backup Photos Regularly
- Download from R2 every few days
- Cloudflare free tier is generous but backup is safe
- Keep local copy for peace of mind

### 7. Prepare Printed Materials
```
[QR CODE]

📸 Share Your Photos!

1. Scan this code
2. Select photos
3. Upload instantly

alfinamugni.wedding/g/wdng-a7b3c4d5
```

---

## 📊 Example Timeline

### 1 Week Before Wedding

```
Day -7: Create "Test Session"
Day -7: Share with 5 family members  
Day -6: Review test uploads
Day -5: Fix any issues
Day -3: Print QR code designs
Day -2: Create "Wedding Day - Nov 29" session
Day -1: Print final QR codes (3 copies)
Day -1: Test QR codes work
Day -1: Brief venue staff on QR placement
```

### Wedding Day

```
Morning (8am): Give QR codes to venue staff
10am: Place QR at entrance (ceremony)
12pm: Check dashboard (should see first photos!)
2pm: Move QR to reception area
4pm: MC announces gallery upload
6pm: Check dashboard (should see 50+ photos)
10pm: Event ends, keep session active
```

### After Wedding

```
Day +1: Check for new uploads (guests still uploading!)
Day +2: Monitor uploads
Day +3: Deactivate session
Day +7: Download all photos for backup
Day +30: Keep gallery live for viewing
```

---

## 🎉 Success Metrics

**Good session:**
- 100-500 photos uploaded
- 20-50 unique guest devices
- Uploads spread throughout event
- Variety of moments captured
- Happy guests enjoying feature

**Great session:**
- 500+ photos uploaded
- 50+ unique devices
- Continuous uploads for 2-3 days post-wedding
- High-quality photos
- Guests sharing link organically

---

## 🆘 FAQ

### Q: How many sessions can I create?
**A:** Unlimited! Create as many as needed. Common setup:
- 1 test session (testing)
- 1 main session (wedding day)
- Optional: separate ceremony/reception sessions

### Q: Can I delete a session?
**A:** Currently no delete, but you can:
- Mark **Inactive** to stop uploads
- It won't show to guests unless they have the link
- Photos stay accessible

### Q: Do photos show guest names?
**A:** Shows device name (e.g., "iPhone", "Samsung Phone")
- Auto-detected from user agent
- Not personal identifying info
- Privacy-friendly

### Q: Can I approve photos before showing?
**A:** No, photos appear immediately (by design)
- Trust your invited guests
- Delete inappropriate ones manually (rare)
- Faster, more engaging experience

### Q: Storage limits?
**A:** Cloudflare R2 free tier:
- 10GB storage free
- Enough for 5000+ photos
- More than sufficient for wedding

### Q: Can I download all photos at once?
**A:** Use Wrangler CLI:
```bash
wrangler r2 object list WEDDING_PHOTOS
# Then download individual files
```
Or use browser extensions for bulk download

### Q: What if guests upload videos?
**A:** Works perfectly!
- Videos stored in R2
- Displayed in gallery
- 10MB limit per file

### Q: Can guests edit/delete their uploads?
**A:** No, guests can only upload
- Only admin can delete
- Keeps gallery stable
- Prevents accidental deletions

### Q: What happens if session is inactive?
**A:**
- Gallery still viewable
- Upload button hidden
- Shows message: "No longer accepting uploads"
- Can reactivate anytime

### Q: Can I change session title later?
**A:** Yes!
- Click session in list
- Update title/description
- Session ID stays same

---

## 📝 Quick Reference

### Create Session
```
/admin/sessions → + Create New Session
```

### Share Session
```
Option 1: Copy link → Share via WhatsApp/Email
Option 2: Download QR → Print & place at venue
```

### View Gallery
```
/admin/sessions → Click 👁️ View
Or: /g/:session_id directly
```

### Delete Photo
```
View gallery → Find photo → Admin delete
```

### Toggle Active/Inactive
```
/admin/sessions → Click 🔄 Toggle
```

### Check Session Stats
```
/admin/sessions → View dashboard cards
- Total sessions
- Active sessions
- Total photos
```

---

## 📞 Support

**Common Issues:**
1. QR not working → Regenerate QR code
2. Photos not showing → Refresh page
3. Can't upload → Check session is Active
4. Wrong session → Create new one

**For Technical Issues:**
- Check browser console for errors
- Verify network connection
- Try different browser
- Clear cache and retry

---

**That's it! You're ready to collect beautiful wedding memories! 📸❤️**

Happy wedding day! 🎉

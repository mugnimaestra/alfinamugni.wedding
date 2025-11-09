# Master Gallery Migration Plan

**Last Updated**: 2025-11-07  
**Status**: Ready for Implementation  
**Overall Estimated Time**: 6-8 hours

## Overview

This document coordinates the migration of all gallery features from the Qwik City version to SvelteKit. Work is divided into 5 independent specs that can be executed in parallel or sequence.

## Migration Phases

### Phase 1: Quick Win ✅ (15 min)
**SPEC 1: Update GallerySection Content**
- File: `SPEC_1_GallerySection_Content.md`
- Add 3 missing gallery pins to landing page
- No dependencies, can start immediately
- **Status**: Ready

### Phase 2: Public Features 🎯 (2-3 hours)
**SPEC 2: Public Gallery Pages**
- File: `SPEC_2_Public_Gallery_Pages.md`
- Create `/gallery` and `/g/[session_id]` routes
- Build photo upload and display components
- Enable guest photo submissions
- **Priority**: HIGH (core wedding day feature)
- **Status**: Ready

### Phase 3: Admin Core 🔐 (2-3 hours)
**SPEC 3: Admin Sessions Management**
- File: `SPEC_3_Admin_Sessions_Page.md`
- Create `/admin/sessions` page
- QR code generation and management
- Session active/inactive toggle
- **Priority**: HIGH (required to create sessions)
- **Status**: Ready

### Phase 4: Admin Moderation 🛠️ (1-2 hours)
**SPEC 4: Admin Gallery Management**
- File: `SPEC_4_Admin_Gallery_Page.md`
- Create `/admin/gallery` page
- Photo search, filter, bulk delete
- **Priority**: MEDIUM (nice to have)
- **Status**: Ready

## Dependency Graph

```
SPEC 1 (GallerySection)
  └─> No dependencies (standalone)

SPEC 2 (Public Gallery)
  └─> No dependencies (APIs exist)
  └─> Can work independently

SPEC 3 (Admin Sessions)
  └─> No dependencies (APIs exist)
  └─> RECOMMENDED before SPEC 2 (to create test sessions)

SPEC 4 (Admin Gallery)
  └─> SPEC 2 helpful (provides photos to manage)
  └─> Can work independently
```

## Recommended Execution Order

### Option A: Sequential (Recommended for Solo Work)

1. **SPEC 1** (15 min) - Quick win, immediate visual improvement
2. **SPEC 3** (2-3 hours) - Create sessions first
3. **SPEC 2** (2-3 hours) - Test with real sessions from SPEC 3
4. **SPEC 4** (1-2 hours) - Manage photos from SPEC 2

**Total Time**: 6-8 hours

### Option B: Parallel (Recommended for Team/Subagents)

**Track A** (Quick Wins):
- SPEC 1 → Done in 15 min

**Track B** (Public Features):
- SPEC 2 → 2-3 hours

**Track C** (Admin Features):
- SPEC 3 → 2-3 hours
- SPEC 4 → 1-2 hours (after SPEC 3)

**Total Time**: ~3 hours (parallel) + testing

## Shared Resources

### Database Schema (Already Migrated)

**`photos` table:**
```sql
CREATE TABLE photos (
  id INTEGER PRIMARY KEY,
  original_name TEXT,
  description TEXT,
  uploader_name TEXT,
  uploader_device TEXT,
  upload_date TEXT,
  session_id TEXT,
  category TEXT,
  featured INTEGER DEFAULT 0,
  cloudflare_id TEXT UNIQUE,
  r2_key TEXT
);
```

**`gallery_sessions` table:**
```sql
CREATE TABLE gallery_sessions (
  id INTEGER PRIMARY KEY,
  session_id TEXT UNIQUE,
  title TEXT,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  qr_code_url TEXT
);
```

### Shared Components (To Be Created)

**Gallery Components** (`src/lib/components/gallery/`):
- `PhotoGrid.svelte` - Reusable photo grid (SPEC 2)
- `PhotoUpload.svelte` - Upload modal (SPEC 2)
- `PhotoModal.svelte` - Full-size viewer (SPEC 2)
- `PhotoCard.svelte` - Admin photo card (SPEC 4)

**Admin Components** (`src/lib/components/admin/`):
- `SessionCard.svelte` - Session display card (SPEC 3)
- `CreateSessionDialog.svelte` - Create session form (SPEC 3)
- `QRCodeModal.svelte` - QR code display (SPEC 3)

**Utilities** (`src/lib/utils/`):
- `device.ts` - Device detection utilities (SPEC 2)

### API Endpoints (Already Working)

✅ **Public APIs:**
- `GET /api/gallery` - Get all photos
- `POST /api/upload` - Upload photo
- `GET /api/photos/[id]` - Get photo
- `GET /api/gallery/[session_id]` - Get session photos
- `POST /api/gallery/[session_id]/upload` - Upload to session

✅ **Admin APIs:**
- `GET /api/admin/gallery` - Get all photos (admin)
- `GET /api/admin/sessions` - List sessions
- `POST /api/admin/sessions` - Create session
- `PATCH /api/admin/sessions/[id]` - Update session
- `DELETE /api/photos/[id]` - Delete photo

## Testing Strategy

### After SPEC 1
- Navigate to homepage
- Scroll to Gallery section
- Verify 9 pins display (not 6)

### After SPEC 2
- Visit `/gallery`
- Verify photo grid loads
- Test photo upload
- Visit `/g/test-session` (create in admin first)
- Test session-specific upload

### After SPEC 3
- Login to admin
- Navigate to `/admin/sessions`
- Create a new session
- Verify QR code generation
- Copy session link
- Toggle active/inactive
- Visit public session URL

### After SPEC 4
- Navigate to `/admin/gallery`
- Test search functionality
- Select multiple photos
- Test bulk delete
- Test individual delete

## Integration Testing

**End-to-End Flow:**
1. Admin creates session via SPEC 3
2. Admin shares QR code or link
3. Guest visits session URL (SPEC 2)
4. Guest uploads photos
5. Photos appear in main gallery
6. Admin views photos in SPEC 4
7. Admin can delete inappropriate photos

## Success Criteria

### SPEC 1
- [x] 9 gallery pins on landing page
- [x] No layout issues

### SPEC 2
- [x] `/gallery` accessible and functional
- [x] `/g/[session_id]` accessible and functional
- [x] Photo upload works
- [x] Session filtering works
- [x] Mobile responsive

### SPEC 3
- [x] `/admin/sessions` accessible
- [x] Can create sessions
- [x] QR codes generate
- [x] Can toggle active/inactive
- [x] Copy link works

### SPEC 4
- [x] `/admin/gallery` accessible
- [x] Search works
- [x] Bulk delete works
- [x] Individual delete works

## Rollout Plan

### Development
1. Create feature branch: `feat/gallery-migration`
2. Execute specs in recommended order
3. Test each spec before moving to next
4. Commit after each completed spec

### Staging
1. Deploy to preview environment
2. Test with real photos
3. Test QR code scanning with mobile devices
4. Performance testing (large photo uploads)

### Production
1. Create backup of D1 database
2. Deploy to production
3. Monitor error logs
4. Test photo uploads immediately
5. Create first real session for wedding day

## Rollback Plan

If issues occur:
1. Revert to previous deployment
2. Gallery APIs already exist, so admin functions continue working
3. Public routes won't exist in old version (404, not breaking)

## Notes for Subagents

Each spec file is **self-contained** and includes:
- ✅ Objective and scope
- ✅ Reference files from old version
- ✅ API endpoints available
- ✅ Component structure
- ✅ Code examples
- ✅ Verification checklist
- ✅ Success criteria

**To execute a spec:**
1. Read the spec file fully
2. Locate reference files mentioned
3. Create new files as specified
4. Implement features listed
5. Test using verification checklist
6. Mark success criteria when complete

**Common Patterns:**
- Use Svelte 5 runes (`$state`, `$derived`, `$props`)
- Use wedding theme colors (see `tailwind.config.js`)
- Follow existing file structure patterns
- Use existing API endpoints (don't create new ones)
- Add TypeScript types for all props
- Include error handling and loading states

## Questions & Support

**If unclear on any spec:**
- Check reference file in old Qwik version
- Review existing similar components in new SvelteKit version
- Check API endpoint implementations in `src/routes/api/`

**Key Files for Reference:**
- Database: `src/lib/server/database.ts`
- API patterns: `src/routes/api/rsvp/+server.ts`
- Form patterns: `src/routes/rsvp/+page.svelte`
- Admin patterns: `src/routes/admin/+page.svelte`

## Final Checklist

Before considering migration complete:

- [ ] All 4 specs completed
- [ ] All verification checklists passed
- [ ] Integration testing done
- [ ] Mobile testing done
- [ ] QR codes work on real devices
- [ ] Photo uploads work (including large files)
- [ ] Admin session management works
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Build succeeds: `pnpm build`
- [ ] Documentation updated

## Estimated Completion

**Fastest**: 6 hours (experienced dev, parallel work)  
**Typical**: 8 hours (sequential work with testing)  
**Safe**: 10 hours (includes buffer for issues)

---

**Ready to begin!** Each spec is independent and ready for execution. Start with SPEC 1 for a quick win, then tackle SPEC 3 and SPEC 2 for core functionality.

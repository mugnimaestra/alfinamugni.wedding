# Gallery Migration Index

**Last Updated**: 2025-11-07  
**Status**: 📋 Specifications Ready

## Quick Start

This migration is split into **5 independent specifications** to avoid context overload. Each spec can be handled by a separate agent or executed sequentially.

## Specification Files

| Spec | File | Priority | Time | Status |
|------|------|----------|------|--------|
| **SPEC 1** | `SPEC_1_GallerySection_Content.md` | HIGH | 15 min | ⏳ Ready |
| **SPEC 2** | `SPEC_2_Public_Gallery_Pages.md` | HIGH | 2-3 hrs | ⏳ Ready |
| **SPEC 3** | `SPEC_3_Admin_Sessions_Page.md` | HIGH | 2-3 hrs | ⏳ Ready |
| **SPEC 4** | `SPEC_4_Admin_Gallery_Page.md` | MEDIUM | 1-2 hrs | ⏳ Ready |
| **MASTER** | `SPEC_5_Master_Gallery_Migration_Plan.md` | - | - | 📋 Coordination |

## What Each Spec Does

### SPEC 1: GallerySection Content
- **What**: Add 3 missing gallery pins to landing page
- **Why**: Complete the Pinterest-style gallery showcase
- **Files**: 1 file to edit (`GallerySection.svelte`)
- **Dependencies**: None

### SPEC 2: Public Gallery Pages
- **What**: Create `/gallery` and `/g/[session_id]` routes
- **Why**: Allow guests to view and upload photos
- **Files**: 6+ files (pages, components, utils)
- **Dependencies**: None (APIs exist)

### SPEC 3: Admin Sessions Management
- **What**: Create `/admin/sessions` page with QR codes
- **Why**: Admins can create and manage upload sessions
- **Files**: 4+ files (page, components)
- **Dependencies**: None (APIs exist)

### SPEC 4: Admin Gallery Management
- **What**: Create `/admin/gallery` page for moderation
- **Why**: Admins can search, filter, delete photos
- **Files**: 3+ files (page, components)
- **Dependencies**: None (APIs exist)

### SPEC 5: Master Plan
- **What**: Coordination document
- **Why**: Shows how all specs fit together
- **Contains**: Execution order, dependencies, testing strategy

## Recommended Execution Order

**For Sequential Work:**
```
SPEC 1 (15 min) → SPEC 3 (2-3 hrs) → SPEC 2 (2-3 hrs) → SPEC 4 (1-2 hrs)
```

**For Parallel Work:**
```
Track A: SPEC 1 (quick win)
Track B: SPEC 2 (public features)
Track C: SPEC 3 → SPEC 4 (admin features)
```

## How to Use with Subagents

### Method 1: Sequential Execution
```bash
# Agent 1: Quick win
Read and execute SPEC_1_GallerySection_Content.md

# Agent 2: Admin sessions
Read and execute SPEC_3_Admin_Sessions_Page.md

# Agent 3: Public gallery
Read and execute SPEC_2_Public_Gallery_Pages.md

# Agent 4: Admin gallery
Read and execute SPEC_4_Admin_Gallery_Page.md
```

### Method 2: Parallel Execution
```bash
# Start 3 agents simultaneously:
Agent A → SPEC 1
Agent B → SPEC 2
Agent C → SPEC 3

# Then:
Agent C → SPEC 4 (after completing SPEC 3)
```

## Current Migration Status

### ✅ Already Migrated
- All API endpoints (`/api/gallery/*`, `/api/admin/sessions/*`)
- Database schema (D1 tables)
- Landing page components (Hero, Story, Details, etc.)
- Admin dashboard
- RSVP and Wishes features

### ⏳ To Be Migrated (This Project)
- **Gallery landing section content** (3 missing pins)
- **Public gallery pages** (`/gallery`, `/g/[session_id]`)
- **Gallery upload components**
- **Admin sessions page** (`/admin/sessions`)
- **Admin gallery page** (`/admin/gallery`)

## Testing After Each Spec

### After SPEC 1
```bash
pnpm dev
# Navigate to http://localhost:5173
# Scroll to Gallery section
# Verify 9 pins appear (not 6)
```

### After SPEC 2
```bash
# Visit http://localhost:5173/gallery
# Test upload functionality
# Visit http://localhost:5173/g/test-session-id
# Verify session-specific behavior
```

### After SPEC 3
```bash
# Login at http://localhost:5173/admin/login
# Navigate to http://localhost:5173/admin/sessions
# Create a test session
# Verify QR code generation
# Copy link and test in browser
```

### After SPEC 4
```bash
# Navigate to http://localhost:5173/admin/gallery
# Test search functionality
# Test bulk delete
# Test individual delete
```

## File Structure After Migration

```
src/
├── routes/
│   ├── gallery/
│   │   ├── +page.svelte (SPEC 2)
│   │   └── +page.server.ts (SPEC 2)
│   ├── g/
│   │   └── [session_id]/
│   │       ├── +page.svelte (SPEC 2)
│   │       └── +page.server.ts (SPEC 2)
│   └── admin/
│       ├── sessions/
│       │   ├── +page.svelte (SPEC 3)
│       │   └── +page.server.ts (SPEC 3)
│       └── gallery/
│           ├── +page.svelte (SPEC 4)
│           └── +page.server.ts (SPEC 4)
├── lib/
│   ├── components/
│   │   ├── GallerySection.svelte (SPEC 1 - edit)
│   │   ├── gallery/
│   │   │   ├── PhotoGrid.svelte (SPEC 2)
│   │   │   ├── PhotoUpload.svelte (SPEC 2)
│   │   │   └── PhotoModal.svelte (SPEC 2)
│   │   └── admin/
│   │       ├── SessionCard.svelte (SPEC 3)
│   │       ├── CreateSessionDialog.svelte (SPEC 3)
│   │       ├── QRCodeModal.svelte (SPEC 3)
│   │       └── PhotoCard.svelte (SPEC 4)
│   └── utils/
│       └── device.ts (SPEC 2)
```

## Success Criteria (All Specs)

- [ ] Landing page shows 9 gallery pins
- [ ] `/gallery` route works and displays photos
- [ ] `/g/[session_id]` route works for session uploads
- [ ] Guests can upload photos without login
- [ ] Admin can create sessions at `/admin/sessions`
- [ ] QR codes generate and work
- [ ] Admin can toggle sessions active/inactive
- [ ] Admin can manage photos at `/admin/gallery`
- [ ] Search and bulk delete work
- [ ] All features mobile-responsive
- [ ] No console errors
- [ ] Build succeeds: `pnpm build`

## Troubleshooting

**If a spec is unclear:**
- Check the Master Plan (SPEC 5) for context
- Reference existing similar components
- Check API implementations in `src/routes/api/`

**If tests fail:**
- Check browser console for errors
- Verify API endpoints are working
- Check database has required tables
- Ensure authentication works for admin pages

## Getting Help

**Key reference files:**
- Old Qwik version: `/Users/mugnihadi/personal/alfinamugni.wedding/`
- Database schema: `migrations/0001_initial_schema.sql`
- API patterns: `src/routes/api/rsvp/+server.ts`
- Admin patterns: `src/routes/admin/+page.svelte`

## Timeline

**Minimum**: 6 hours (parallel execution by experienced devs)  
**Typical**: 8 hours (sequential execution with testing)  
**Safe**: 10 hours (includes buffer for debugging)

---

**Ready to execute!** Each spec is self-contained with detailed instructions, code examples, and verification steps.

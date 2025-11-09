# SPEC 2: Create Public Gallery Pages

**Priority**: HIGH  
**Estimated Time**: 2-3 hours  
**Dependencies**: None (APIs already exist)

## Objective

Create two public gallery pages for guest photo uploads:
1. `/gallery` - Main gallery page with all photos
2. `/g/[session_id]` - Session-specific gallery (accessed via QR codes)

## Reference Files (Old Qwik Version)

Source: `/Users/mugnihadi/personal/alfinamugni.wedding/src/routes/gallery/index.tsx`  
Source: `/Users/mugnihadi/personal/alfinamugni.wedding/src/routes/g/[session_id]/index.tsx`

## API Endpoints Available

Already migrated and working:
- `GET /api/gallery` - Get all photos
- `POST /api/upload` - Upload photo
- `GET /api/photos/[id]` - Get photo
- `GET /api/gallery/[session_id]` - Get session photos
- `POST /api/gallery/[session_id]/upload` - Upload to session

## Task 1: Create Main Gallery Page

### File: `src/routes/gallery/+page.svelte`

**Features needed:**
- Masonry/Pinterest-style photo grid
- Photo upload button (opens modal)
- Display all photos from database
- Guest name input (optional)
- Device auto-detection (iPhone, Samsung, etc.)
- Caption/description for uploads
- Loading states
- Empty state when no photos

**UI Components:**
- Photo grid (3 columns desktop, 2 tablet, 1 mobile)
- Upload button (floating action button, bottom right)
- Upload modal with:
  - File picker (multiple files)
  - Preview thumbnails
  - Caption input
  - Guest name input (optional)
  - Upload button with progress
  - Cancel button
- Photo modal (click photo to view full size)

### File: `src/routes/gallery/+page.server.ts`

```typescript
import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/database';

export const load: PageServerLoad = async ({ platform }) => {
  if (!platform?.env) {
    return { photos: [] };
  }

  const db = getDatabase(platform.env);
  const photos = await db.getAllPhotos();

  return {
    photos: photos.map(p => ({
      id: p.id?.toString() || '',
      url: `/api/photos/${p.id}`,
      thumbnail: `/api/photos/${p.id}`,
      description: p.description || '',
      uploader_name: p.uploader_name || 'Anonymous',
      upload_date: p.upload_date || new Date().toISOString()
    }))
  };
};
```

## Task 2: Create Session Gallery Page

### File: `src/routes/g/[session_id]/+page.svelte`

**Features needed:**
- Same photo grid as main gallery
- Filter photos by session_id
- Display session title & description
- Check if session is active
- Show "Session inactive" message if closed
- Upload only works if session is active

### File: `src/routes/g/[session_id]/+page.server.ts`

```typescript
import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/database';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform }) => {
  if (!platform?.env) {
    return { session: null, photos: [] };
  }

  const db = getDatabase(platform.env);
  
  // Get session info
  const session = await db.getSessionById(params.session_id);
  
  if (!session) {
    throw error(404, 'Session not found');
  }

  // Get photos for this session
  const photos = await db.getPhotosBySession(params.session_id);

  return {
    session: {
      id: session.session_id,
      title: session.title,
      description: session.description,
      is_active: session.is_active
    },
    photos: photos.map(p => ({
      id: p.id?.toString() || '',
      url: `/api/photos/${p.id}`,
      thumbnail: `/api/photos/${p.id}`,
      description: p.description || '',
      uploader_name: p.uploader_name || 'Anonymous',
      upload_date: p.upload_date || new Date().toISOString()
    }))
  };
};
```

## Shared Components to Create

### File: `src/lib/components/gallery/PhotoGrid.svelte`

Reusable photo grid component:
- Props: `photos: Photo[]`
- Masonry layout using CSS columns
- Click to open modal
- Lazy loading
- Responsive (3/2/1 columns)

### File: `src/lib/components/gallery/PhotoUpload.svelte`

Reusable upload component:
- Props: `sessionId?: string, isActive: boolean`
- File picker (accept image/*)
- Multiple file support
- Preview grid
- Caption input
- Guest name input
- Upload progress bar
- Success/error messages
- Uses appropriate endpoint (with or without sessionId)

### File: `src/lib/components/gallery/PhotoModal.svelte`

Full-size photo viewer:
- Props: `photo: Photo, isOpen: boolean, onClose: () => void`
- Overlay with backdrop
- Close on click outside or ESC key
- Show caption and uploader name
- Download button (optional)

## Device Auto-Detection Utility

### File: `src/lib/utils/device.ts`

```typescript
export function getDeviceInfo(): string {
  if (typeof navigator === 'undefined') return 'Guest Device';

  const ua = navigator.userAgent;

  // iOS devices
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';

  // Android devices
  if (/Android/i.test(ua)) {
    if (/Samsung/i.test(ua)) return 'Samsung Phone';
    if (/Xiaomi|Redmi/i.test(ua)) return 'Xiaomi Phone';
    if (/OPPO/i.test(ua)) return 'OPPO Phone';
    if (/Vivo/i.test(ua)) return 'Vivo Phone';
    return 'Android Phone';
  }

  // Desktop
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Linux/i.test(ua)) return 'Linux PC';

  return 'Guest Device';
}

export function generateTitle(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
}
```

## Upload Flow

1. User clicks "Upload Photo" button
2. Modal opens with file picker
3. User selects 1+ photos
4. Previews show below file picker
5. User enters optional caption and name
6. Click "Upload" → POST to `/api/upload` or `/api/gallery/[session_id]/upload`
7. Progress bar shows upload status
8. On success: close modal, refresh photo grid
9. On error: show error message, keep modal open

## Styling

Use existing wedding theme colors:
- `bg-wedding-white`, `bg-wedding-cream`
- `text-wedding-navy`, `text-wedding-text-muted`
- `wedding-button`, `wedding-card` classes
- Match styling from other pages (RSVP, Wishes)

## Verification Checklist

- [ ] `/gallery` route exists and loads
- [ ] Photos display in masonry grid
- [ ] Upload button opens modal
- [ ] File picker allows multiple files
- [ ] Previews show selected files
- [ ] Upload submits to correct API
- [ ] Progress indicator works
- [ ] Success message shows and grid refreshes
- [ ] `/g/[session_id]` route works
- [ ] Session title/description displays
- [ ] Inactive sessions show warning
- [ ] Upload disabled when inactive
- [ ] Photos filtered by session
- [ ] Mobile responsive (test on phone simulator)

## Success Criteria

- [x] Both routes exist and are accessible
- [x] Photo grids display correctly
- [x] Upload functionality works
- [x] Session filtering works
- [x] Active/inactive state respected
- [x] Mobile-friendly design
- [x] No console errors
- [x] Matches wedding theme styling

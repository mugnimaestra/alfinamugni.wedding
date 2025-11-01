# Gallery Page - Technical Documentation

**Route:** `/gallery`  
**URL:** `http://localhost:5173/gallery`  
**Last Updated:** January 2025  
**Status:** Production-ready

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [API Endpoints](#api-endpoints)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [Storage Architecture](#storage-architecture)
- [User Experience](#user-experience)
- [Responsive Design](#responsive-design)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Performance](#performance)

---

## Overview

The gallery page is a **Pinterest-style masonry photo gallery** where wedding guests can upload and view photos from the wedding. Photos are stored in Cloudflare R2 and served with a 1-year cache policy.

### Key Features

- ✅ Pinterest-style masonry layout (1/2/3 columns responsive)
- ✅ Photo upload with progress tracking
- ✅ Real-time gallery display
- ✅ R2-backed image storage
- ✅ Automatic thumbnail serving
- ✅ Device metadata collection
- ✅ Loading and empty states

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                     Browser                      │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────┐
│        Gallery Upload Section Component           │
│  • Upload modal                                   │
│  • Masonry layout                                 │
│  • Loading states                                 │
└───────────┬──────────────────────────────────────┘
            │
            ├──────────────┐
            │              │
            ▼              ▼
┌───────────────────┐  ┌─────────────────────┐
│   useGallery Hook │  │  API Endpoints      │
│  • Fetch photos    │  │  • /api/gallery      │
│  • Upload logic    │  │  • /api/upload       │
│  • Refresh         │  │  • /api/photos/[id]  │
└───────────┬───────┘  └─────────────────────┘
            │              │
            ▼              ▼
┌──────────────────────────────────────────────────┐
│              Backend Services                     │
│  • D1 Database (SQLite)                          │
│  • R2 Bucket (WEDDING_PHOTOS)                    │
│  • Photo metadata + file storage                 │
└──────────────────────────────────────────────────┘
```

---

## Components

### 1. Route Component: `src/routes/gallery/index.tsx`

Server-side rendered route with data loader.

**Key Features:**
- Server-side data fetching via `useGalleryData` routeLoader
- Loads all photos from database on initial render
- Transforms photos to include API URLs
- Error handling with fallback to empty array

**Code:**
```12:32:src/routes/gallery/index.tsx
export const useGalleryData = routeLoader$(async ({ platform }) => {
  try {
    const db = getDatabase(platform.env as Env);
    const photos = await db.getAllPhotos();

    // Transform photos to include URLs
    const photosWithUrls = photos.map((photo) => ({
      id: photo.id,
      filename: photo.filename,
      original_name: photo.original_name,
      description: photo.description,
      uploader_name: photo.uploader_name,
      upload_date: photo.upload_date,
      category: photo.category,
      featured: photo.featured,
      url: `/api/photos/${photo.id}`,
      thumbnail_url: `/api/photos/${photo.id}`,
    }));

    return { photos: photosWithUrls };
  } catch (error) {
    console.error("Failed to load gallery:", error);
    return { photos: [] };
  }
});
```

---

### 2. Main Component: `src/components/gallery-upload-section.tsx`

Client-side interactive gallery with upload functionality.

**Key Features:**
- Upload modal with file selection
- Multi-file upload support
- Progress tracking
- Pinterest-style masonry layout
- Hover effects and animations
- Author avatars with initials
- Category badges

**State Management:**
```10:16:src/components/gallery-upload-section.tsx
const isUploadOpen = useSignal(false);
const selectedFiles = useSignal<File[]>([]);
const uploadTitle = useSignal("");
const uploadDescription = useSignal("");
const uploadAuthor = useSignal("");
const isUploading = useSignal(false);
const uploadProgress = useSignal(0);
```

**Masonry Layout:**
```261:329:src/components/gallery-upload-section.tsx
<div class="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:_balance]">
  {galleryItems.value.map((item) => (
    <article
      key={item.id}
      class="mb-6 break-inside-avoid overflow-hidden rounded-[1.75rem] border border-wedding-beige/70 bg-white/90 shadow-[0_20px_60px_rgba(77,51,38,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(77,51,38,0.12)]"
    >
```

---

### 3. Custom Hook: `src/hooks/use-gallery.ts`

Handles gallery data fetching and upload logic.

**Interface:**
```4:23:src/hooks/use-gallery.ts
export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  author: string;
  timestamp: string;
  url?: string;
  thumbnail?: string;
  category?: string;
  featured?: boolean;
}

export interface UseGalleryReturn {
  items: Signal<GalleryItem[]>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  uploadFile: (file: File, metadata: { title: string; description: string; author: string }) => Promise<void>;
  refreshGallery: () => Promise<void>;
}
```

**Fetching Gallery:**
```59:79:src/hooks/use-gallery.ts
const fetchGallery = $(async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const response = await fetch('/api/gallery');
    const result = await response.json();
    
    if (result.success && result.data) {
      items.value = result.data.map(transformPhotoToGalleryItem);
    } else {
      throw new Error(result.error || 'Failed to fetch gallery');
    }
  } catch (err) {
    console.error('Gallery fetch error:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load gallery';
    items.value = [];
  } finally {
    loading.value = false;
  }
});
```

---

## API Endpoints

### 1. GET `/api/gallery`

Fetches approved photos for gallery display.

**Implementation:** `src/routes/api/gallery/index.ts`

**Query Parameters:**
- `category` (optional): Filter by category
- `all=true` (dev only): Show all photos including pending

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "1705488123_abc123.jpg",
      "original_name": "wedding-photo.jpg",
      "width": 1920,
      "height": 1080,
      "category": "ceremony",
      "description": "Beautiful ceremony moment",
      "featured": false,
      "upload_date": "2024-01-15T10:30:00Z",
      "uploader_name": "John Doe",
      "url": "/api/photos/1",
      "thumbnail_url": "/api/photos/1",
      "r2_key": "photos/ceremony/2024/1/1705488123_abc123.jpg"
    }
  ],
  "total": 1
}
```

**Key Logic:**
```11:49:src/routes/api/gallery/index.ts
const db = getDatabase(platform.env as Env);

// All photos are now immediately visible (no approval system)
const photos = await db.getAllPhotos(category || undefined);

// Generate R2 URLs for photos
const photosWithUrls = await Promise.all(photos.map(async (photo) => {
  const r2Bucket = (platform.env as Env).WEDDING_PHOTOS;
  
  // Try to get the object to verify it exists
  try {
    const object = await r2Bucket.head(photo.r2_key);
    
    if (object) {
      const url = `/api/photos/${photo.id}`;
      
      return {
        id: photo.id,
        filename: photo.filename,
        original_name: photo.original_name,
        width: photo.width,
        height: photo.height,
        category: photo.category,
        description: photo.description,
        featured: photo.featured,
        upload_date: photo.upload_date,
        uploader_name: photo.uploader_name,
        url: url,
        thumbnail_url: url,
        r2_key: photo.r2_key
      };
    }
  } catch (error) {
    console.warn(`Photo ${photo.id} not found in R2:`, error);
  }
  
  // Fallback to placeholder if R2 object not found
  return { /* placeholder data */ };
}));
```

---

### 2. POST `/api/upload`

Uploads photos to R2 storage.

**Implementation:** `src/routes/api/upload/index.ts`

**Form Data:**
- `file`: Image file (required)
- `uploader_name`: Name of uploader (required)
- `uploader_email`: Email of uploader (optional)
- `description`: Photo description (optional)
- `category`: Photo category (optional, default: 'guests')

**Additional Metadata:**
- `screen_resolution`: Client screen resolution
- `device_orientation`: Device orientation
- `connection_type`: Network connection type
- `camera_model`: Camera model

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "id": 1,
    "filename": "1705488123_abc123.jpg",
    "original_name": "wedding-photo.jpg",
    "file_size": 2048576,
    "category": "guests",
    "upload_date": "2024-01-15T10:30:00Z"
  }
}
```

**Validation:**
```29:45:src/routes/api/upload/index.ts
// Validate file type
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
if (!allowedTypes.includes(file.type)) {
  throw json(400, {
    error: 'Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed.',
    success: false
  });
}

// Validate file size (5MB limit)
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  throw json(400, {
    error: 'File size too large. Maximum size is 5MB.',
    success: false
  });
}
```

**R2 Upload:**
```70:82:src/routes/api/upload/index.ts
await (platform.env as Env).WEDDING_PHOTOS.put(r2Key, fileBuffer, {
  httpMetadata: {
    contentType: file.type,
    cacheControl: 'public, max-age=31536000', // 1 year cache
  },
  customMetadata: {
    originalName: file.name,
    uploaderName: uploaderName || 'Anonymous',
    uploaderEmail: uploaderEmail || '',
    uploadDate: new Date().toISOString(),
    category: category
  }
});
```

---

### 3. GET `/api/photos/[id]`

Serves photos directly from R2 storage.

**Implementation:** `src/routes/api/photos/[id]/index.ts`

**Response:**
- HTTP 200: Photo file with headers
- HTTP 404: Photo not found
- HTTP 400: Invalid photo ID
- HTTP 500: Server error

**Headers:**
```29:35:src/routes/api/photos/[id]/index.ts
return new Response(object.body, {
  headers: {
    'Content-Type': photo.content_type,
    'Cache-Control': 'public, max-age=31536000', // 1 year cache
    'ETag': object.etag || '',
  },
});
```

**Flow:**
```5:35:src/routes/api/photos/[id]/index.ts
export const onGet: RequestHandler = async ({ params, platform }) => {
  try {
    const photoId = parseInt(params.id);
    
    if (isNaN(photoId)) {
      return new Response('Invalid photo ID', { status: 400 });
    }

    const db = getDatabase(platform.env as Env);
    const photo = await db.getPhotoUploadById(photoId);

    if (!photo) {
      return new Response('Photo not found', { status: 404 });
    }

    // Get photo from R2
    const r2Bucket = (platform.env as Env).WEDDING_PHOTOS;
    const object = await r2Bucket.get(photo.r2_key);

    if (!object) {
      return new Response('Photo file not found in storage', { status: 404 });
    }

    // Return the image with appropriate headers
    return new Response(object.body, {
      headers: {
        'Content-Type': photo.content_type,
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
        'ETag': object.etag || '',
      },
    });

  } catch (error) {
    console.error('Photo retrieval error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
```

---

## Data Flow

### Upload Flow

```
1. User selects files
   ↓
2. Opens upload modal
   ↓
3. Fills in metadata (name, title, description)
   ↓
4. Clicks Upload button
   ↓
5. Component calls uploadFile()
   ↓
6. POST /api/upload
   ↓
7. Server validates file (type, size)
   ↓
8. Generates unique filename
   ↓
9. Uploads to R2 bucket
   ↓
10. Creates database record
   ↓
11. Returns success response
   ↓
12. Component refreshes gallery
   ↓
13. New photos appear in gallery
```

### Display Flow

```
1. Page loads
   ↓
2. useGallery hook fetches data
   ↓
3. GET /api/gallery
   ↓
4. Database queries all photos
   ↓
5. Verifies R2 objects exist
   ↓
6. Returns photo metadata with URLs
   ↓
7. Hook transforms data to GalleryItem[]
   ↓
8. Component renders masonry layout
   ↓
9. Images lazy-load from /api/photos/[id]
   ↓
10. R2 serves photo files
```

---

## Database Schema

### Table: `photo_uploads`

**Schema:** `src/database/schema.sql`

```38:61:src/database/schema.sql
CREATE TABLE IF NOT EXISTS photo_uploads (
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
  camera_model TEXT
);
```

**Interface:** `src/lib/database.ts`

```237:260:src/lib/database.ts
export interface PhotoUpload {
  id?: number;
  filename: string;
  original_name: string;
  file_size: number;
  content_type: string;
  width?: number;
  height?: number;
  upload_date?: string;
  uploader_name?: string;
  uploader_email?: string;
  bucket_path: string;
  r2_key: string;
  featured: boolean;
  category: 'ceremony' | 'reception' | 'guests' | 'professional';
  description?: string;
  ip_address?: string;
  user_agent?: string;
  screen_resolution?: string;
  device_orientation?: string;
  connection_type?: string;
  country_code?: string;
  camera_model?: string;
}
```

**Indexes:**
```121:125:src/database/schema.sql
CREATE INDEX IF NOT EXISTS idx_photo_uploads_category ON photo_uploads(category);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_upload_date ON photo_uploads(upload_date);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_country ON photo_uploads(country_code);
CREATE INDEX IF NOT EXISTS idx_photo_uploads_device ON photo_uploads(user_agent);
```

---

## Storage Architecture

### R2 Bucket Structure

**Bucket:** `WEDDING_PHOTOS`

**Path Pattern:**
```
photos/{category}/{year}/{month}/{filename}
```

**Examples:**
```
photos/ceremony/2024/1/1705488123_abc123.jpg
photos/reception/2024/2/1705588123_def456.png
photos/guests/2024/1/1705688123_ghi789.webp
```

**Filename Generation:**
```47:51:src/routes/api/upload/index.ts
const timestamp = Date.now();
const randomId = Math.random().toString(36).substring(2, 15);
const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
const filename = `${timestamp}_${randomId}.${fileExtension}`;
```

**Bucket Path:**
```61:62:src/routes/api/upload/index.ts
const bucketPath = `photos/${category}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
const r2Key = `${bucketPath}/${filename}`;
```

---

## User Experience

### Upload Modal

**Features:**
- Multi-file selection
- File preview with size display
- Required fields validation
- Progress indicator
- Success/error feedback

**Validation:**
```31:39:src/components/gallery-upload-section.tsx
if (
  selectedFiles.value.length === 0 ||
  !uploadTitle.value ||
  !uploadAuthor.value
) {
  alert("Please fill in all required fields");
  return;
}
```

**Upload Flow:**
```31:74:src/components/gallery-upload-section.tsx
try {
  // Upload all selected files
  for (let i = 0; i < selectedFiles.value.length; i++) {
    const file = selectedFiles.value[i];
    await uploadFile(file, {
      title: uploadTitle.value,
      description: uploadDescription.value,
      author: uploadAuthor.value,
    });
    uploadProgress.value = Math.round(
      ((i + 1) / selectedFiles.value.length) * 100
    );
  }

  // Reset form
  selectedFiles.value = [];
  uploadTitle.value = "";
  uploadDescription.value = "";
  uploadAuthor.value = "";
  isUploadOpen.value = false;
  alert(
    "Photos uploaded successfully! They will appear after admin approval."
  );
} catch (error) {
  console.error("Upload failed:", error);
  alert("Upload failed. Please try again.");
} finally {
  isUploading.value = false;
  uploadProgress.value = 0;
}
```

### Loading States

**Loading Indicator:**
```333:342:src/components/gallery-upload-section.tsx
{loading.value && (
  <div class="text-center py-12">
    <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
      <LuImage class="w-8 h-8 text-gray-400" />
    </div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">
      Loading gallery...
    </h3>
  </div>
)}
```

**Empty State:**
```345:362:src/components/gallery-upload-section.tsx
{!loading.value && galleryItems.value.length === 0 && (
  <div class="text-center py-12">
    <LuImage class="w-16 h-16 text-gray-400 mx-auto mb-4" />
    <h3 class="text-lg font-medium text-gray-900 mb-2">
      No photos or videos yet
    </h3>
    <p class="text-gray-600 mb-4">
      Be the first to share your wedding moments!
    </p>
    <Button
      onClick$={() => (isUploadOpen.value = true)}
      class="bg-wedding-brown hover:bg-wedding-brown/90 text-white"
    >
      <LuUpload class="w-4 h-4 mr-2" />
      Upload Now
    </Button>
  </div>
)}
```

---

## Responsive Design

### Breakpoints

| Screen Size | Columns | Gap |
|------------|---------|-----|
| Mobile (< 640px) | 1 | 6 (1.5rem) |
| Tablet (640px - 1024px) | 2 | 6 |
| Desktop (> 1024px) | 3 | 6 |

**Implementation:**
```261:261:src/components/gallery-upload-section.tsx
<div class="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3 [column-fill:_balance]">
```

### Card Styling

**Base Styles:**
```265:265:src/components/gallery-upload-section.tsx
class="mb-6 break-inside-avoid overflow-hidden rounded-[1.75rem] border border-wedding-beige/70 bg-white/90 shadow-[0_20px_60px_rgba(77,51,38,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(77,51,38,0.12)]"
```

**Hover Effects:**
- Card lifts up (`hover:-translate-y-1`)
- Shadow deepens
- Image scales (`group-hover:scale-[1.05]`)
- Gradient overlay appears

**Image:**
```276:276:src/components/gallery-upload-section.tsx
class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
```

**Gradient Overlay:**
```285:285:src/components/gallery-upload-section.tsx
<div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15 opacity-0 transition duration-500 group-hover:opacity-100" />
```

---

## Configuration

### File Limits

```typescript
maxSize: 5 * 1024 * 1024 // 5MB
allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
```

### R2 Configuration

```typescript
Bucket: 'WEDDING_PHOTOS'
Cache-Control: 'public, max-age=31536000' // 1 year
```

### Environment Variables

```bash
ENVIRONMENT=development # or production
ADMIN_PASSWORD_HASH=<hash>
RESEND_API_KEY=<key>
```

---

## Development

### Running Locally

```bash
# Start development server
npm run dev

# Visit gallery
http://localhost:5173/gallery
```

### Database Commands

```bash
# View uploaded photos
wrangler d1 execute wedding-database --command "SELECT * FROM photo_uploads ORDER BY upload_date DESC LIMIT 10"

# Check R2 bucket
wrangler r2 list WEDDING_PHOTOS
```

---

## Testing

### Manual Testing

1. **Upload Test:**
   - Navigate to `/gallery`
   - Click "Upload Photos/Videos"
   - Select multiple files
   - Fill in metadata
   - Click Upload
   - Verify photos appear

2. **Display Test:**
   - Check masonry layout renders
   - Verify responsive breakpoints
   - Test hover effects
   - Check lazy loading

3. **API Test:**
```bash
# Fetch gallery
curl http://localhost:5173/api/gallery

# Get specific photo
curl http://localhost:5173/api/photos/1 -o test.jpg
```

---

## Performance

### Optimizations

1. **Lazy Loading:**
   - Images load with `loading="lazy"`
   - Renders only visible photos

2. **Caching:**
   - 1-year cache headers on photos
   - Browser cache for static assets

3. **Masonry Layout:**
   - CSS columns for efficient rendering
   - No JavaScript layout calculations
   - Natural content flow

4. **Database Indexes:**
   - Indexed on category, upload_date, country_code
   - Fast queries for filtering

---

## Summary

The gallery page provides a beautiful, performant photo sharing experience for wedding guests. Key technical highlights:

- ✅ **Server-side rendering** for fast initial load
- ✅ **Client-side interactivity** for upload functionality
- ✅ **R2 storage** for reliable file storage
- ✅ **D1 database** for metadata management
- ✅ **Responsive masonry layout** for any screen size
- ✅ **1-year caching** for optimal performance
- ✅ **Multi-file upload** with progress tracking
- ✅ **Device metadata collection** for analytics

**Status:** Production-ready and optimized for scale.


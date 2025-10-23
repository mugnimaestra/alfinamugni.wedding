# Gallery Feature Testing Guide

## Overview

The wedding gallery feature allows guests to upload photos from the wedding and view them in a beautiful Pinterest-style masonry layout.

## Architecture

### Data Flow

1. **Upload**: Guest uploads photo via `/gallery` page
2. **Storage**: Photo saved to Cloudflare R2 bucket
3. **Database**: Metadata saved to D1 database (`photo_uploads` table)
4. **Approval**: Admin approves photo in admin panel
5. **Display**: Approved photos appear in public gallery

### Components

- **Gallery Upload Section** (`src/components/gallery-upload-section.tsx`)
  - Pinterest-style masonry layout
  - Upload modal with form
  - Real-time gallery display

- **Gallery API** (`src/routes/api/gallery/index.ts`)
  - Fetches approved photos from database
  - Generates R2 URLs for images

- **Photo Serving API** (`src/routes/api/photos/[id]/index.ts`)
  - Serves photos directly from R2 storage
  - Includes proper caching headers

- **Upload API** (`src/routes/api/upload/index.ts`)
  - Handles file uploads to R2
  - Validates file type and size
  - Creates database records

## Testing Steps

### 1. Local Development Setup

```bash
# Start development server
npm run dev

# Or use wrangler for full API testing
npm run preview
```

### 2. Test Photo Upload

1. Navigate to `http://localhost:5174/gallery`
2. Click "Upload Photos/Videos" button
3. Fill in the form:
   - Select one or more image files (JPEG, PNG, WebP)
   - Enter your name
   - Enter a title
   - Add optional description
4. Click "Upload"
5. Photos should upload successfully

### 3. Verify Database Entry

In development, photos are auto-approved. Check the database:

```bash
# View uploaded photos
wrangler d1 execute wedding-database --command "SELECT * FROM photo_uploads ORDER BY upload_date DESC LIMIT 5"
```

### 4. Test Gallery Display

1. Refresh the `/gallery` page
2. Uploaded photos should appear in Pinterest-style masonry layout
3. Verify:
   - Images load correctly
   - Hover effects work
   - Author names display
   - Dates format correctly
   - Responsive layout works on mobile

### 5. Test Admin Approval (Production)

In production, photos require admin approval:

1. Upload a photo as a guest
2. Log in to admin panel at `/admin`
3. Navigate to Gallery management
4. Find pending photo
5. Click "Approve"
6. Photo should now appear in public gallery

## Features

### Pinterest-Style Layout

- **Masonry Columns**: 1 column on mobile, 2 on tablet, 3 on desktop
- **Break-inside-avoid**: Prevents cards from breaking across columns
- **Responsive**: Adapts to screen size automatically

### Card Styling

- **Rounded corners**: 1.75rem border radius
- **Soft shadows**: Subtle elevation with hover effect
- **Hover animations**: Scale image and show gradient overlay
- **Category badges**: Display photo category
- **Author avatars**: Initials in gradient circle
- **Status badges**: Show pending/approved status

### Upload Features

- **Multi-file upload**: Select multiple photos at once
- **File validation**: Type and size checking
- **Progress indicator**: Visual upload progress
- **Preview**: Show selected files before upload
- **Auto-refresh**: Gallery updates after upload

## Configuration

### File Limits

- **Max file size**: 5MB per file
- **Allowed types**: JPEG, JPG, PNG, WebP, HEIC
- **Multiple uploads**: Yes

### Auto-Approval

- **Development**: Photos auto-approved
- **Production**: Requires admin approval

### R2 Storage

- **Bucket**: `WEDDING_PHOTOS`
- **Path structure**: `photos/{category}/{year}/{month}/{filename}`
- **Cache**: 1 year cache-control header

## Troubleshooting

### Photos Not Displaying

1. Check R2 bucket exists and has correct permissions
2. Verify database has photo records
3. Check browser console for errors
4. Verify API endpoints are accessible

### Upload Fails

1. Check file size (must be < 5MB)
2. Verify file type is supported
3. Check R2 bucket write permissions
4. Review server logs for errors

### Layout Issues

1. Clear browser cache
2. Check Tailwind CSS is loading
3. Verify responsive breakpoints
4. Test in different browsers

## API Endpoints

### GET /api/gallery

Fetch approved photos for public display.

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
      "filename": "photo.jpg",
      "original_name": "wedding-moment.jpg",
      "description": "Beautiful ceremony",
      "uploader_name": "John Doe",
      "upload_date": "2025-01-15T10:30:00Z",
      "category": "ceremony",
      "url": "/api/photos/1",
      "thumbnail_url": "/api/photos/1"
    }
  ],
  "total": 1
}
```

### POST /api/upload

Upload a new photo.

**Form Data:**
- `file`: Image file
- `uploader_name`: Name of uploader
- `description`: Photo description
- `category`: Photo category (optional)

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "id": 1,
    "filename": "1234567890_abc123.jpg",
    "approved": true
  }
}
```

### GET /api/photos/[id]

Serve photo from R2 storage.

**Response:** Image file with appropriate content-type and caching headers

## Future Enhancements

- [ ] Image thumbnail generation
- [ ] Video upload support
- [ ] Lightbox for full-size viewing
- [ ] Like/favorite functionality
- [ ] Download original photo
- [ ] Share to social media
- [ ] Filter by category
- [ ] Search photos
- [ ] Infinite scroll pagination


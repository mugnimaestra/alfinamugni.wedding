# Gallery Feature - Quick Reference

## 🎯 What Was Built

A Pinterest-style photo gallery where wedding guests can upload photos that appear in a beautiful masonry layout after admin approval.

## 📁 Key Files

### API Routes
- `src/routes/api/gallery/index.ts` - Fetch approved photos
- `src/routes/api/upload/index.ts` - Upload photos (existing)
- `src/routes/api/photos/[id]/index.ts` - Serve photos from R2 (NEW)

### Components
- `src/components/gallery-upload-section.tsx` - Main gallery component with Pinterest layout
- `src/components/gallery-section.tsx` - Landing page gallery (static, unchanged)

### Hooks & Services
- `src/hooks/use-gallery.ts` - Gallery data fetching and upload logic

### Routes
- `src/routes/gallery/index.tsx` - Gallery page with server-side loading

## 🔑 Key Concepts

### Pinterest Masonry Layout
```tsx
<div class="columns-1 sm:columns-2 lg:columns-3 [column-fill:_balance]">
  <article class="break-inside-avoid">
    {/* Card content */}
  </article>
</div>
```

### Data Flow
```
Upload → R2 + D1 → Admin Approval → Gallery Display
```

### Photo URLs
```
/api/photos/[id] → Serves from R2 with caching
```

## 🎨 Styling Classes

### Masonry Container
- `columns-1` - 1 column on mobile
- `sm:columns-2` - 2 columns on tablet
- `lg:columns-3` - 3 columns on desktop
- `[column-fill:_balance]` - Balance column heights

### Card
- `break-inside-avoid` - Prevent card splitting
- `rounded-[1.75rem]` - Large rounded corners
- `shadow-[0_20px_60px_rgba(77,51,38,0.08)]` - Soft shadow
- `hover:-translate-y-1` - Lift on hover
- `hover:shadow-[0_28px_80px_rgba(77,51,38,0.12)]` - Deeper shadow on hover

### Image
- `group-hover:scale-[1.05]` - Zoom on hover
- `transition duration-500` - Smooth animation

## 🔧 Configuration

### Upload Limits
```typescript
maxSize: 5 * 1024 * 1024 // 5MB
allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
```

### Auto-Approval
```typescript
approved: env.ENVIRONMENT === 'development' // Auto-approve in dev
```

### R2 Path
```typescript
`photos/${category}/${year}/${month}/${filename}`
```

## 🧪 Testing

### Quick Test
```bash
# Start dev server
npm run dev

# Visit gallery
open http://localhost:5174/gallery

# Upload a photo
# Should appear immediately (dev auto-approves)
```

### API Test
```bash
# Fetch gallery
curl http://localhost:5174/api/gallery

# Get specific photo
curl http://localhost:5174/api/photos/1 -o test.jpg
```

## 📊 Database Schema

```sql
CREATE TABLE photo_uploads (
  id INTEGER PRIMARY KEY,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  uploader_name TEXT,
  bucket_path TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  category TEXT,
  description TEXT,
  upload_date TEXT DEFAULT (datetime('now'))
);
```

## 🎯 Common Tasks

### Add New Photo Category
```typescript
// In upload API
category: 'new-category' as 'ceremony' | 'reception' | 'guests' | 'professional'
```

### Change Column Count
```tsx
// In gallery-upload-section.tsx
<div class="columns-1 sm:columns-2 lg:columns-4"> {/* Changed to 4 */}
```

### Adjust Card Spacing
```tsx
<div class="columns-1 gap-8 sm:columns-2 lg:columns-3"> {/* Changed gap */}
```

### Modify Hover Effect
```tsx
class="hover:scale-[1.1]" // Stronger zoom
class="hover:-translate-y-2" // Higher lift
```

## 🐛 Troubleshooting

### Photos Not Showing
1. Check database: `wrangler d1 execute wedding-database --command "SELECT * FROM photo_uploads"`
2. Verify R2 bucket exists
3. Check browser console for errors
4. Verify API endpoint returns data

### Upload Fails
1. Check file size (< 5MB)
2. Verify file type (JPEG, PNG, WebP, HEIC)
3. Check R2 bucket permissions
4. Review server logs

### Layout Breaks
1. Clear browser cache
2. Check Tailwind CSS loaded
3. Verify column classes applied
4. Test in different browsers

## 📚 Resources

- [CSS Columns Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Columns)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Qwik City Routing](https://qwik.dev/docs/routing/)
- [Tailwind CSS Columns](https://tailwindcss.com/docs/columns)

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] R2 bucket configured
- [ ] D1 database migrated
- [ ] Environment variables set
- [ ] Admin approval workflow tested
- [ ] Performance tested with many photos

### Environment Variables
```bash
# In wrangler.toml or Cloudflare dashboard
ENVIRONMENT=production
# ADMIN_PASSWORD_HASH set as secret
```

## 💡 Tips

1. **Performance**: Images lazy load automatically
2. **Caching**: Photos cached for 1 year
3. **Responsive**: Test on mobile, tablet, desktop
4. **Approval**: Dev auto-approves, prod requires admin
5. **Storage**: Monitor R2 usage in Cloudflare dashboard

## 🎨 Customization

### Change Wedding Colors
```css
/* In global.css or tailwind.config.js */
--wedding-sage: /* your color */
--wedding-cream: /* your color */
--wedding-beige: /* your color */
```

### Adjust Card Padding
```tsx
<div class="space-y-4 px-8 py-8"> {/* Increased padding */}
```

### Modify Shadow Intensity
```tsx
class="shadow-[0_30px_80px_rgba(77,51,38,0.12)]" // Stronger shadow
```

## 📞 Support

For issues or questions:
1. Check `docs/GALLERY-TESTING.md` for detailed testing guide
2. Review `GALLERY-IMPLEMENTATION-SUMMARY.md` for architecture
3. See `docs/GALLERY-BEFORE-AFTER.md` for visual comparison


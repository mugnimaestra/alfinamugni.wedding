# SPEC 4: Create Admin Gallery Management Page

**Priority**: MEDIUM  
**Estimated Time**: 1-2 hours  
**Dependencies**: None (APIs already exist)

## Objective

Create admin page for managing uploaded photos with search, filter, and bulk delete.

## Reference File (Old Qwik Version)

Source: `/Users/mugnihadi/personal/alfinamugni.wedding/src/routes/admin/gallery/index.tsx`

## API Endpoints Available

Already migrated and working:
- `GET /api/admin/gallery` - Get all photos
- `DELETE /api/photos/[id]` - Delete photo

## File to Create

### `src/routes/admin/gallery/+page.svelte`

**Page Layout:**

```
┌─────────────────────────────────────────────┐
│ Gallery Management        Total: 42  [🗑️ 3] │
│ Manage wedding photo submissions            │
├─────────────────────────────────────────────┤
│ 🔍 Search by title, author, description...  │
├─────────────────────────────────────────────┤
│                                             │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│ │☑ Img│ │☐ Img│ │☐ Img│ │☑ Img│          │
│ │     │ │     │ │     │ │     │          │
│ │Title│ │Title│ │Title│ │Title│          │
│ │Name │ │Name │ │Name │ │Name │          │
│ │Date │ │Date │ │Date │ │Date │          │
│ │[🗑️] │ │[🗑️] │ │[🗑️] │ │[🗑️] │          │
│ └─────┘ └─────┘ └─────┘ └─────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

## Features Required

### 1. Photo Grid Display

**Photo Card:**
- Checkbox (top-left corner)
- Thumbnail image (square aspect ratio)
- Title/description
- Uploader name
- Upload date
- Individual delete button

**Grid Layout:**
- 4 columns on desktop
- 3 columns on tablet
- 2 columns on mobile
- Consistent card sizes

### 2. Search & Filter Bar

**Search Input:**
- Real-time search (debounced)
- Search across: title, description, uploader name
- Clear button when text entered

**Statistics Badge:**
- Show total photo count
- Update when filtered

### 3. Bulk Selection & Delete

**Selection Features:**
- Checkbox on each photo card
- Select/deselect individual photos
- Track selected count

**Bulk Delete:**
- Show "Delete Selected (N)" button when items selected
- Confirmation dialog: "Delete N photos?"
- Delete all selected photos in parallel
- Show progress/results
- Refresh grid after deletion

### 4. Individual Photo Delete

**Delete Flow:**
1. Click delete button on card
2. Confirmation: "Delete this photo?"
3. DELETE to `/api/photos/[id]`
4. Remove card from grid on success
5. Show toast notification

### 5. Empty States

**No photos:**
```
┌─────────────────────────┐
│         🔍              │
│   No media found        │
│                         │
│ No media submissions yet│
└─────────────────────────┘
```

**No search results:**
```
┌─────────────────────────┐
│         🔍              │
│   No media found        │
│                         │
│ Try adjusting your      │
│   search criteria       │
└─────────────────────────┘
```

## Data Loading

### `src/routes/admin/gallery/+page.server.ts`

```typescript
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { validateAdminSession } from '$lib/admin-auth';
import { getDatabase } from '$lib/server/database';

export const load: PageServerLoad = async ({ cookies, platform }) => {
  // Check authentication
  const adminSession = cookies.get('admin_session');
  if (!adminSession || !validateAdminSession(adminSession)) {
    throw redirect(302, '/admin/login?returnTo=/admin/gallery');
  }

  if (!platform?.env) {
    return { photos: [] };
  }

  const db = getDatabase(platform.env);
  const photos = await db.getAllPhotos();

  return {
    photos: photos.map(p => ({
      id: p.id?.toString() || '',
      title: p.description || p.original_name || 'Untitled',
      description: p.description || '',
      uploader_name: p.uploader_name || 'Anonymous',
      upload_date: p.upload_date || new Date().toISOString(),
      url: `/api/photos/${p.id}`,
      thumbnail: `/api/photos/${p.id}`,
      session_id: p.session_id
    }))
  };
};
```

## Client-Side Implementation

```typescript
<script lang="ts">
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }
  
  let { data }: Props = $props();
  
  // State
  let allPhotos = $state(data.photos);
  let filteredPhotos = $state(data.photos);
  let searchQuery = $state('');
  let selectedIds = $state<Set<string>>(new Set());
  let isDeleting = $state(false);
  
  // Computed
  let selectedCount = $derived(selectedIds.size);
  let totalCount = $derived(filteredPhotos.length);
  
  // Search functionality
  function handleSearch(query: string) {
    searchQuery = query;
    
    if (!query.trim()) {
      filteredPhotos = allPhotos;
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    filteredPhotos = allPhotos.filter(photo => 
      photo.title.toLowerCase().includes(lowerQuery) ||
      photo.description.toLowerCase().includes(lowerQuery) ||
      photo.uploader_name.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Selection
  function toggleSelection(id: string) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    selectedIds = newSet;
  }
  
  // Delete individual
  async function deletePhoto(id: string) {
    if (!confirm('Delete this photo?')) return;
    
    const response = await fetch(`/api/photos/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      allPhotos = allPhotos.filter(p => p.id !== id);
      filteredPhotos = filteredPhotos.filter(p => p.id !== id);
      selectedIds.delete(id);
      // Show toast: "Photo deleted"
    } else {
      // Show error toast
    }
  }
  
  // Bulk delete
  async function deleteBulk() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} photo(s)?`)) return;
    
    isDeleting = true;
    
    try {
      const deletePromises = Array.from(selectedIds).map(id =>
        fetch(`/api/photos/${id}`, { method: 'DELETE' })
          .then(r => ({ id, success: r.ok }))
      );
      
      const results = await Promise.all(deletePromises);
      const successIds = results.filter(r => r.success).map(r => r.id);
      const failedCount = results.length - successIds.length;
      
      // Remove successful deletions
      allPhotos = allPhotos.filter(p => !successIds.includes(p.id));
      filteredPhotos = filteredPhotos.filter(p => !successIds.includes(p.id));
      selectedIds = new Set();
      
      // Show toast
      if (failedCount > 0) {
        // Toast: `${failedCount} photo(s) failed to delete`
      } else {
        // Toast: `${results.length} photo(s) deleted`
      }
    } finally {
      isDeleting = false;
    }
  }
  
  // Format date
  function formatDate(isoDate: string): string {
    return new Date(isoDate).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>
```

## UI Components

### Photo Card Component

```svelte
<!-- src/lib/components/admin/PhotoCard.svelte -->
<script lang="ts">
  interface Props {
    photo: Photo;
    isSelected: boolean;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
  }
  
  let { photo, isSelected, onToggle, onDelete }: Props = $props();
</script>

<div class="wedding-card bg-white rounded-lg shadow-md overflow-hidden">
  <!-- Checkbox -->
  <div class="relative">
    <input
      type="checkbox"
      checked={isSelected}
      onchange={() => onToggle(photo.id)}
      class="absolute top-2 left-2 w-4 h-4 z-10"
    />
    
    <!-- Image -->
    <img
      src={photo.thumbnail}
      alt={photo.title}
      class="w-full aspect-square object-cover"
    />
  </div>
  
  <!-- Content -->
  <div class="p-4">
    <h3 class="font-semibold text-sm text-wedding-navy mb-1 truncate">
      {photo.title}
    </h3>
    {#if photo.description}
      <p class="text-xs text-wedding-text-muted mb-2 truncate">
        {photo.description}
      </p>
    {/if}
    <div class="flex items-center justify-between text-xs text-wedding-text-muted mb-3">
      <span>{photo.uploader_name}</span>
      <span>{formatDate(photo.upload_date)}</span>
    </div>
    
    <!-- Delete button -->
    <button
      onclick={() => onDelete(photo.id)}
      class="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
    >
      🗑️ Delete
    </button>
  </div>
</div>
```

## Styling

**Colors:**
- Cards: `bg-white shadow-md hover:shadow-lg`
- Delete button: `bg-red-600 hover:bg-red-700 text-white`
- Bulk delete: `bg-red-600 hover:bg-red-700`
- Search input: `border-gray-300 focus:border-wedding-steel`
- Badge: `bg-wedding-sky text-wedding-navy`

**Grid:**
```css
.photo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .photo-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Verification Checklist

- [ ] Page loads at `/admin/gallery`
- [ ] Requires authentication
- [ ] Photos display in grid
- [ ] Search bar filters results
- [ ] Checkbox selection works
- [ ] Selected count updates
- [ ] Individual delete works
- [ ] Bulk delete works
- [ ] Delete confirmation dialogs show
- [ ] Grid updates after deletion
- [ ] Toast notifications show
- [ ] Empty state displays correctly
- [ ] No search results state shows
- [ ] Mobile responsive grid
- [ ] Images load properly

## Success Criteria

- [x] Gallery management page functional
- [x] Search across title/description/name
- [x] Bulk selection and deletion
- [x] Individual photo deletion
- [x] Proper error handling
- [x] Loading states
- [x] Mobile responsive
- [x] Matches admin theme

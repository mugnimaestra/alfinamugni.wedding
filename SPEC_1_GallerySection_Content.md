# SPEC 1: Update GallerySection Content

**Priority**: HIGH  
**Estimated Time**: 15 minutes  
**Dependencies**: None

## Objective

Add 3 missing gallery pins to the landing page GallerySection component to match the original Qwik version.

## Current State

File: `src/lib/components/GallerySection.svelte`
- Currently has 6 gallery pins
- Missing 3 pins from the original version

## Required Changes

### 1. Add Missing Pins to galleryPins Array

Add these 3 pins after the existing 6 pins in the `galleryPins` array:

```typescript
{
  id: 'pin-roadtrip',
  title: 'Roadtrip Ring Reveal',
  description: 'A coffee stop along the coastal road turned into a ring reveal and tears in the passenger seat.',
  location: 'Makassar Coast',
  date: 'May 2024',
  category: 'Lamaran',
  image: {
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80',
    alt: 'Couple standing together on an empty road at sunset',
    width: 900,
    height: 1350
  },
  tags: ['Roadtrip', 'Surprise', 'Story']
},
{
  id: 'pin-alpine',
  title: 'Foggy Mountain First Look',
  description: 'We practiced our first look at dawn, wrapped in the alpine fog that made everything feel cinematic.',
  location: 'Mount Bromo',
  date: 'February 2025',
  category: 'Rehearsal',
  image: {
    src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    alt: 'Couple embracing on a mountain ridge surrounded by fog',
    width: 900,
    height: 1350
  },
  tags: ['Sunrise', 'First Look', 'Travel']
},
{
  id: 'pin-highland',
  title: 'Heights & Heartbeats',
  description: 'We hiked until we could watch the city wake up together — and locked in our ceremony song on the trail back.',
  location: 'Bukit Pelangi',
  date: 'March 2025',
  category: 'Adventure',
  image: {
    src: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=900&q=80',
    alt: 'Couple holding hands at a mountain overlook',
    width: 900,
    height: 1200
  },
  tags: ['Hike', 'Playlist', 'Morning']
}
```

## Verification

1. Run `pnpm dev` and navigate to `http://localhost:5173`
2. Scroll to the Gallery section
3. Verify that there are now 9 pins total (not 6)
4. Verify the masonry layout still works correctly
5. Check responsive behavior on mobile

## Files to Modify

- `src/lib/components/GallerySection.svelte` (add 3 pins to array)

## Success Criteria

- [x] 9 total pins displayed in gallery section
- [x] All 3 new pins render correctly
- [x] Masonry layout is not broken
- [x] No console errors

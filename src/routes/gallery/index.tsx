import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { GalleryUploadSection } from "../../components/gallery-upload-section";
import { getDatabase, type Env } from "../../lib/database";
import type { GalleryItem } from "../../hooks/use-gallery";

// Server-side data loader for gallery photos
export const useGalleryData = routeLoader$(async ({ platform }) => {
  try {
    // Check if platform.env is available (only in preview/production, not in dev mode)
    if (!platform?.env) {
      console.log("Platform env not available (expected in dev mode). Gallery will show empty state.");
      return { photos: [] };
    }

    const db = getDatabase(platform.env as Env);
    const photos = await db.getAllPhotos();

    // Transform photos to GalleryItem format
    const galleryItems: GalleryItem[] = photos.map((photo) => ({
      id: photo.id?.toString() || '',
      type: 'image' as const,
      title: photo.description || photo.original_name || 'Untitled',
      description: photo.description || '',
      author: photo.uploader_name || 'Anonymous',
      timestamp: photo.upload_date || new Date().toISOString(),
      url: `/api/photos/${photo.id}`,
      thumbnail: `/api/photos/${photo.id}`,
      category: photo.category,
      featured: photo.featured
    }));

    return { photos: galleryItems };
  } catch (error) {
    console.error("Failed to load gallery:", error);
    return { photos: [] };
  }
});

export default component$(() => {
  const galleryData = useGalleryData();

  return (
    <>
      <GalleryUploadSection initialPhotos={galleryData.value.photos} />
    </>
  );
});

export const head: DocumentHead = {
  title: "Wedding Gallery - Alfina & Mugni",
  meta: [
    {
      name: "description",
      content:
        "Share and view wedding moments from Alfina & Mugni's special day.",
    },
    {
      property: "og:title",
      content: "Wedding Gallery - Alfina & Mugni",
    },
    {
      property: "og:description",
      content:
        "Share and view wedding moments from Alfina & Mugni's special day.",
    },
    {
      property: "og:type",
      content: "website",
    },
  ],
};

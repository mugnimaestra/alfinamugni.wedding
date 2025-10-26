import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { GalleryUploadSection } from "../../components/gallery-upload-section";
import { getDatabase, type Env } from "../../lib/database";

// Server-side data loader for gallery photos
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

export default component$(() => {
  return (
    <>
      <GalleryUploadSection />
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

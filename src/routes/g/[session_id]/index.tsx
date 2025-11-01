import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$ } from "@builder.io/qwik-city";
import { getDatabase, type Env } from "../../../lib/database";
import { GalleryUploadSection } from "../../../components/gallery-upload-section";
import type { GalleryItem } from "../../../hooks/use-gallery";

export const useSessionGalleryData = routeLoader$(async ({ params, platform }) => {
  try {
    const sessionId = params.session_id;
    const db = getDatabase(platform.env as Env);

    // Get session
    const session = await db.getSessionBySessionId(sessionId);

    if (!session) {
      return {
        error: 'Session not found',
        session: null,
        photos: [],
      };
    }

    // Get photos for this session
    const photos = await db.getSessionPhotos(sessionId, 30);

    // Transform photos to gallery items
    const photosWithUrls = photos.map((photo) => ({
      id: photo.id?.toString() || '',
      type: 'image' as const,
      title: photo.original_name,
      description: photo.description || '',
      author: photo.uploader_name || 'Guest',
      timestamp: photo.upload_date || new Date().toISOString(),
      url: `/api/photos/${photo.id}`,
      thumbnail: `/api/photos/${photo.id}`,
      category: photo.category,
      featured: photo.featured,
    }));

    return {
      session: {
        session_id: session.session_id,
        title: session.title,
        description: session.description,
        is_active: session.is_active,
        photo_count: session.photo_count,
      },
      photos: photosWithUrls,
      error: null,
    };
  } catch (error) {
    console.error("Failed to load session gallery:", error);
    return {
      error: 'Failed to load gallery',
      session: null,
      photos: [],
    };
  }
});

export default component$(() => {
  const galleryData = useSessionGalleryData();

  if (galleryData.value.error) {
    return (
      <div class="min-h-screen flex items-center justify-center bg-wedding-cream">
        <div class="text-center">
          <h1 class="text-2xl font-semibold text-gray-900 mb-4">
            {galleryData.value.error === 'Session not found'
              ? 'Gallery Not Found'
              : 'Error Loading Gallery'}
          </h1>
          <p class="text-gray-600">
            {galleryData.value.error === 'Session not found'
              ? 'This gallery session does not exist or has been removed.'
              : 'Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  const { session, photos } = galleryData.value;

  return (
    <div class="min-h-screen bg-gradient-to-b from-white via-wedding-cream/40 to-white">
      {/* Session Header */}
      <div class="bg-white border-b border-wedding-beige">
        <div class="max-w-6xl mx-auto px-4 py-8 text-center">
          <h1 class="font-serif text-4xl font-light text-wedding-brown md:text-5xl mb-2">
            {session?.title || 'Wedding Gallery'}
          </h1>
          {session?.description && (
            <p class="text-lg text-wedding-text-muted max-w-2xl mx-auto">
              {session.description}
            </p>
          )}
          {session && (
            <div class="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
              <span>📸 {session.photo_count} photos</span>
              {session.is_active && (
                <span class="text-green-600">🟢 Accepting uploads</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gallery Component */}
      <GalleryUploadSection
        initialPhotos={photos as GalleryItem[]}
        sessionId={session?.session_id}
        isActive={session?.is_active ?? false}
      />
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const galleryData = resolveValue(useSessionGalleryData);
  const title = galleryData.session?.title || 'Wedding Gallery';
  
  return {
    title,
    meta: [
      {
        name: "description",
        content: galleryData.session?.description || "Share your wedding moments",
      },
    ],
  };
};

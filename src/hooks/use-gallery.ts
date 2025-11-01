import { useSignal, useVisibleTask$, useComputed$, type Signal, $, type QRL } from "@builder.io/qwik";
import { appendMetadataToFormData } from "../utils/device-metadata";

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
  uploadFile: QRL<(file: File, metadata: { title: string; description: string; author: string }) => Promise<void>>;
  refreshGallery: QRL<() => Promise<void>>;
  statistics: Signal<{ total: number; images: number; videos: number }>;
  searchItems: QRL<(query: string) => GalleryItem[]>;
}

// Database photo type
interface DatabasePhoto {
  id?: number;
  description?: string;
  original_name?: string;
  uploader_name?: string;
  upload_date?: string;
  url?: string;
  thumbnail_url?: string;
  category?: string;
  featured?: boolean;
}

// Transform database photo to GalleryItem
function transformPhotoToGalleryItem(photo: DatabasePhoto): GalleryItem {
  return {
    id: photo.id?.toString() || '',
    type: 'image', // For now, all are images
    title: photo.description || photo.original_name || 'Untitled',
    description: photo.description || '',
    author: photo.uploader_name || 'Anonymous',
    timestamp: photo.upload_date || new Date().toISOString(),
    url: photo.url,
    thumbnail: photo.thumbnail_url || photo.url,
    category: photo.category,
    featured: photo.featured
  };
}

export const useGallery = (initialPhotos?: GalleryItem[]): UseGalleryReturn => {
  const items = useSignal<GalleryItem[]>(initialPhotos || []);
  const loading = useSignal(!initialPhotos);
  const error = useSignal<string | null>(null);

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

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    // Only fetch if no initial photos were provided
    if (!initialPhotos) {
      await fetchGallery();
    }
  });

  const uploadFile = $(async (file: File, metadata: { title: string; description: string; author: string }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploader_name', metadata.author);
      formData.append('description', metadata.title + (metadata.description ? ': ' + metadata.description : ''));
      formData.append('category', 'guests');

      // Collect and append device metadata for analytics
      appendMetadataToFormData(formData);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Refresh gallery after successful upload
      await fetchGallery();
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  });

  const statistics = useComputed$(() => {
    const total = items.value.length;
    const images = items.value.filter(item => item.type === 'image').length;
    const videos = items.value.filter(item => item.type === 'video').length;

    return { total, images, videos };
  });

  const searchItems = $((query: string): GalleryItem[] => {
    if (!query.trim()) {
      return items.value;
    }

    const lowerQuery = query.toLowerCase();
    return items.value.filter(item =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.author.toLowerCase().includes(lowerQuery)
    );
  });

  return {
    items,
    loading,
    error,
    uploadFile,
    refreshGallery: fetchGallery,
    statistics,
    searchItems
  };
};
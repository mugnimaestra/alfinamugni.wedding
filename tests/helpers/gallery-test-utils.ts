import type { GalleryItem } from '../../src/hooks/use-gallery';
import type { PhotoUpload } from '../../src/lib/database';

/**
 * Mock gallery items for testing
 */
export const createMockGalleryItem = (overrides?: Partial<GalleryItem>): GalleryItem => ({
  id: '1',
  type: 'image',
  title: 'Test Photo',
  description: 'A test photo description',
  author: 'Test Author',
  timestamp: '2025-01-15T10:30:00Z',
  url: '/api/photos/1',
  thumbnail: '/api/photos/1',
  category: 'ceremony',
  featured: false,
  ...overrides,
});

export const createMockGalleryItems = (count: number): GalleryItem[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockGalleryItem({
      id: (i + 1).toString(),
      title: `Test Photo ${i + 1}`,
      author: i % 2 === 0 ? 'Alice' : 'Bob',
      category: ['ceremony', 'reception', 'guests', 'professional'][i % 4] as any,
    })
  );
};

/**
 * Mock photo upload database records
 */
export const createMockPhotoUpload = (overrides?: Partial<PhotoUpload>): PhotoUpload => ({
  id: 1,
  filename: '1705488123_abc123.jpg',
  original_name: 'wedding-photo.jpg',
  file_size: 2048576,
  content_type: 'image/jpeg',
  width: 1920,
  height: 1080,
  upload_date: '2025-01-15T10:30:00Z',
  uploader_name: 'Test User',
  uploader_email: 'test@example.com',
  bucket_path: 'photos/ceremony/2025/1',
  r2_key: 'photos/ceremony/2025/1/1705488123_abc123.jpg',
  featured: false,
  category: 'ceremony',
  description: 'Beautiful ceremony moment',
  ip_address: '192.168.1.1',
  user_agent: 'Mozilla/5.0',
  ...overrides,
});

export const createMockPhotoUploads = (count: number): PhotoUpload[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockPhotoUpload({
      id: i + 1,
      filename: `${Date.now()}_${i}.jpg`,
      r2_key: `photos/ceremony/2025/1/${Date.now()}_${i}.jpg`,
      uploader_name: `User ${i + 1}`,
    })
  );
};

/**
 * Mock File object for testing uploads
 */
export const createMockFile = (
  name: string = 'test-image.jpg',
  type: string = 'image/jpeg',
  size: number = 1024 * 1024 // 1MB
): File => {
  const blob = new Blob(['fake-image-data'], { type });
  return new File([blob], name, { type });
};

/**
 * Mock FormData for testing
 */
export const createMockFormData = (file: File, metadata: Record<string, string>): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(metadata).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

/**
 * Mock fetch response helpers
 */
export const createMockResponse = (data: any, success: boolean = true) => ({
  success,
  data: success ? data : undefined,
  error: success ? undefined : data,
});

/**
 * Sleep utility for testing async operations
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

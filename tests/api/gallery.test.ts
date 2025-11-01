import { describe, it, expect, beforeEach, vi } from 'vitest';
import { onGet } from '../../src/routes/api/gallery/index';
import { createMockEnv, MockD1Database, MockR2Bucket } from '../helpers/mock-cloudflare-env';
import { createMockPhotoUploads } from '../helpers/gallery-test-utils';
import type { RequestHandler } from '@builder.io/qwik-city';

describe('/api/gallery endpoint', () => {
  let mockEnv: ReturnType<typeof createMockEnv>;
  let mockDb: MockD1Database;
  let mockR2: MockR2Bucket;

  beforeEach(() => {
    mockEnv = createMockEnv();
    mockDb = mockEnv.DB as any;
    mockR2 = mockEnv.WEDDING_PHOTOS as any;
  });

  it('should return photos from database', async () => {
    // Arrange
    const mockPhotos = createMockPhotoUploads(3);
    mockDb.setData('photos', mockPhotos);

    // Store photos in R2
    for (const photo of mockPhotos) {
      await mockR2.put(photo.r2_key, new ArrayBuffer(1024), {
        httpMetadata: { contentType: photo.content_type },
      });
    }

    const request = new Request('http://localhost/api/gallery');
    const mockContext: any = {
      request,
      platform: { env: mockEnv },
      json: (status: number, data: any) => {
        const response = Response.json(data);
        (response as any).status = status;
        return response;
      },
    };

    // Act
    try {
      await onGet(mockContext);
    } catch (response) {
      // The handler throws the response
      const data = await (response as Response).json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(3);
      expect(data.total).toBe(3);
      expect(data.data[0]).toHaveProperty('url');
      expect(data.data[0].url).toMatch(/^\/api\/photos\/\d+$/);
    }
  });

  it('should filter photos by category', async () => {
    // Arrange
    const ceremonyPhotos = createMockPhotoUploads(2).map(p => ({ ...p, category: 'ceremony' as const }));
    const receptionPhotos = createMockPhotoUploads(3).map((p, i) => ({ ...p, id: i + 3, category: 'reception' as const }));
    const allPhotos = [...ceremonyPhotos, ...receptionPhotos];

    mockDb.setData('photos', allPhotos);

    for (const photo of allPhotos) {
      await mockR2.put(photo.r2_key, new ArrayBuffer(1024), {
        httpMetadata: { contentType: photo.content_type },
      });
    }

    const request = new Request('http://localhost/api/gallery?category=ceremony');
    const mockContext: any = {
      request,
      platform: { env: mockEnv },
      json: (status: number, data: any) => {
        const response = Response.json(data);
        (response as any).status = status;
        return response;
      },
    };

    // Act
    try {
      await onGet(mockContext);
    } catch (response) {
      const data = await (response as Response).json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      expect(data.data.every((p: any) => p.category === 'ceremony')).toBe(true);
    }
  });

  it('should return empty array when no photos exist', async () => {
    // Arrange
    mockDb.setData('photos', []);

    const request = new Request('http://localhost/api/gallery');
    const mockContext: any = {
      request,
      platform: { env: mockEnv },
      json: (status: number, data: any) => {
        const response = Response.json(data);
        (response as any).status = status;
        return response;
      },
    };

    // Act
    try {
      await onGet(mockContext);
    } catch (response) {
      const data = await (response as Response).json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(0);
      expect(data.total).toBe(0);
    }
  });

  it('should use placeholder for photos missing in R2', async () => {
    // Arrange
    const mockPhotos = createMockPhotoUploads(2);
    mockDb.setData('photos', mockPhotos);

    // Only add first photo to R2, leave second missing
    await mockR2.put(mockPhotos[0].r2_key, new ArrayBuffer(1024), {
      httpMetadata: { contentType: mockPhotos[0].content_type },
    });

    const request = new Request('http://localhost/api/gallery');
    const mockContext: any = {
      request,
      platform: { env: mockEnv },
      json: (status: number, data: any) => {
        const response = Response.json(data);
        (response as any).status = status;
        return response;
      },
    };

    // Act
    try {
      await onGet(mockContext);
    } catch (response) {
      const data = await (response as Response).json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(2);
      // First photo should have real URL
      expect(data.data[0].url).toMatch(/^\/api\/photos\/\d+$/);
      // Second photo should have placeholder (Unsplash URL)
      expect(data.data[1].url).toMatch(/unsplash\.com/);
    }
  });

  it('should handle database errors gracefully', async () => {
    // Arrange
    const mockContext: any = {
      request: new Request('http://localhost/api/gallery'),
      platform: {
        env: {
          ...mockEnv,
          DB: {
            prepare: () => {
              throw new Error('Database connection failed');
            },
          },
        },
      },
      json: (status: number, data: any) => {
        const response = Response.json(data);
        (response as any).status = status;
        return response;
      },
    };

    // Act
    try {
      await onGet(mockContext);
    } catch (response) {
      const data = await (response as Response).json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
      expect((response as any).status).toBe(500);
    }
  });
});

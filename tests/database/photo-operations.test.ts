import { describe, it, expect, beforeEach } from 'vitest';
import { WeddingDatabase } from '../../src/lib/database';
import type { PhotoUpload } from '../../src/lib/database';
import { MockD1Database } from '../helpers/mock-cloudflare-env';
import { createMockPhotoUpload } from '../helpers/gallery-test-utils';

describe('WeddingDatabase - Photo Operations', () => {
  let db: WeddingDatabase;
  let mockD1: MockD1Database;

  beforeEach(() => {
    mockD1 = new MockD1Database();
    db = new WeddingDatabase(mockD1 as any);
  });

  describe('createPhotoUpload', () => {
    it('should create a new photo upload record', async () => {
      // Arrange
      const photoData: Omit<PhotoUpload, 'id' | 'upload_date'> = {
        filename: 'test-photo.jpg',
        original_name: 'my-photo.jpg',
        file_size: 1024000,
        content_type: 'image/jpeg',
        bucket_path: 'photos/ceremony/2025/1',
        r2_key: 'photos/ceremony/2025/1/test-photo.jpg',
        featured: false,
        category: 'ceremony',
        uploader_name: 'Test User',
      };

      mockD1.setData('photos', [{ ...photoData, id: 1, upload_date: new Date().toISOString() }]);

      // Act
      const result = await db.createPhotoUpload(photoData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.filename).toBe('test-photo.jpg');
    });
  });

  describe('getPhotoUploadById', () => {
    it('should retrieve a photo by ID', async () => {
      // Arrange
      const mockPhoto = createMockPhotoUpload({ id: 1 });
      mockD1.setData('photos', [mockPhoto]);

      const prepareStub = mockD1.prepare;
      mockD1.prepare = (query: string) => {
        const result = prepareStub.call(mockD1, query);
        return {
          ...result,
          bind: (...params: any[]) => ({
            first: async () => mockPhoto,
            all: async () => ({ results: [mockPhoto] }),
            run: async () => ({ success: true, meta: { last_row_id: 1 } }),
          }),
        };
      };

      // Act
      const result = await db.getPhotoUploadById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.filename).toBe(mockPhoto.filename);
    });
  });

  describe('getAllPhotos', () => {
    it('should return all photos', async () => {
      // Arrange
      const mockPhotos = [
        createMockPhotoUpload({ id: 1, category: 'ceremony' }),
        createMockPhotoUpload({ id: 2, category: 'reception' }),
        createMockPhotoUpload({ id: 3, category: 'guests' }),
      ];

      mockD1.setData('photos', mockPhotos);

      const prepareStub = mockD1.prepare;
      mockD1.prepare = (query: string) => {
        const result = prepareStub.call(mockD1, query);
        return {
          ...result,
          bind: (...params: any[]) => ({
            all: async () => ({ results: mockPhotos }),
            first: async () => mockPhotos[0],
            run: async () => ({ success: true }),
          }),
        };
      };

      // Act
      const result = await db.getAllPhotos();

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(1);
    });

    it('should filter photos by category', async () => {
      // Arrange
      const ceremonyPhotos = [
        createMockPhotoUpload({ id: 1, category: 'ceremony' }),
        createMockPhotoUpload({ id: 2, category: 'ceremony' }),
      ];
      const receptionPhotos = [createMockPhotoUpload({ id: 3, category: 'reception' })];
      const allPhotos = [...ceremonyPhotos, ...receptionPhotos];

      mockD1.setData('photos', allPhotos);

      const prepareStub = mockD1.prepare;
      mockD1.prepare = (query: string) => {
        return {
          bind: (...params: any[]) => ({
            all: async () => {
              // Simulate filtering by category
              const category = params[0];
              const filtered = category ? allPhotos.filter(p => p.category === category) : allPhotos;
              return { results: filtered };
            },
            first: async () => ceremonyPhotos[0],
            run: async () => ({ success: true }),
          }),
        } as any;
      };

      // Act
      const result = await db.getAllPhotos('ceremony');

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every(p => p.category === 'ceremony')).toBe(true);
    });
  });

  describe('deletePhotoUpload', () => {
    it('should delete a photo by ID', async () => {
      // Arrange
      const mockPhoto = createMockPhotoUpload({ id: 1 });
      mockD1.setData('photos', [mockPhoto]);

      const prepareStub = mockD1.prepare;
      mockD1.prepare = (query: string) => {
        return {
          bind: (...params: any[]) => ({
            run: async () => {
              // Simulate deletion
              const photos = mockD1.getData('photos').filter((p: any) => p.id !== params[0]);
              mockD1.setData('photos', photos);
              return { success: true };
            },
            all: async () => ({ results: [] }),
            first: async () => null,
          }),
        } as any;
      };

      // Act
      await db.deletePhotoUpload(1);

      // Assert
      const remainingPhotos = mockD1.getData('photos');
      expect(remainingPhotos).toHaveLength(0);
    });

    it('should throw error if deletion fails', async () => {
      // Arrange
      mockD1.prepare = () => ({
        bind: () => ({
          run: async () => ({ success: false, error: 'Database error' }),
        }),
      } as any);

      // Act & Assert
      await expect(db.deletePhotoUpload(1)).rejects.toThrow('Failed to delete photo upload');
    });
  });
});

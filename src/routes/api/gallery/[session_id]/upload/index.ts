import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env } from '../../../../../lib/database';

// POST /api/gallery/:session_id/upload - Upload photos to a session
export const onPost: RequestHandler = async ({ params, request, json, platform }) => {
  try {
    const sessionId = params.session_id;

    // Verify session exists and is active
    const db = getDatabase(platform.env as Env);
    const session = await db.getSessionBySessionId(sessionId);

    if (!session) {
      throw json(404, {
        success: false,
        error: 'Session not found',
      });
    }

    if (!session.is_active) {
      throw json(403, {
        success: false,
        error: 'This session is no longer accepting uploads',
      });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const caption = formData.get('caption') as string | null;
    const uploaderName = formData.get('uploader_name') as string | null;

    if (files.length === 0) {
      throw json(400, {
        success: false,
        error: 'No files provided',
      });
    }

    // Validate file count
    if (files.length > 10) {
      throw json(400, {
        success: false,
        error: 'Maximum 10 files per upload',
      });
    }

    const uploadedPhotos = [];
    const failedFiles = [];

    for (const file of files) {
      try {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
        if (!allowedTypes.includes(file.type)) {
          failedFiles.push({ name: file.name, error: 'Invalid file type' });
          continue;
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          failedFiles.push({ name: file.name, error: 'File too large (max 10MB)' });
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const filename = `${timestamp}_${randomId}.${fileExtension}`;

        // Determine category based on session
        const category = 'guests'; // Default category for public uploads

        // Generate R2 key
        const bucketPath = `photos/${category}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
        const r2Key = `${bucketPath}/${filename}`;

        // Upload to R2
        const fileBuffer = await file.arrayBuffer();
        await (platform.env as Env).WEDDING_PHOTOS.put(r2Key, fileBuffer, {
          httpMetadata: {
            contentType: file.type,
            cacheControl: 'public, max-age=31536000',
          },
          customMetadata: {
            originalName: file.name,
            uploaderName: uploaderName || 'Anonymous',
            uploadDate: new Date().toISOString(),
            category,
            sessionId,
          },
        });

        // Create database record
        const photoData = {
          filename,
          original_name: file.name,
          file_size: file.size,
          content_type: file.type,
          bucket_path: bucketPath,
          r2_key: r2Key,
          featured: false,
          category: category as 'ceremony' | 'reception' | 'guests' | 'professional',
          description: caption || undefined,
          uploader_name: uploaderName || undefined,
          session_id: sessionId,
          ip_address: request.headers.get('CF-Connecting-IP') || undefined,
          user_agent: request.headers.get('User-Agent') || undefined,
        };

        const photo = await db.createPhotoUpload(photoData);
        
        // Increment session photo count
        await db.incrementSessionPhotoCount(sessionId);

        uploadedPhotos.push(photo);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        failedFiles.push({
          name: file.name,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    throw json(200, {
      success: true,
      uploaded_count: uploadedPhotos.length,
      failed_count: failedFiles.length,
      uploaded: uploadedPhotos.map(p => ({ id: p.id, filename: p.filename })),
      failed: failedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      success: false,
      error: 'Upload failed',
    });
  }
};

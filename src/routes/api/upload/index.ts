import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env, type PhotoUpload } from '../../../lib/database';

// Upload photos to R2 storage
export const onPost: RequestHandler = async ({ request, json, platform }) => {
  try {
    const db = getDatabase(platform.env as Env);
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const uploaderName = formData.get('uploader_name') as string;
    const uploaderEmail = formData.get('uploader_email') as string;
    const category = formData.get('category') as string || 'guests';
    const description = formData.get('description') as string;

    // Collect client metadata from form
    const screenResolution = formData.get('screen_resolution') as string;
    const deviceOrientation = formData.get('device_orientation') as string;
    const connectionType = formData.get('connection_type') as string;
    const cameraModel = formData.get('camera_model') as string;

    if (!file) {
      throw json(400, {
        error: 'No file provided',
        success: false
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      throw json(400, {
        error: 'Invalid file type. Only JPEG, PNG, WebP, and HEIC images are allowed.',
        success: false
      });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw json(400, {
        error: 'File size too large. Maximum size is 5MB.',
        success: false
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `${timestamp}_${randomId}.${fileExtension}`;

    // Get client information from headers
    const clientIP = request.headers.get('CF-Connecting-IP') ||
                    request.headers.get('X-Forwarded-For') ||
                    'unknown';
    const userAgent = request.headers.get('User-Agent') || undefined;
    const countryCode = request.headers.get('CF-IPCountry') || undefined;

    // Determine bucket path based on category
    const bucketPath = `photos/${category}/${new Date().getFullYear()}/${new Date().getMonth() + 1}`;
    const r2Key = `${bucketPath}/${filename}`;

    try {
      // Upload to R2 storage
      const fileBuffer = await file.arrayBuffer();

      // TODO: Add image processing with Sharp in Phase 3
      // For now, upload the original file
      await (platform.env as Env).WEDDING_PHOTOS.put(r2Key, fileBuffer, {
        httpMetadata: {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        },
        customMetadata: {
          originalName: file.name,
          uploaderName: uploaderName || 'Anonymous',
          uploaderEmail: uploaderEmail || '',
          uploadDate: new Date().toISOString(),
          category: category
        }
      });

      // Create database record
      const photoData: Omit<PhotoUpload, 'id' | 'upload_date'> = {
        filename: filename,
        original_name: file.name,
        file_size: file.size,
        content_type: file.type,
        width: undefined, // TODO: Extract from image in Phase 3
        height: undefined, // TODO: Extract from image in Phase 3
        uploader_name: uploaderName || undefined,
        uploader_email: uploaderEmail || undefined,
        bucket_path: bucketPath,
        r2_key: r2Key,
        approved: (platform.env as Env).ENVIRONMENT === 'development', // Auto-approve in dev
        featured: false,
        category: category as 'ceremony' | 'reception' | 'guests' | 'professional',
        description: description || undefined,
        ip_address: clientIP,
        user_agent: userAgent,
        screen_resolution: screenResolution || undefined,
        device_orientation: deviceOrientation || undefined,
        connection_type: connectionType || undefined,
        country_code: countryCode,
        camera_model: cameraModel || undefined
      };

      const result = await db.createPhotoUpload(photoData);

      // TODO: Send admin notification email in Phase 2

      throw json(200, {
        success: true,
        message: 'Photo uploaded successfully',
        data: {
          id: result.id,
          filename: result.filename,
          original_name: result.original_name,
          file_size: result.file_size,
          category: result.category,
          approved: result.approved,
          upload_date: result.upload_date,
          // Generate signed URL for immediate preview
          preview_url: `https://placeholder.example.com/${bucketPath}/${filename}` // TODO: Generate real signed URL
        }
      });

    } catch (uploadError) {
      console.error('R2 upload error:', uploadError);
      throw json(500, {
        error: 'Failed to upload file to storage',
        success: false
      });
    }

  } catch (error) {
    console.error('Upload error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false
    });
  }
};

// Generate signed URL for file access
export const onGet: RequestHandler = async ({ request, json, platform }) => {
  try {
    const url = new URL(request.url);
    const r2Key = url.searchParams.get('key');
    const expiresIn = parseInt(url.searchParams.get('expires') || '3600'); // Default 1 hour

    if (!r2Key) {
      throw json(400, {
        error: 'Missing required parameter: key',
        success: false
      });
    }

    // Check if file exists
    const object = await (platform.env as Env).WEDDING_PHOTOS.head(r2Key);
    if (!object) {
      throw json(404, {
        error: 'File not found',
        success: false
      });
    }

    // TODO: Generate proper signed URL for R2
    // For now, return a placeholder URL
    const signedUrl = `https://placeholder.example.com/${r2Key}?expires=${Date.now() + (expiresIn * 1000)}`;

    throw json(200, {
      success: true,
      data: {
        signed_url: signedUrl,
        expires_at: new Date(Date.now() + (expiresIn * 1000)).toISOString(),
        content_type: object.httpMetadata?.contentType,
        size: object.size
      }
    });

  } catch (error) {
    console.error('Signed URL generation error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false
    });
  }
};
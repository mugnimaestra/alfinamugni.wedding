import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env, type PhotoUpload } from '../../../lib/database';

// Get approved photos for gallery display
export const onGet: RequestHandler = async ({ request, json, platform }) => {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const includeAll = url.searchParams.get('all') === 'true';

    const db = getDatabase(platform.env as Env);

    // For now, simple admin check - will be replaced with proper auth in Phase 2
    const isAdmin = includeAll && (platform.env as Env).ENVIRONMENT === 'development';

    let photos: PhotoUpload[];

    if (isAdmin) {
      // Admin can see all photos
      photos = await db.getAllPhotos();
    } else {
      // Public can only see approved photos
      photos = await db.getApprovedPhotos(category || undefined);
    }

    // Generate signed URLs for photos (placeholder for R2 integration)
    const photosWithUrls = photos.map(photo => ({
      id: photo.id,
      filename: photo.filename,
      original_name: photo.original_name,
      width: photo.width,
      height: photo.height,
      category: photo.category,
      description: photo.description,
      featured: photo.featured,
      approved: photo.approved,
      upload_date: photo.upload_date,
      uploader_name: photo.uploader_name,
      // TODO: Generate actual signed URLs from R2 in Phase 1 completion
      url: `https://placeholder.example.com/${photo.bucket_path}/${photo.filename}`,
      thumbnail_url: `https://placeholder.example.com/${photo.bucket_path}/thumbs/${photo.filename}`
    }));

    throw json(200, {
      success: true,
      data: photosWithUrls,
      total: photosWithUrls.length
    });

  } catch (error) {
    console.error('Gallery retrieval error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false
    });
  }
};

// Get photo by ID with signed URL
export const onPatch: RequestHandler = async ({ request, json, platform }) => {
  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      throw json(400, {
        error: 'Missing required fields: id, action',
        success: false
      });
    }

    const db = getDatabase(platform.env as Env);

    if (action === 'approve') {
      // TODO: Add admin authentication check in Phase 2
      const photo = await db.approvePhoto(parseInt(id), 'admin'); // Placeholder admin user

      throw json(200, {
        success: true,
        message: 'Photo approved successfully',
        data: {
          id: photo.id,
          approved: photo.approved,
          approved_at: photo.approved_at
        }
      });
    }

    if (action === 'feature') {
      // TODO: Implement feature/unfeature functionality
      throw json(501, {
        error: 'Feature functionality not yet implemented',
        success: false
      });
    }

    throw json(400, {
      error: 'Invalid action. Supported actions: approve, feature',
      success: false
    });

  } catch (error) {
    console.error('Photo action error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false
    });
  }
};
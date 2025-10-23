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

    // Generate R2 URLs for photos
    const photosWithUrls = await Promise.all(photos.map(async (photo) => {
      // For R2, we can use public URLs if bucket is public, or generate signed URLs
      // Using R2 public URL format: https://<bucket>.<account-id>.r2.cloudflarestorage.com/<key>
      // Or custom domain if configured
      
      const r2Bucket = (platform.env as Env).WEDDING_PHOTOS;
      
      // Try to get the object to verify it exists
      try {
        const object = await r2Bucket.head(photo.r2_key);
        
        if (object) {
          // Generate a URL - in production, you'd use a custom domain or R2 public URL
          // For now, we'll use a data URL approach or placeholder
          // In real production, configure R2 public access or use signed URLs
          const url = `/api/photos/${photo.id}`;
          
          return {
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
            url: url,
            thumbnail_url: url, // Same for now, can add thumbnail generation later
            r2_key: photo.r2_key
          };
        }
      } catch (error) {
        console.warn(`Photo ${photo.id} not found in R2:`, error);
      }
      
      // Fallback to placeholder if R2 object not found
      return {
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
        url: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80`,
        thumbnail_url: `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80`,
        r2_key: photo.r2_key
      };
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
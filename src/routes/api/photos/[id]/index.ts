import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env } from '../../../../lib/database';

// Serve photo from R2 storage
export const onGet: RequestHandler = async ({ params, platform }) => {
  try {
    const photoId = parseInt(params.id);
    
    if (isNaN(photoId)) {
      return new Response('Invalid photo ID', { status: 400 });
    }

    const db = getDatabase(platform.env as Env);
    const photo = await db.getPhotoUploadById(photoId);

    if (!photo) {
      return new Response('Photo not found', { status: 404 });
    }

    // Get photo from R2
    const r2Bucket = (platform.env as Env).WEDDING_PHOTOS;
    const object = await r2Bucket.get(photo.r2_key);

    if (!object) {
      return new Response('Photo file not found in storage', { status: 404 });
    }

    // Return the image with appropriate headers
    return new Response(object.body, {
      headers: {
        'Content-Type': photo.content_type,
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
        'ETag': object.etag || '',
      },
    });

  } catch (error) {
    console.error('Photo retrieval error:', error);
    return new Response('Internal server error', { status: 500 });
  }
};


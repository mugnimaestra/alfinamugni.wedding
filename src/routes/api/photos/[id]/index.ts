import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env } from '../../../../lib/database';

// Serve photo from R2 storage
export const onGet: RequestHandler = async ({ params, platform, send }) => {
  try {
    const photoId = parseInt(params.id);

    if (isNaN(photoId)) {
      send(new Response('Invalid photo ID', { status: 400 }));
      return;
    }

    const db = getDatabase(platform.env as Env);
    const photo = await db.getPhotoUploadById(photoId);

    if (!photo) {
      send(new Response('Photo not found', { status: 404 }));
      return;
    }

    // Get photo from R2
    const r2Bucket = (platform.env as Env).WEDDING_PHOTOS;
    const object = await r2Bucket.get(photo.r2_key);

    if (!object) {
      send(new Response('Photo file not found in storage', { status: 404 }));
      return;
    }

    // Get the body as ArrayBuffer
    const bodyBuffer = await object.arrayBuffer();

    // Return the image with appropriate headers
    send(new Response(bodyBuffer, {
      headers: {
        'Content-Type': photo.content_type,
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
        'ETag': object.etag || '',
      },
    }));

  } catch (error) {
    console.error('Photo retrieval error:', error);
    send(new Response('Internal server error', { status: 500 }));
  }
};

// Delete photo from R2 storage and database
export const onDelete: RequestHandler = async ({ params, platform, json }) => {
  try {
    const photoId = parseInt(params.id);

    if (isNaN(photoId)) {
      throw json(400, {
        error: 'Invalid photo ID',
        success: false
      });
    }

    const db = getDatabase(platform.env as Env);
    const photo = await db.getPhotoUploadById(photoId);

    if (!photo) {
      throw json(404, {
        error: 'Photo not found',
        success: false
      });
    }

    // Delete from R2 storage
    const r2Bucket = (platform.env as Env).WEDDING_PHOTOS;
    await r2Bucket.delete(photo.r2_key);

    // Delete from database
    await db.deletePhotoUpload(photoId);

    throw json(200, {
      success: true,
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Photo deletion error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false
    });
  }
};


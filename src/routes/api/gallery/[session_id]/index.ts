import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env } from '../../../../lib/database';

// GET /api/gallery/:session_id - Get session and its photos
export const onGet: RequestHandler = async ({ params, request, json, platform }) => {
  try {
    const sessionId = params.session_id;
    const url = new URL(request.url);
    const cursor = url.searchParams.get('cursor');
    const limit = parseInt(url.searchParams.get('limit') || '30');

    const db = getDatabase(platform.env as Env);

    // Get session info
    const session = await db.getSessionBySessionId(sessionId);

    if (!session) {
      throw json(404, {
        success: false,
        error: 'Session not found',
      });
    }

    // Get photos for this session
    const photos = await db.getSessionPhotos(
      sessionId,
      limit,
      cursor ? parseInt(cursor) : undefined
    );

    // Transform photos to include API URLs
    const photosWithUrls = photos.map((photo) => ({
      id: photo.id,
      filename: photo.filename,
      original_name: photo.original_name,
      description: photo.description,
      uploader_name: photo.uploader_name,
      upload_date: photo.upload_date,
      category: photo.category,
      featured: photo.featured,
      url: `/api/photos/${photo.id}`,
      thumbnail_url: `/api/photos/${photo.id}`,
    }));

    // Determine if there are more photos
    const nextCursor = photos.length === limit ? photos[photos.length - 1].id : null;

    throw json(200, {
      success: true,
      session: {
        session_id: session.session_id,
        title: session.title,
        description: session.description,
        is_active: session.is_active,
        photo_count: session.photo_count,
      },
      photos: photosWithUrls,
      next_cursor: nextCursor,
      has_more: !!nextCursor,
    });
  } catch (error) {
    console.error('Gallery retrieval error:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      error: 'Internal server error',
      success: false,
    });
  }
};

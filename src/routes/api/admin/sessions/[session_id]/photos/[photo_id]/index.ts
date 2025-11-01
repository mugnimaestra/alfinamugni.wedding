import type { RequestHandler } from '@builder.io/qwik-city';
import { getDatabase, type Env } from '../../../../../../../lib/database';

// DELETE /api/admin/sessions/:session_id/photos/:photo_id - Delete photo
export const onDelete: RequestHandler = async ({ params, json, platform }) => {
  try {
    const photoId = parseInt(params.photo_id);

    if (isNaN(photoId)) {
      throw json(400, {
        success: false,
        error: 'Invalid photo ID',
      });
    }

    const db = getDatabase(platform.env as Env);

    // Get photo info first
    const photo = await db.getPhotoUploadById(photoId);

    if (!photo) {
      throw json(404, {
        success: false,
        error: 'Photo not found',
      });
    }

    // Delete from R2
    const r2Bucket = (platform.env as Env).WEDDING_PHOTOS;
    await r2Bucket.delete(photo.r2_key);

    // Delete from database
    await db.deletePhotoUpload(photoId);

    throw json(200, {
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete photo:', error);

    if (error instanceof Response) {
      throw error;
    }

    throw json(500, {
      success: false,
      error: 'Failed to delete photo',
    });
  }
};

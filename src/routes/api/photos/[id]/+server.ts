import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, platform }) => {
	try {
		if (!platform?.env.DB || !platform?.env.WEDDING_PHOTOS) {
			throw error(500, 'Server configuration error');
		}

		const photoId = params.id;

		// Get photo metadata from D1
		const photo = await platform.env.DB.prepare(
			`SELECT r2_key, content_type FROM photo_uploads WHERE id = ?`
		)
			.bind(photoId)
			.first();

		if (!photo) {
			throw error(404, 'Photo not found');
		}

		// Fetch from R2
		const object = await platform.env.WEDDING_PHOTOS.get(photo.r2_key as string);

		if (!object) {
			throw error(404, 'Photo file not found in storage');
		}

		// Return image response
		return new Response(object.body, {
			headers: {
				'Content-Type': photo.content_type as string || 'image/jpeg',
				'Cache-Control': 'public, max-age=31536000, immutable'
			}
		});
	} catch (err) {
		console.error('Fetch photo error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Failed to fetch photo');
	}
};


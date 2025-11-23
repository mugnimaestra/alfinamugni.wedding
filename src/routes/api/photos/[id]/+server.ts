import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_R2_URL } from '$env/static/public';

export const GET: RequestHandler = async ({ params, platform, url }) => {
	try {
		console.log('API called for photo ID:', params.id);

		if (!platform?.env.DB) {
			throw error(500, 'Database not configured');
		}

		const photoId = params.id;

		// Get photo metadata from D1
		const photo = await platform.env.DB.prepare(
			`SELECT id, r2_key, thumbnail_url, content_type, public_url, thumbnail_public_url 
			 FROM photo_uploads WHERE id = ?`
		)
			.bind(photoId)
			.first();

		console.log('Photo query result:', photo);

		if (!photo) {
			throw error(404, 'Photo not found');
		}

		// Only redirect to public URL if PUBLIC_R2_URL is configured AND public_url exists
		// This allows using R2 public URLs in local dev when properly configured
		const isThumbnail = url.searchParams.get('thumbnail') === 'true';
		const publicUrl = isThumbnail ? photo.thumbnail_public_url : photo.public_url;

		console.log('Redirect decision:', { isThumbnail, publicUrl, photoId, photo, PUBLIC_R2_URL });

		// Check if PUBLIC_R2_URL is configured AND public_url exists and is not empty
		if (PUBLIC_R2_URL && publicUrl && typeof publicUrl === 'string' && publicUrl.trim() !== '') {
			console.log('Redirecting to:', publicUrl);
			return new Response(null, {
				status: 302,
				headers: {
					'Location': publicUrl,
					'Cache-Control': 'public, max-age=31536000, immutable'
				}
			});
		}

		// Fallback: try to fetch from R2
		if (!platform?.env.WEDDING_PHOTOS) {
			throw error(500, 'R2 storage not configured');
		}

		const r2Key = isThumbnail && photo.thumbnail_url ? photo.thumbnail_url : photo.r2_key;
		if (!r2Key || typeof r2Key !== 'string') {
			throw error(404, 'Photo file reference not found');
		}

		console.log('Fetching from R2 with key:', r2Key);
		let object = await platform.env.WEDDING_PHOTOS.get(r2Key);

		// Fallback: If thumbnail is missing, try to serve the original image
		if (!object && isThumbnail && photo.thumbnail_url) {
			console.log('Thumbnail not found in R2, falling back to main image:', photo.r2_key);
			object = await platform.env.WEDDING_PHOTOS.get(photo.r2_key as string);
		}

		if (!object) {
			throw error(404, 'Photo file not found in storage');
		}

		const headers = {
			'Content-Type': (photo.content_type as string) || 'image/jpeg',
			'Cache-Control': 'public, max-age=31536000, immutable'
		};

		return new Response(object.body as ReadableStream, { headers });

	} catch (err) {
		console.error('API error:', err);

		// SvelteKit error() throws an HttpError object with status and body properties
		// Check if it's already a SvelteKit HttpError by checking for status property
		if (err && typeof err === 'object' && 'status' in err) {
			// Re-throw SvelteKit errors as-is to preserve status code (404, 500, etc.)
			throw err;
		}

		// For other errors, wrap them appropriately
		if (err instanceof Error) {
			// If it's a known error type, preserve the status
			const errorMessage = err.message.toLowerCase();
			if (errorMessage.includes('not found') || errorMessage.includes('404')) {
				throw error(404, err.message);
			}
			throw error(500, `Photo fetch failed: ${err.message}`);
		}

		throw error(500, 'Failed to fetch photo');
	}
};

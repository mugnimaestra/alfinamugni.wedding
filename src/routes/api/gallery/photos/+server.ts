import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_R2_URL } from '$env/static/public';

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		if (!platform?.env.DB) {
			throw error(500, 'Database not configured');
		}

		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '30');
		const offset = (page - 1) * limit;

		if (page < 1 || limit < 1 || limit > 100) {
			throw error(400, 'Invalid pagination parameters');
		}

		const r2PublicUrl = PUBLIC_R2_URL || null;

		console.log('DEBUG: PUBLIC_R2_URL:', r2PublicUrl);

		const result = await platform.env.DB.prepare(
			`SELECT id, filename, original_name, file_size, content_type, media_type, r2_key,
			       thumbnail_url, public_url, thumbnail_public_url, uploader_name,
			       description, upload_date, featured
			FROM photo_uploads
			ORDER BY upload_date DESC
			LIMIT ? OFFSET ?`
		)
			.bind(limit, offset)
			.all();

		console.log('DEBUG: Raw photos from DB:', result.results?.length || 0, 'photos');
		console.log('DEBUG: Sample photo structure:', JSON.stringify(result.results?.[0], null, 2));

		interface PhotoRow {
			id: number;
			filename: string;
			original_name: string;
			file_size: number;
			content_type: string;
			media_type: string;
			r2_key: string | null;
			thumbnail_url: string | null;
			public_url: string | null;
			thumbnail_public_url: string | null;
			uploader_name: string | null;
			description: string | null;
			upload_date: string;
			featured: number;
		}

		// Transform photos to use public URLs if available
		const photos = (result.results || []).map((p: unknown) => {
			const photo = p as PhotoRow;
			const photoWithUrls = {
				...photo,
				url: photo.public_url || `/api/photos/${photo.id}`,
				thumbnail: photo.thumbnail_public_url
					? photo.thumbnail_public_url
					: (photo.thumbnail_url
						? `/api/photos/${photo.id}?thumbnail=true`
						: (photo.public_url
							? photo.public_url
							: `/api/photos/${photo.id}`))
			};

			console.log('DEBUG: Photo ID', photo.id, '- public_url:', photo.public_url,
				'- thumbnail_public_url:', photo.thumbnail_public_url,
				'- url:', photoWithUrls.url, '- thumbnail:', photoWithUrls.thumbnail);

			return photoWithUrls;
		});

		return json({
			success: true,
			photos,
			pagination: {
				page,
				limit,
				total: result.results?.length || 0
			}
		});
	} catch (err) {
		console.error('Fetch photos error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Failed to fetch photos');
	}
};


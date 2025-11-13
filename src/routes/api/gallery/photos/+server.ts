import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

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

		const result = await platform.env.DB.prepare(
			`SELECT id, filename, original_name, file_size, content_type, media_type, r2_key, 
			       uploader_name, description, upload_date, featured
			FROM photo_uploads
			ORDER BY upload_date DESC
			LIMIT ? OFFSET ?`
		)
			.bind(limit, offset)
			.all();

		return json({
			success: true,
			photos: result.results || [],
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


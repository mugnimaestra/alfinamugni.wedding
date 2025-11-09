import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		if (!platform?.env.DB) {
			throw error(500, 'Database not configured');
		}

		const result = await platform.env.DB.prepare(
			`SELECT id, filename, original_name, file_size, content_type, r2_key, 
			       uploader_name, description, upload_date, featured, category
			FROM photo_uploads
			ORDER BY upload_date DESC`
		).all();

		return json({
			success: true,
			photos: result.results || []
		});
	} catch (err) {
		console.error('Fetch photos error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Failed to fetch photos');
	}
};


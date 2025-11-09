import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	try {
		if (!platform?.env.DB) {
			// In development mode, return empty array
			return { photos: [] };
		}

		const result = await platform.env.DB.prepare(
			`SELECT id, filename, original_name, file_size, content_type, r2_key, 
			       uploader_name, description, upload_date, featured, category
			FROM photo_uploads
			ORDER BY upload_date DESC`
		).all();

		return {
			photos: result.results || []
		};
	} catch (err) {
		console.error('Error loading photos:', err);
		// Return empty array instead of error in development
		return { photos: [] };
	}
};


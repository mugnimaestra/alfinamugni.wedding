import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) {
		return { photos: [] };
	}

	try {
		const result = await platform.env.DB.prepare(
			`SELECT id, filename, original_name, file_size, content_type, r2_key,
			        uploader_name, description, upload_date, featured, category, session_id
			 FROM photo_uploads
			 ORDER BY upload_date DESC`
		).all();

		return {
			photos: (result.results || []).map((p: any) => ({
				id: p.id,
				title: p.description || p.original_name || 'Untitled',
				description: p.description || '',
				uploader_name: p.uploader_name || 'Anonymous',
				upload_date: p.upload_date || new Date().toISOString(),
				thumbnail: `/api/photos/${p.id}`,
				session_id: p.session_id
			}))
		};
	} catch (err) {
		console.error('Failed to load photos:', err);
		return { photos: [] };
	}
};

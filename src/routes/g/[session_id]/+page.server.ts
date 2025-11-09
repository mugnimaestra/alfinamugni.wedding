import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, platform }) => {
	if (!platform?.env.DB) {
		return { session: null, photos: [] };
	}

	try {
		const session = await platform.env.DB.prepare(
			`SELECT id, session_id, title, description, is_active, created_at
			 FROM gallery_sessions
			 WHERE session_id = ?`
		)
			.bind(params.session_id)
			.first();

		if (!session) {
			throw error(404, 'Session not found');
		}

		const photos = await platform.env.DB.prepare(
			`SELECT id, filename, original_name, file_size, content_type, r2_key,
			        uploader_name, description, upload_date, featured, category
			 FROM photo_uploads
			 WHERE session_id = ?
			 ORDER BY upload_date DESC`
		)
			.bind(params.session_id)
			.all();

		return {
			session: {
				id: session.id,
				session_id: session.session_id,
				title: session.title,
				description: session.description,
				is_active: Boolean(session.is_active)
			},
			photos: photos.results || []
		};
	} catch (err) {
		console.error('Error loading session gallery:', err);
		throw error(500, 'Failed to load session gallery');
	}
};

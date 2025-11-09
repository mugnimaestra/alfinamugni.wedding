import type { PageServerLoad } from './$types';

interface GallerySession {
	id: number;
	session_id: string;
	title: string;
	description: string | null;
	is_active: number;
	qr_code_url: string | null;
	created_at: string;
	created_by: string;
	photo_count: number;
	last_upload_at: string | null;
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) {
		return { sessions: [] };
	}

	try {
		const result = await platform.env.DB.prepare(
			`SELECT id, session_id, title, description, is_active, qr_code_url, 
			        created_at, created_by, photo_count, last_upload_at
			 FROM gallery_sessions
			 ORDER BY created_at DESC`
		).all<GallerySession>();

		return {
			sessions: result.results || []
		};
	} catch (err) {
		console.error('Failed to load sessions:', err);
		return { sessions: [] };
	}
};

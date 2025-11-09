import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { nanoid } from 'nanoid';

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

export const GET: RequestHandler = async ({ platform }) => {
	try {
		if (!platform?.env.DB) {
			throw error(500, 'Database not configured');
		}

		const result = await platform.env.DB.prepare(
			`SELECT id, session_id, title, description, is_active, qr_code_url, 
			        created_at, created_by, photo_count, last_upload_at
			 FROM gallery_sessions
			 ORDER BY created_at DESC`
		).all<GallerySession>();

		return json({
			success: true,
			sessions: result.results || []
		});
	} catch (err) {
		console.error('Fetch sessions error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Failed to fetch sessions');
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		if (!platform?.env.DB) {
			throw error(500, 'Database not configured');
		}

		const body = await request.json();
		const { title, description, prefix = 'wdng', is_active = true } = body;

		if (!title || title.trim() === '') {
			throw error(400, 'Title is required');
		}

		const sessionId = `${prefix}-${nanoid(8)}`;

		const result = await platform.env.DB.prepare(
			`INSERT INTO gallery_sessions 
			 (session_id, title, description, is_active, created_at) 
			 VALUES (?, ?, ?, ?, datetime('now'))`
		)
			.bind(sessionId, title.trim(), description?.trim() || null, is_active ? 1 : 0)
			.run();

		if (!result.success) {
			throw error(500, 'Failed to create session');
		}

		const newSession = await platform.env.DB.prepare(
			`SELECT id, session_id, title, description, is_active, qr_code_url, 
			        created_at, created_by, photo_count, last_upload_at
			 FROM gallery_sessions
			 WHERE session_id = ?`
		)
			.bind(sessionId)
			.first<GallerySession>();

		return json({
			success: true,
			session: newSession
		});
	} catch (err) {
		console.error('Create session error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Failed to create session');
	}
};

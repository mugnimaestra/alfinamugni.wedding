import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request, platform }) => {
	try {
		if (!platform?.env.DB) {
			throw error(500, 'Database not configured');
		}

		const { id } = params;
		const body = await request.json();

		const updates: string[] = [];
		const bindings: unknown[] = [];

		if (body.is_active !== undefined) {
			updates.push('is_active = ?');
			bindings.push(body.is_active ? 1 : 0);
		}

		if (body.title !== undefined) {
			updates.push('title = ?');
			bindings.push(body.title.trim());
		}

		if (body.description !== undefined) {
			updates.push('description = ?');
			bindings.push(body.description?.trim() || null);
		}

		if (updates.length === 0) {
			throw error(400, 'No valid fields to update');
		}

		bindings.push(id);

		const result = await platform.env.DB.prepare(
			`UPDATE gallery_sessions 
			 SET ${updates.join(', ')} 
			 WHERE id = ?`
		)
			.bind(...bindings)
			.run();

		if (!result.success) {
			throw error(500, 'Failed to update session');
		}

		const updatedSession = await platform.env.DB.prepare(
			`SELECT id, session_id, title, description, is_active, qr_code_url, 
			        created_at, created_by, photo_count, last_upload_at
			 FROM gallery_sessions
			 WHERE id = ?`
		)
			.bind(id)
			.first();

		if (!updatedSession) {
			throw error(404, 'Session not found');
		}

		return json({
			success: true,
			session: updatedSession
		});
	} catch (err) {
		console.error('Update session error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Failed to update session');
	}
};

export const DELETE: RequestHandler = async ({ params, platform }) => {
	try {
		if (!platform?.env.DB) {
			throw error(500, 'Database not configured');
		}

		const { id } = params;

		const result = await platform.env.DB.prepare(
			`DELETE FROM gallery_sessions WHERE id = ?`
		)
			.bind(id)
			.run();

		if (!result.success) {
			throw error(500, 'Failed to delete session');
		}

		return json({
			success: true,
			message: 'Session deleted successfully'
		});
	} catch (err) {
		console.error('Delete session error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Failed to delete session');
	}
};

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/server/database';

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		const db = getDatabase(platform);
		
		// Fetch all wishes (auto-approved)
		const wishes = await db
			.prepare('SELECT id, guest_name, message, attending, created_at FROM wishes_rsvp ORDER BY created_at DESC')
			.all();

		// Get total count only
		const counts = await db
			.prepare('SELECT COUNT(*) as total FROM wishes_rsvp')
			.first();

		return json({
			wishes: wishes.results || [],
			counts: {
				total: counts?.total || 0
			}
		});
	} catch (error) {
		console.error('Error fetching wishes:', error);
		return json({ error: 'Failed to fetch wishes' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, platform, getClientAddress }) => {
	try {
		const db = getDatabase(platform);
		const body = await request.json();
		const { guest_name, email, message, attending } = body;

		// Validate input
		if (!guest_name || !message || message.length < 2) {
			return json({ error: 'Nama dan pesan (minimal 2 karakter) wajib diisi' }, { status: 400 });
		}

		if (!attending || !['yes', 'no'].includes(attending)) {
			return json({ error: 'Konfirmasi kehadiran wajib dipilih' }, { status: 400 });
		}

		// Insert into database (auto-approved)
		const result = await db
			.prepare(
				'INSERT INTO wishes_rsvp (guest_name, email, message, attending, ip_address, approved) VALUES (?, ?, ?, ?, ?, ?)'
			)
			.bind(guest_name, email || null, message, attending, getClientAddress(), true)
			.run();

		if (!result.success) {
			throw new Error('Failed to insert wish/RSVP');
		}

		return json({ success: true, message: 'Terima kasih atas ucapan dan konfirmasi kehadiran Anda!' });
	} catch (error) {
		console.error('Error submitting wish/RSVP:', error);
		return json({ error: 'Gagal mengirim ucapan' }, { status: 500 });
	}
};


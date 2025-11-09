import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/server/database';

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		const db = getDatabase(platform);
		
		// Fetch approved wishes only
		const wishes = await db
			.prepare('SELECT id, guest_name, message, attending, created_at FROM wishes_rsvp WHERE approved = ? ORDER BY created_at DESC')
			.bind(1)
			.all();

		// Get counts
		const counts = await db
			.prepare('SELECT COUNT(*) as total, SUM(CASE WHEN attending = "yes" THEN 1 ELSE 0 END) as attending, SUM(CASE WHEN attending = "no" THEN 1 ELSE 0 END) as not_attending FROM wishes_rsvp WHERE approved = ?')
			.bind(1)
			.first();

		return json({
			wishes: wishes.results || [],
			counts: {
				total: counts?.total || 0,
				attending: counts?.attending || 0,
				notAttending: counts?.not_attending || 0
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

		// Insert into database
		const result = await db
			.prepare(
				'INSERT INTO wishes_rsvp (guest_name, email, message, attending, ip_address, approved) VALUES (?, ?, ?, ?, ?, ?)'
			)
			.bind(guest_name, email || null, message, attending, getClientAddress(), false)
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


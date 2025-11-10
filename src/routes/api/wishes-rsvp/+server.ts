import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDatabase } from '$lib/server/database';

export const GET: RequestHandler = async ({ url, platform }) => {
	try {
		const db = getDatabase(platform);
		
		// Parse pagination parameters
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
		const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '10', 10)));
		const offset = (page - 1) * limit;

		// Get total count
		const counts = await db
			.prepare('SELECT COUNT(*) as total FROM wishes_rsvp')
			.first();

		const total = counts?.total || 0;
		const totalPages = Math.ceil(total / limit);

		// Fetch paginated wishes (auto-approved)
		const wishes = await db
			.prepare('SELECT id, guest_name, message, attending, visitor_count, created_at FROM wishes_rsvp ORDER BY created_at DESC LIMIT ? OFFSET ?')
			.bind(limit, offset)
			.all();

		return json({
			wishes: wishes.results || [],
			counts: {
				total
			},
			pagination: {
				page,
				limit,
				total,
				totalPages
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
		const { guest_name, message, attending, visitor_count } = body;

		// Validate input
		if (!guest_name || !message || message.length < 2) {
			return json({ error: 'Nama dan pesan (minimal 2 karakter) wajib diisi' }, { status: 400 });
		}

		if (!attending || !['yes', 'no'].includes(attending)) {
			return json({ error: 'Konfirmasi kehadiran wajib dipilih' }, { status: 400 });
		}

		// Validate visitor_count when attending is 'yes'
		let finalVisitorCount: number | null = null;
		if (attending === 'yes') {
			const count = visitor_count !== undefined && visitor_count !== null ? Number(visitor_count) : 1;
			if (isNaN(count) || count < 1 || count > 20) {
				return json({ error: 'Jumlah pengunjung harus antara 1 dan 20' }, { status: 400 });
			}
			finalVisitorCount = count;
		}

		// Insert into database (auto-approved)
		const result = await db
			.prepare(
				'INSERT INTO wishes_rsvp (guest_name, email, message, attending, visitor_count, ip_address, approved) VALUES (?, ?, ?, ?, ?, ?, ?)'
			)
			.bind(guest_name, null, message, attending, finalVisitorCount, getClientAddress(), true)
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


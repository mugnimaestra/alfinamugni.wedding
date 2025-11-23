import type { PageServerLoad } from './$types';
import { getDatabase } from '$lib/server/database';

interface RSVPStats {
	total: number;
	yes: number;
	no: number;
	maybe: number;
	totalVisitors: number;
	recent: number;
}

interface RSVPData {
	id: number;
	guest_name: string;
	email: string | null;
	message: string;
	attending: string | null;
	visitor_count: number | null;
	approved: number;
	created_at: string;
	ip_address: string | null;
	moderated_at: string | null;
	moderated_by: string | null;
}

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) {
		return {
			rsvps: [],
			stats: {
				total: 0,
				yes: 0,
				no: 0,
				maybe: 0,
				totalVisitors: 0,
				recent: 0
			}
		};
	}

	try {
		const db = getDatabase(platform);

		// Fetch all RSVP data
		const rsvpsResult = await db
			.prepare(
				`SELECT id, guest_name, email, message, attending, visitor_count, approved, created_at, ip_address, moderated_at, moderated_by
				 FROM wishes_rsvp
				 ORDER BY created_at DESC`
			)
			.all<RSVPData>();

		const rsvps = (rsvpsResult.results || []) as RSVPData[];

		// Calculate statistics
		const totalResult = await db.prepare('SELECT COUNT(*) as count FROM wishes_rsvp').first<{ count: number }>();
		const yesResult = await db
			.prepare("SELECT COUNT(*) as count FROM wishes_rsvp WHERE attending = 'yes'")
			.first<{ count: number }>();
		const noResult = await db
			.prepare("SELECT COUNT(*) as count FROM wishes_rsvp WHERE attending = 'no'")
			.first<{ count: number }>();
		const maybeResult = await db
			.prepare("SELECT COUNT(*) as count FROM wishes_rsvp WHERE attending = 'maybe'")
			.first<{ count: number }>();
		const visitorsResult = await db
			.prepare("SELECT SUM(visitor_count) as total FROM wishes_rsvp WHERE attending = 'yes' AND visitor_count IS NOT NULL")
			.first<{ total: number | null }>();
		const recentResult = await db
			.prepare("SELECT COUNT(*) as count FROM wishes_rsvp WHERE created_at >= datetime('now', '-7 days')")
			.first<{ count: number }>();

		const stats: RSVPStats = {
			total: totalResult?.count || 0,
			yes: yesResult?.count || 0,
			no: noResult?.count || 0,
			maybe: maybeResult?.count || 0,
			totalVisitors: visitorsResult?.total || 0,
			recent: recentResult?.count || 0
		};

		return {
			rsvps,
			stats
		};
	} catch (err) {
		console.error('Failed to load RSVP data:', err);
		return {
			rsvps: [],
			stats: {
				total: 0,
				yes: 0,
				no: 0,
				maybe: 0,
				totalVisitors: 0,
				recent: 0
			}
		};
	}
};


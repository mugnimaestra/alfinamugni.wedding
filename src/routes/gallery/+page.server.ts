import type { PageServerLoad } from './$types';
import { PUBLIC_R2_URL } from '$env/static/public';

interface PhotoFromDB {
	id: number;
	filename: string;
	original_name: string;
	file_size: number;
	content_type: string;
	media_type: string | null;
	r2_key: string;
	thumbnail_url: string | null;
	public_url: string | null;
	thumbnail_public_url: string | null;
	uploader_name: string;
	description: string | null;
	upload_date: string;
	featured: number;
}

interface PhotoWithUrls extends PhotoFromDB {
	url: string;
	thumbnail: string;
}

export const load: PageServerLoad = async ({ platform }) => {
	try {
		if (!platform?.env.DB) {
			// In development mode, return empty array
			return { 
				photos: [],
				r2PublicUrl: ''
			};
		}

		const r2PublicUrl = PUBLIC_R2_URL || null;

		// Load first 30 photos for initial render
		const limit = 30;
		const result = await platform.env.DB.prepare(
			`SELECT id, filename, original_name, file_size, content_type, media_type, r2_key, 
			       thumbnail_url, public_url, thumbnail_public_url, uploader_name, description, upload_date, featured
			FROM photo_uploads
			ORDER BY upload_date DESC
			LIMIT ?`
		)
			.bind(limit)
			.all();

		// Transform photos to use public URLs from database if available, fallback to API endpoint
		const photos = ((result.results || []) as unknown as PhotoFromDB[]).map((p: PhotoFromDB): PhotoWithUrls => {
			return {
				...p,
				url: p.public_url || `/api/photos/${p.id}`,
				thumbnail: p.thumbnail_public_url
					? p.thumbnail_public_url
					: (p.thumbnail_url
						? `/api/photos/${p.id}?thumbnail=true`
						: (p.public_url
							? p.public_url
							: `/api/photos/${p.id}`))
			};
		});

		return {
			photos: photos as PhotoWithUrls[],
			r2PublicUrl: r2PublicUrl || ''
		};
	} catch (err) {
		console.error('Error loading photos:', err);
		// Return empty array instead of error in development
		return { photos: [] as PhotoWithUrls[], r2PublicUrl: '' };
	}
};


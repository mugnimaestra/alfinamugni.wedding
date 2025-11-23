import type { PageServerLoad } from './$types';
import { PUBLIC_R2_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ platform }) => {
	if (!platform?.env.DB) {
		return {
			photos: [],
			r2PublicUrl: PUBLIC_R2_URL || null
		};
	}

	try {
		const result = await platform.env.DB.prepare(
			`SELECT id, filename, original_name, file_size, content_type, media_type, r2_key,
			        thumbnail_url, public_url, thumbnail_public_url, uploader_name, description, upload_date, featured
			 FROM photo_uploads
			 ORDER BY upload_date DESC`
		).all();

		const r2PublicUrl = PUBLIC_R2_URL || null;

		interface PhotoRow {
			id: number;
			filename: string;
			original_name: string;
			file_size: number;
			content_type: string;
			media_type: string;
			r2_key: string | null;
			thumbnail_url: string | null;
			public_url: string | null;
			thumbnail_public_url: string | null;
			uploader_name: string | null;
			description: string | null;
			upload_date: string;
			featured: number;
		}

		return {
			photos: (result.results || []).map((p: unknown) => {
				const photo = p as PhotoRow;
				return {
					id: photo.id,
					title: photo.description || photo.original_name || 'Untitled',
					description: photo.description || '',
					uploader_name: photo.uploader_name || 'Anonymous',
					upload_date: photo.upload_date || new Date().toISOString(),
					thumbnail: photo.thumbnail_public_url
						? photo.thumbnail_public_url
						: (photo.thumbnail_url
							? `/api/photos/${photo.id}?thumbnail=true`
							: (photo.public_url
								? photo.public_url
								: `/api/photos/${photo.id}`))
				};
			}),
			r2PublicUrl
		};
	} catch (err) {
		console.error('Failed to load photos:', err);
		return {
			photos: [],
			r2PublicUrl: PUBLIC_R2_URL || null
		};
	}
};

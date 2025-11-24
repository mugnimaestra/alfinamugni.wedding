import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		if (!platform?.env.DB || !platform?.env.WEDDING_PHOTOS) {
			return json(
				{ success: false, error: 'Server configuration error' },
				{ status: 500 }
			);
		}

		// Get R2 credentials from environment
		const accountId = platform.env.R2_ACCOUNT_ID;
		const accessKeyId = platform.env.R2_ACCESS_KEY_ID;
		const secretAccessKey = platform.env.R2_SECRET_ACCESS_KEY;
		const bucketName = 'alfinamugni-wedding';

		if (!accountId || !accessKeyId || !secretAccessKey) {
			console.error('Missing R2 credentials:', {
				hasAccountId: !!accountId,
				hasAccessKeyId: !!accessKeyId,
				hasSecretAccessKey: !!secretAccessKey,
			});
			return json(
				{
					success: false,
					error: 'R2 API credentials not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.',
				},
				{ status: 500 }
			);
		}

		const body = await request.json();
		const { filename, contentType, fileSize } = body;

		if (!filename || !contentType) {
			return json(
				{ success: false, error: 'Filename and content type are required' },
				{ status: 400 }
			);
		}

		// Validate file type
		const isImage = contentType.startsWith('image/');
		const isVideoType = contentType.startsWith('video/');

		if (!isImage && !isVideoType) {
			return json(
				{ success: false, error: 'Only image and video files are allowed' },
				{ status: 400 }
			);
		}

		// Generate unique keys for R2
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(7);
		const extension = filename.split('.').pop() || (isVideoType ? 'mp4' : 'jpg');
		const mainKey = `photos/${new Date().toISOString().split('T')[0]}/${timestamp}-${randomStr}.${extension}`;
		const thumbnailKey = `thumbnails/${new Date().toISOString().split('T')[0]}/${timestamp}-${randomStr}.${extension}`;

		// Configure S3Client for R2
		const s3Client = new S3Client({
			region: 'auto', // R2 uses 'auto' for region
			endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
		});

		// Generate presigned URL for main file
		const mainCommand = new PutObjectCommand({
			Bucket: bucketName,
			Key: mainKey,
			ContentType: contentType,
		});

		const mainPresignedUrl = await getSignedUrl(s3Client, mainCommand, {
			expiresIn: 900, // 15 minutes
			signableHeaders: new Set(['content-type']), // Enforce Content-Type matching
		});

		// Generate presigned URL for thumbnail (always JPEG)
		const thumbnailCommand = new PutObjectCommand({
			Bucket: bucketName,
			Key: thumbnailKey,
			ContentType: 'image/jpeg',
		});

		const thumbnailPresignedUrl = await getSignedUrl(s3Client, thumbnailCommand, {
			expiresIn: 900, // 15 minutes
			signableHeaders: new Set(['content-type']),
		});

		return json({
			success: true,
			data: {
				mainKey,
				thumbnailKey,
				// Direct R2 presigned URLs (not Worker endpoints)
				presignedUrl: mainPresignedUrl,
				thumbnailPresignedUrl,
				expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes from now
			},
		});
	} catch (err) {
		console.error('Presigned URL error:', err);
		const errorMessage = err instanceof Error ? err.message : 'Failed to generate upload URL';
		return json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
};

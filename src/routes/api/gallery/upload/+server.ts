import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_R2_URL } from '$env/static/public';
import { getRandomPlaceholder } from '$lib/utils/placeholders';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		if (!platform?.env.DB || !platform?.env.WEDDING_PHOTOS) {
			return json(
				{ success: false, error: 'Server configuration error' },
				{ status: 500 }
			);
		}

		const formData = await request.formData();
		const file = formData.get('file') as File;
		const uploaderName = (formData.get('uploader_name') as string) || getRandomPlaceholder();
		const description = (formData.get('description') as string) || '';
		
		// ProcessedImage metadata
		const originalSize = parseInt(formData.get('original_size') as string) || file.size;
		const compressedSize = file.size;
		const compressionRatio = originalSize > 0 ? originalSize / compressedSize : 1;
		const deviceInfo = (formData.get('device_info') as string) || 'Unknown';
		const networkInfo = (formData.get('network_info') as string) || 'Unknown';
		const width = parseInt(formData.get('width') as string) || 0;
		const height = parseInt(formData.get('height') as string) || 0;

		if (!file) {
			return json(
				{ success: false, error: 'No file provided' },
				{ status: 400 }
			);
		}

		// Validate file type
		const isImage = file.type.startsWith('image/');
		const isVideo = file.type.startsWith('video/');

		if (!isImage && !isVideo) {
			return json(
				{ success: false, error: 'Only image and video files are allowed' },
				{ status: 400 }
			);
		}

		// Determine media_type
		const mediaType = isVideo ? 'video' : 'image';

		// Validate file size (max 20MB for images, 100MB for videos)
		const maxSize = isVideo ? 100 * 1024 * 1024 : 20 * 1024 * 1024;
		if (file.size > maxSize) {
			const maxSizeMB = isVideo ? '100MB' : '20MB';
			return json(
				{ success: false, error: `File too large (max ${maxSizeMB})` },
				{ status: 400 }
			);
		}

		// Generate unique keys for R2
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(7);
		const extension = file.name.split('.').pop() || 'jpg';
		const mainKey = `photos/${new Date().toISOString().split('T')[0]}/${timestamp}-${randomStr}.${extension}`;
		const thumbnailKey = `thumbnails/${new Date().toISOString().split('T')[0]}/${timestamp}-${randomStr}.${extension}`;

		// Upload main image to R2
		try {
			await platform.env.WEDDING_PHOTOS.put(mainKey, await file.arrayBuffer(), {
				httpMetadata: {
					contentType: file.type
				}
			});
		} catch (r2Error) {
			console.error('R2 upload error:', r2Error);
			return json(
				{ success: false, error: 'Failed to upload file to storage. Please try again.' },
				{ status: 500 }
			);
		}

		// Note: Thumbnail should be uploaded separately by the client
		// Here we just store the thumbnail key for future use
		const thumbnailFile = formData.get('thumbnail') as File | null;
		let actualThumbnailKey: string | null = thumbnailKey;
		
		if (!thumbnailFile) {
			actualThumbnailKey = null;
		}
		
		if (thumbnailFile) {
			try {
				await platform.env.WEDDING_PHOTOS.put(thumbnailKey, await thumbnailFile.arrayBuffer(), {
					httpMetadata: {
						contentType: thumbnailFile.type
					}
				});
			} catch (r2Error) {
				console.error('Thumbnail upload error:', r2Error);
				// Continue without thumbnail if it fails
			}
		}

		// Save metadata to D1
		let result;
		try {
			result = await platform.env.DB.prepare(
				`INSERT INTO photo_uploads 
				(filename, original_name, file_size, compressed_size, original_size, compression_ratio,
				 content_type, media_type, bucket_path, r2_key, thumbnail_url, uploader_name, description, 
				 upload_date, device_info, network_info, width, height)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)`
			)
				.bind(
					file.name,
					file.name,
					file.size,
					compressedSize,
					originalSize,
					compressionRatio,
					file.type,
					mediaType,
					mainKey,
					mainKey,
					actualThumbnailKey,
					uploaderName,
					description,
					deviceInfo,
					networkInfo,
					width,
					height
				)
				.run();
		} catch (dbError) {
			console.error('Database error:', dbError);
			return json(
				{ success: false, error: 'Failed to save file metadata. Please try again.' },
				{ status: 500 }
			);
		}

		const photoId = result.meta?.last_row_id;
		if (!photoId) {
			return json(
				{ success: false, error: 'Failed to get photo ID after upload' },
				{ status: 500 }
			);
		}

		// Populate public_url and thumbnail_public_url if PUBLIC_R2_URL is configured
		const r2PublicUrl = PUBLIC_R2_URL;
		if (r2PublicUrl) {
			try {
				const publicUrl = `${r2PublicUrl}/${mainKey}`;
				const thumbnailPublicUrl = actualThumbnailKey ? `${r2PublicUrl}/${actualThumbnailKey}` : null;

				await platform.env.DB.prepare(
					`UPDATE photo_uploads 
					 SET public_url = ?, thumbnail_public_url = ?
					 WHERE id = ?`
				)
					.bind(publicUrl, thumbnailPublicUrl, photoId)
					.run();
			} catch (updateError) {
				console.error('Failed to update public URLs:', updateError);
				// Continue anyway - migration 0009 can populate these later
			}
		}

		return json({
			success: true,
			message: 'Photo uploaded successfully',
			data: {
				id: photoId,
				filename: file.name,
				original_name: file.name,
				file_size: file.size,
				upload_date: new Date().toISOString(),
				preview_url: `/api/photos/${photoId}`,
				r2_key: mainKey,
				thumbnail_url: actualThumbnailKey,
				public_url: r2PublicUrl ? `${r2PublicUrl}/${mainKey}` : null,
				thumbnail_public_url: r2PublicUrl && actualThumbnailKey ? `${r2PublicUrl}/${actualThumbnailKey}` : null,
				compression_ratio: compressionRatio.toFixed(2),
				device_info: deviceInfo,
				network_info: networkInfo
			}
		});
	} catch (err) {
		console.error('Upload error:', err);
		const errorMessage = err instanceof Error ? err.message : 'Upload failed';
		return json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
};


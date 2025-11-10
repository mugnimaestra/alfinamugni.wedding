import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		if (!platform?.env.DB || !platform?.env.WEDDING_PHOTOS) {
			throw error(500, 'Server configuration error');
		}

		const formData = await request.formData();
		const file = formData.get('file') as File;
		const uploaderName = (formData.get('uploader_name') as string) || 'Anonymous';
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
			throw error(400, 'No file provided');
		}

		// Validate file type
		if (!file.type.startsWith('image/')) {
			throw error(400, 'Only image files are allowed');
		}

		// Validate file size (max 20MB)
		const maxSize = 20 * 1024 * 1024;
		if (file.size > maxSize) {
			throw error(400, 'File too large (max 20MB)');
		}

		// Generate unique keys for R2
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(7);
		const extension = file.name.split('.').pop() || 'jpg';
		const mainKey = `photos/${new Date().toISOString().split('T')[0]}/${timestamp}-${randomStr}.${extension}`;
		const thumbnailKey = `thumbnails/${new Date().toISOString().split('T')[0]}/${timestamp}-${randomStr}.${extension}`;

		// Upload main image to R2
		await platform.env.WEDDING_PHOTOS.put(mainKey, file.stream(), {
			httpMetadata: {
				contentType: file.type
			}
		});

		// Note: Thumbnail should be uploaded separately by the client
		// Here we just store the thumbnail key for future use
		const thumbnailFile = formData.get('thumbnail') as File | null;
		let actualThumbnailKey = thumbnailKey;
		
		if (thumbnailFile) {
			await platform.env.WEDDING_PHOTOS.put(thumbnailKey, thumbnailFile.stream(), {
				httpMetadata: {
					contentType: thumbnailFile.type
				}
			});
		}

		// Save metadata to D1
		const result = await platform.env.DB.prepare(
			`INSERT INTO photo_uploads 
			(filename, original_name, file_size, compressed_size, original_size, compression_ratio,
			 content_type, bucket_path, r2_key, thumbnail_url, uploader_name, description, 
			 upload_date, device_info, network_info, width, height)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)`
		)
			.bind(
				file.name,
				file.name,
				file.size,
				compressedSize,
				originalSize,
				compressionRatio,
				file.type,
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

		return json({
			success: true,
			message: 'Photo uploaded successfully',
			data: {
				id: result.meta?.last_row_id,
				filename: file.name,
				original_name: file.name,
				file_size: file.size,
				upload_date: new Date().toISOString(),
				preview_url: `/api/photos/${result.meta?.last_row_id}`,
				r2_key: mainKey,
				thumbnail_url: actualThumbnailKey,
				compression_ratio: compressionRatio.toFixed(2),
				device_info: deviceInfo,
				network_info: networkInfo
			}
		});
	} catch (err) {
		console.error('Upload error:', err);
		if (err instanceof Error) {
			throw error(500, err.message);
		}
		throw error(500, 'Upload failed');
	}
};


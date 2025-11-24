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

		const body = await request.json();
		const {
			mainKey,
			thumbnailKey,
			filename,
			originalName,
			fileSize,
			compressedSize,
			originalSize,
			contentType,
			mediaType,
			uploaderName,
			description,
			deviceInfo,
			networkInfo,
			width,
			height
		} = body;

		if (!mainKey || !filename || !contentType) {
			return json(
				{ success: false, error: 'Missing required fields' },
				{ status: 400 }
			);
		}

		// Verify file exists in R2
		const fileObject = await platform.env.WEDDING_PHOTOS.head(mainKey);
		if (!fileObject) {
			return json(
				{ success: false, error: 'File not found in storage. Please upload again.' },
				{ status: 404 }
			);
		}

		// Calculate compression ratio
		const compressionRatio = originalSize > 0 && compressedSize > 0 
			? originalSize / compressedSize 
			: 1;

		// Use provided values or defaults
		const finalUploaderName = uploaderName || getRandomPlaceholder();
		const finalDescription = description || '';
		const finalDeviceInfo = deviceInfo || 'Unknown';
		const finalNetworkInfo = networkInfo || 'Unknown';
		const finalWidth = width || 0;
		const finalHeight = height || 0;
		const finalMediaType = mediaType || (contentType.startsWith('video/') ? 'video' : 'image');
		const finalThumbnailKey = thumbnailKey || null;

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
					filename,
					originalName || filename,
					fileSize,
					compressedSize || fileSize,
					originalSize || fileSize,
					compressionRatio,
					contentType,
					finalMediaType,
					mainKey,
					mainKey,
					finalThumbnailKey,
					finalUploaderName,
					finalDescription,
					finalDeviceInfo,
					finalNetworkInfo,
					finalWidth,
					finalHeight
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
				const thumbnailPublicUrl = finalThumbnailKey ? `${r2PublicUrl}/${finalThumbnailKey}` : null;

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
				filename,
				original_name: originalName || filename,
				file_size: fileSize,
				upload_date: new Date().toISOString(),
				preview_url: `/api/photos/${photoId}`,
				r2_key: mainKey,
				thumbnail_url: finalThumbnailKey,
				public_url: r2PublicUrl ? `${r2PublicUrl}/${mainKey}` : null,
				thumbnail_public_url: r2PublicUrl && finalThumbnailKey ? `${r2PublicUrl}/${finalThumbnailKey}` : null,
				compression_ratio: compressionRatio.toFixed(2),
				device_info: finalDeviceInfo,
				network_info: finalNetworkInfo
			}
		});
	} catch (err) {
		console.error('Complete upload error:', err);
		const errorMessage = err instanceof Error ? err.message : 'Upload completion failed';
		return json(
			{ success: false, error: errorMessage },
			{ status: 500 }
		);
	}
};


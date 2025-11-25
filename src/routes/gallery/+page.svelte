<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import GalleryMasonry from '$lib/components/gallery/GalleryMasonry.svelte';
	import FloatingUploadButton from '$lib/components/gallery/FloatingUploadButton.svelte';
	import PhotoUpload from '$lib/components/gallery/PhotoUpload.svelte';
	import MediaLightbox from '$lib/components/gallery/MediaLightbox.svelte';
	import MediaSourcePicker from '$lib/components/gallery/MediaSourcePicker.svelte';
	import UploadProgressBar from '$lib/components/gallery/UploadProgressBar.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { getDeviceInfo, getNetworkInfo } from '$lib/utils/device';
	import { VideoThumbnailExtractor } from '$lib/utils/image-processor';
	import { getRandomPlaceholder } from '$lib/utils/placeholders';
	import { hashStore } from '$lib/stores/hashStore';
	import {
		getCurrentMediaId,
		openMediaModal,
		updateMediaHash,
		removeMediaHash
	} from '$lib/utils/hashModal';

	interface Photo {
		id: number;
		filename: string;
		original_name: string;
		uploader_name: string;
		description: string;
		upload_date: string;
		r2_key: string;
		content_type?: string;
		media_type?: string;
		thumbnail_url?: string;
		url: string;
		thumbnail: string;
	}

	interface TransformedPhoto {
		id: number;
		url: string;
		thumbnail: string;
		description: string;
		uploader_name: string;
		upload_date: string;
		content_type: string;
		media_type: string;
	}

	interface UploadPayload {
		files: File[];
		uploaderName: string;
		description: string;
		previews: string[];
	}

	interface FailedFile {
		file: File;
		error: string;
		preview: string;
	}

	let { data }: { data: PageData } = $props();

	let showMediaSourcePicker = $state(false);
	let showUploadModal = $state(false);
	let preSelectedFiles = $state<File[] | undefined>(undefined);
	let additionalFiles = $state<File[] | undefined>(undefined);
	let selectedPhotoIndex = $state(-1);
	let showPhotoModal = $state(false);

	// Upload progress state
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let currentFileIndex = $state(0);
	let currentFileName = $state('');
	let currentFileProgress = $state(0);
	let totalFiles = $state(0);

	const transformedPhotos = $derived(
		data.photos.map((p: Photo): TransformedPhoto => ({
			id: p.id,
			url: p.url,
			thumbnail: p.thumbnail,
			description: p.description || '',
			uploader_name: p.uploader_name || getRandomPlaceholder(),
			upload_date: p.upload_date,
			content_type: p.content_type || 'image/jpeg',
			media_type: p.media_type || (p.content_type?.startsWith('video/') ? 'video' : 'image'),
		}))
	);

	function handlePhotoClick(photo: TransformedPhoto) {
		const index = transformedPhotos.findIndex((p) => p.id === photo.id);
		if (index !== -1) {
			selectedPhotoIndex = index;
			showPhotoModal = true;
			// Set hash when opening modal (adds to history for back button)
			openMediaModal(photo.id);
		}
	}

	function handleCloseModal() {
		selectedPhotoIndex = -1;
		showPhotoModal = false;
		// Remove hash from URL when closing modal
		if (browser) {
			removeMediaHash();
		}
	}

	function handleSlideChange(photoId: number) {
		// Update hash when user navigates between slides (without adding to history)
		updateMediaHash(photoId, true);
	}

	function openPhotoFromHash(mediaId: number) {
		// Find photo by ID
		const index = transformedPhotos.findIndex((p) => p.id === mediaId);
		if (index !== -1) {
			selectedPhotoIndex = index;
			showPhotoModal = true;
		} else {
			// Photo not found (deleted or invalid) - silently remove hash
			removeMediaHash();
		}
	}

	async function getMediaDimensions(
		file: File,
		preview: string
	): Promise<{ width: number; height: number }> {
		try {
			if (file.type.startsWith('video/')) {
				return new Promise((resolve) => {
					const video = document.createElement('video');
					let timeoutId: ReturnType<typeof setTimeout>;

					const cleanup = () => {
						clearTimeout(timeoutId);
						if (video.src.startsWith('blob:')) {
							URL.revokeObjectURL(video.src);
						}
					};

					video.onloadedmetadata = () => {
						resolve({
							width: video.videoWidth || 0,
							height: video.videoHeight || 0,
						});
						cleanup();
					};
					video.onerror = () => {
						resolve({ width: 0, height: 0 });
						cleanup();
					};

					video.src = preview;

					timeoutId = setTimeout(() => {
						resolve({ width: 0, height: 0 });
						cleanup();
					}, 5000);
				});
			} else {
				return new Promise((resolve) => {
					const img = new Image();
					let timeoutId: ReturnType<typeof setTimeout>;

					const cleanup = () => {
						clearTimeout(timeoutId);
						if (img.src.startsWith('blob:')) {
							URL.revokeObjectURL(img.src);
						}
					};

					img.onload = () => {
						resolve({
							width: img.width || 0,
							height: img.height || 0,
						});
						cleanup();
					};
					img.onerror = () => {
						resolve({ width: 0, height: 0 });
						cleanup();
					};

					img.src = preview;

					timeoutId = setTimeout(() => {
						resolve({ width: 0, height: 0 });
						cleanup();
					}, 5000);
				});
			}
		} catch (err) {
			console.error('Failed to get media dimensions:', err);
			return { width: 0, height: 0 };
		}
	}

	async function uploadSingleFile(
		file: File,
		preview: string,
		uploaderName: string,
		description: string,
		onProgress?: (progress: number) => void
	): Promise<{ success: boolean; error?: string }> {
		const deviceInfo = getDeviceInfo();
		const networkInfo = getNetworkInfo();
		const originalSize = file.size;

		try {
			// Step 1: Request presigned URL
			const presignedResponse = await fetch('/api/gallery/presigned-url', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					filename: file.name,
					contentType: file.type,
					fileSize: file.size,
				}),
			});

			if (!presignedResponse.ok) {
				const errorData = await presignedResponse.json().catch(() => ({}));
				return {
					success: false,
					error: errorData.error || `Failed to get upload URL (${presignedResponse.status})`,
				};
			}

			const presignedData = await presignedResponse.json();
			if (!presignedData.success || !presignedData.data) {
				return {
					success: false,
					error: presignedData.error || 'Failed to get upload URL',
				};
			}

			const { presignedUrl, thumbnailPresignedUrl, mainKey, thumbnailKey } = presignedData.data;

			// Step 2: Get media dimensions
			let dimensions = { width: 0, height: 0 };
			try {
				dimensions = await getMediaDimensions(file, preview);
			} catch (err) {
				console.error('Failed to get media dimensions:', err);
			}

			// Step 3: Upload main file directly to R2 using presigned URL
			const uploadProgress = (progress: number) => {
				if (onProgress) {
					// For large files, we'll track progress at 90% for main file upload
					// Remaining 10% is for thumbnail and metadata
					onProgress(progress * 0.9);
				}
			};

			const uploadResult = await uploadFileWithProgress(
				presignedUrl,
				file,
				file.type,
				uploadProgress
			);

			if (!uploadResult.success) {
				return uploadResult;
			}

			// Step 4: Upload thumbnail if it's a video
			let thumbnailBlob: Blob | null = null;
			if (VideoThumbnailExtractor.isVideoFile(file)) {
				try {
					thumbnailBlob = await VideoThumbnailExtractor.extractThumbnail(file);
					if (thumbnailBlob && thumbnailPresignedUrl) {
						const thumbnailProgress = (progress: number) => {
							if (onProgress) {
								// Thumbnail upload is 5% of total progress (90-95%)
								onProgress(90 + progress * 0.05);
							}
						};

						const thumbnailResult = await uploadFileWithProgress(
							thumbnailPresignedUrl,
							thumbnailBlob,
							'image/jpeg',
							thumbnailProgress
						);

						if (!thumbnailResult.success) {
							console.warn('Thumbnail upload failed, continuing without thumbnail');
						}
					}
				} catch (err) {
					console.error('Failed to generate or upload thumbnail:', err);
					// Continue without thumbnail
				}
			}

			// Step 5: Complete upload by saving metadata
			if (onProgress) {
				onProgress(95); // Metadata save is 95-100%
			}

			const completeResponse = await fetch('/api/gallery/complete-upload', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					mainKey,
					thumbnailKey: thumbnailBlob ? thumbnailKey : null,
					filename: file.name,
					originalName: file.name,
					fileSize: file.size,
					compressedSize: file.size,
					originalSize,
					contentType: file.type,
					mediaType: file.type.startsWith('video/') ? 'video' : 'image',
					uploaderName,
					description,
					deviceInfo,
					networkInfo,
					width: dimensions.width,
					height: dimensions.height,
				}),
			});

			if (!completeResponse.ok) {
				const errorData = await completeResponse.json().catch(() => ({}));
				return {
					success: false,
					error: errorData.error || `Failed to complete upload (${completeResponse.status})`,
				};
			}

			const completeData = await completeResponse.json();
			if (!completeData.success) {
				return {
					success: false,
					error: completeData.error || 'Failed to complete upload',
				};
			}

			if (onProgress) {
				onProgress(100);
			}

			return { success: true };
		} catch (err) {
			console.error('Upload error:', err);
			return {
				success: false,
				error: err instanceof Error ? err.message : 'Upload failed',
			};
		}
	}

	// Helper function to upload file with progress tracking
	// Uploads directly to R2 presigned URL (not through Workers)
	function uploadFileWithProgress(
		presignedUrl: string,
		file: File | Blob,
		contentType: string,
		onProgress?: (progress: number) => void
	): Promise<{ success: boolean; error?: string }> {
		return new Promise((resolve) => {
			const xhr = new XMLHttpRequest();

			// Track upload progress
			if (onProgress) {
				xhr.upload.addEventListener('progress', (event) => {
					if (event.lengthComputable) {
						const progress = (event.loaded / event.total) * 100;
						onProgress(progress);
					}
				});
			}

			// Handle response
			xhr.addEventListener('load', () => {
				// R2 returns 200 OK with empty body on successful PUT
				// No JSON response, so we check status code only
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve({ success: true });
				} else {
					let errorMessage = `Upload failed (${xhr.status})`;
					// R2 might return XML error messages
					if (xhr.responseText) {
						// Try to extract error message from XML if present
						const xmlMatch = xhr.responseText.match(/<Message>(.*?)<\/Message>/);
						if (xmlMatch) {
							errorMessage = xmlMatch[1];
						} else {
							errorMessage = xhr.responseText.substring(0, 200);
						}
					}
					resolve({ success: false, error: errorMessage });
				}
			});

			// Handle errors
			xhr.addEventListener('error', () => {
				resolve({ success: false, error: 'Network error. Please check your connection.' });
			});

			xhr.addEventListener('abort', () => {
				resolve({ success: false, error: 'Upload cancelled' });
			});

			// Send PUT request directly to R2 presigned URL
			// Content-Type header must match what was signed in the presigned URL
			xhr.open('PUT', presignedUrl);
			xhr.setRequestHeader('Content-Type', contentType);
			xhr.send(file);
		});
	}

	async function handleUploadStart(payload: UploadPayload) {
		const { files, uploaderName, description, previews } = payload;
		totalFiles = files.length;

		// Initialize upload progress state
		isUploading = true;
		uploadProgress = 0;
		currentFileIndex = 0;
		currentFileProgress = 0;

		// Show initial loading toast
		const toastId = toast.loading('Preparing upload...', {
			description: `${totalFiles} ${totalFiles === 1 ? 'file' : 'files'} selected`,
		});

		let successCount = 0;
		let failedCount = 0;
		const failedFiles: FailedFile[] = [];

		// Upload files one by one
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const preview = previews[i];

			// Update current file info
			currentFileIndex = i;
			currentFileName = file.name;
			currentFileProgress = 0;

			// Update toast with progress
			toast.loading(`Uploading ${i + 1}/${totalFiles}...`, {
				id: toastId,
				description: `${successCount} uploaded, ${failedCount} failed`,
			});

			// Upload with progress tracking
			const result = await uploadSingleFile(
				file,
				preview,
				uploaderName,
				description,
				(progress) => {
					currentFileProgress = progress;
					// Calculate overall progress: (completed files + current file progress) / total files
					const completedFiles = successCount + failedCount;
					uploadProgress = ((completedFiles + progress / 100) / totalFiles) * 100;
				}
			);

			if (result.success) {
				successCount++;
				currentFileProgress = 100;
			} else {
				failedCount++;
				failedFiles.push({
					file,
					error: result.error || 'Unknown error',
					preview,
				});
			}

			// Update overall progress after file completes
			uploadProgress = ((successCount + failedCount) / totalFiles) * 100;
		}

		// Reset upload state
		isUploading = false;
		currentFileProgress = 0;

		// Clean up preview URLs
		previews.forEach((url) => {
			if (url && url.startsWith('blob:')) {
				URL.revokeObjectURL(url);
			}
		});

		// Show final toast based on results
		if (failedCount === 0) {
			// All successful
			const messages = [
				`🎉 ${successCount} ${
					successCount === 1 ? 'foto' : 'foto'
				} berhasil diunggah! Terima kasih sudah berbagi kebahagiaan!`,
				`✨ Wow! ${successCount} momen indah telah ditambahkan ke galeri!`,
				`💕 Terima kasih! ${successCount} foto baru telah tersimpan dengan indah!`,
				`🌟 Luar biasa! ${successCount} kenangan baru telah mempercantik galeri kami!`,
			];
			const message = messages[Math.floor(Math.random() * messages.length)];

			toast.success(message, {
				id: toastId,
				description: 'Foto Anda sekarang sudah ada di galeri',
				duration: 5000,
			});
		} else if (successCount > 0) {
			// Partial success
			const failedFileNames = failedFiles
				.map((f) => f.file.name)
				.slice(0, 3)
				.join(', ');
			const moreText = failedFiles.length > 3 ? ` dan ${failedFiles.length - 3} lainnya` : '';

			toast.warning(`Upload selesai: ${successCount} berhasil, ${failedCount} gagal`, {
				id: toastId,
				description: `Gagal: ${failedFileNames}${moreText}`,
				action: {
					label: 'Ulangi yang Gagal',
					onClick: () => retryFailedUploads(failedFiles, uploaderName, description),
				},
				duration: 8000,
			});
		} else {
			// All failed
			toast.error(
				`Upload gagal: ${failedCount} ${failedCount === 1 ? 'file' : 'files'} gagal diunggah`,
				{
					id: toastId,
					description: failedFiles[0]?.error || 'Silakan coba lagi',
					action: {
						label: 'Ulangi',
						onClick: () => retryFailedUploads(failedFiles, uploaderName, description),
					},
					duration: 8000,
				}
			);
		}

		// Refresh gallery if any upload succeeded
		if (successCount > 0) {
			await invalidateAll();
		}
	}

	async function retryFailedUploads(
		failedFiles: FailedFile[],
		uploaderName: string,
		description: string
	) {
		totalFiles = failedFiles.length;

		// Initialize upload progress state for retry
		isUploading = true;
		uploadProgress = 0;
		currentFileIndex = 0;
		currentFileProgress = 0;

		const toastId = toast.loading(
			`Mengulangi upload ${totalFiles} ${totalFiles === 1 ? 'file' : 'files'}...`
		);

		let successCount = 0;
		let failedCount = 0;
		const stillFailedFiles: FailedFile[] = [];

		for (let i = 0; i < failedFiles.length; i++) {
			const { file, preview } = failedFiles[i];

			// Update current file info
			currentFileIndex = i;
			currentFileName = file.name;
			currentFileProgress = 0;

			toast.loading(`Mengulangi ${i + 1}/${totalFiles}...`, {
				id: toastId,
				description: `${successCount} berhasil, ${failedCount} masih gagal`,
			});

			// Upload with progress tracking
			const result = await uploadSingleFile(
				file,
				preview,
				uploaderName,
				description,
				(progress) => {
					currentFileProgress = progress;
					// Calculate overall progress: (completed files + current file progress) / total files
					const completedFiles = successCount + failedCount;
					uploadProgress = ((completedFiles + progress / 100) / totalFiles) * 100;
				}
			);

			if (result.success) {
				successCount++;
				currentFileProgress = 100;
			} else {
				failedCount++;
				stillFailedFiles.push({
					file,
					error: result.error || 'Unknown error',
					preview,
				});
			}

			// Update overall progress after file completes
			uploadProgress = ((successCount + failedCount) / totalFiles) * 100;
		}

		// Reset upload state
		isUploading = false;
		currentFileProgress = 0;

		// Clean up preview URLs
		failedFiles.forEach(({ preview }) => {
			if (preview && preview.startsWith('blob:')) {
				URL.revokeObjectURL(preview);
			}
		});

		// Show retry results
		if (failedCount === 0) {
			toast.success(`🎉 Semua file berhasil diunggah!`, {
				id: toastId,
				description: `${successCount} ${successCount === 1 ? 'file' : 'files'} berhasil diunggah`,
				duration: 5000,
			});
		} else {
			const failedFileNames = stillFailedFiles
				.map((f) => f.file.name)
				.slice(0, 3)
				.join(', ');
			const moreText =
				stillFailedFiles.length > 3 ? ` dan ${stillFailedFiles.length - 3} lainnya` : '';

			toast.error(`Masih ada ${failedCount} ${failedCount === 1 ? 'file' : 'files'} yang gagal`, {
				id: toastId,
				description: `Gagal: ${failedFileNames}${moreText}`,
				duration: 8000,
			});
		}

		// Refresh gallery if any upload succeeded
		if (successCount > 0) {
			await invalidateAll();
		}
	}

	function handleSourceSelected(files: FileList) {
		if (showUploadModal) {
			// Append mode - PhotoUpload modal sudah open
			additionalFiles = Array.from(files);
		} else {
			// Initial mode - buka PhotoUpload modal
			preSelectedFiles = Array.from(files);
			showUploadModal = true;
		}
		// Close bottomsheet
		showMediaSourcePicker = false;
	}

	function handleRequestMoreFiles() {
		showMediaSourcePicker = true;
	}

	function handleUploadModalClose() {
		showUploadModal = false;
		// Clear preSelectedFiles and additionalFiles after modal closes
		preSelectedFiles = undefined;
		additionalFiles = undefined;
	}

	// Remove cover-active class to enable scrolling
	onMount(() => {
		document.body.classList.remove('cover-active');

		// Check hash on mount and open modal if valid media ID exists
		if (browser) {
			const mediaId = getCurrentMediaId();
			if (mediaId) {
				openPhotoFromHash(mediaId);
			}

			// Listen to hash changes (for back button support)
			const unsubscribe = hashStore.subscribe((hash) => {
				const mediaId = getCurrentMediaId();
				if (mediaId) {
					// Hash exists - open modal with that media
					if (!showPhotoModal || selectedPhotoIndex < 0) {
						openPhotoFromHash(mediaId);
					} else {
						// Modal is already open, check if we need to switch to different photo
						const currentPhoto = transformedPhotos[selectedPhotoIndex];
						if (currentPhoto && currentPhoto.id !== mediaId) {
							openPhotoFromHash(mediaId);
						}
					}
				} else {
					// Hash removed - close modal
					if (showPhotoModal) {
						selectedPhotoIndex = -1;
						showPhotoModal = false;
					}
				}
			});

			// Cleanup subscription on component destroy
			return () => {
				unsubscribe();
			};
		}
	});
</script>

<svelte:head>
	<title>Gallery - Alfina & Mugni Wedding</title>
	<meta
		name="description"
		content="Share and view beautiful moments from Alfina & Mugni's wedding"
	/>
</svelte:head>

<main class="min-h-screen bg-gradient-to-b from-wedding-cream to-white px-4 py-12">
	<div class="mx-auto max-w-[1920px]">
		<div class="mb-12 text-center">
			<h1 class="font-serif text-4xl font-light text-wedding-brown md:text-6xl">Wedding Gallery</h1>
			<p class="mt-4 text-xl text-wedding-text-muted md:text-2xl">
				Scroll through beautiful moments • Tap to upload yours
			</p>
		</div>

		<GalleryMasonry initialPhotos={transformedPhotos} onPhotoClick={handlePhotoClick} />
	</div>
</main>

<FloatingUploadButton onclick={() => (showMediaSourcePicker = true)} />

<MediaSourcePicker
	isOpen={showMediaSourcePicker}
	onClose={() => (showMediaSourcePicker = false)}
	onFilesSelected={handleSourceSelected}
/>

<PhotoUpload
	isOpen={showUploadModal}
	onClose={handleUploadModalClose}
	onUploadStart={handleUploadStart}
	{preSelectedFiles}
	onRequestMoreFiles={handleRequestMoreFiles}
	{additionalFiles}
/>

<MediaLightbox
	photos={transformedPhotos}
	currentIndex={selectedPhotoIndex}
	isOpen={showPhotoModal}
	onClose={handleCloseModal}
	onSlideChange={handleSlideChange}
/>

<UploadProgressBar
	isVisible={isUploading}
	overallProgress={uploadProgress}
	{currentFileIndex}
	{totalFiles}
	{currentFileName}
	{currentFileProgress}
/>

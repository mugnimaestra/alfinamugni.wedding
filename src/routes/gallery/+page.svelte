<script lang="ts">
	import { onMount } from 'svelte';
	import GalleryMasonry from '$lib/components/gallery/GalleryMasonry.svelte';
	import FloatingUploadButton from '$lib/components/gallery/FloatingUploadButton.svelte';
	import PhotoUpload from '$lib/components/gallery/PhotoUpload.svelte';
	import MediaLightbox from '$lib/components/gallery/MediaLightbox.svelte';
	import MediaSourcePicker from '$lib/components/gallery/MediaSourcePicker.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { getDeviceInfo, getNetworkInfo } from '$lib/utils/device';
	import { VideoThumbnailExtractor } from '$lib/utils/image-processor';

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

	const transformedPhotos = $derived(
		data.photos.map((p: Photo): TransformedPhoto => ({
			id: p.id,
			url: p.url,
			thumbnail: p.thumbnail,
			description: p.description || '',
			uploader_name: p.uploader_name || 'Anonymous',
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
		}
	}

	function handleCloseModal() {
		selectedPhotoIndex = -1;
		showPhotoModal = false;
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
		description: string
	): Promise<{ success: boolean; error?: string }> {
		const formData = new FormData();
		const deviceInfo = getDeviceInfo();
		const networkInfo = getNetworkInfo();

		formData.append('file', file);
		formData.append('uploader_name', uploaderName);
		formData.append('description', description);
		formData.append('device_info', deviceInfo);
		formData.append('network_info', networkInfo);
		formData.append('original_size', file.size.toString());

		try {
			const dimensions = await getMediaDimensions(file, preview);
			formData.append('width', dimensions.width.toString());
			formData.append('height', dimensions.height.toString());
		} catch (err) {
			console.error('Failed to get media dimensions:', err);
			formData.append('width', '0');
			formData.append('height', '0');
		}

		// Generate thumbnail for video files
		if (VideoThumbnailExtractor.isVideoFile(file)) {
			try {
				const thumbnailBlob = await VideoThumbnailExtractor.extractThumbnail(file);
				formData.append('thumbnail', thumbnailBlob, `${file.name}-thumb.jpg`);
			} catch (err) {
				console.error('Failed to generate video thumbnail:', err);
				// Continue upload without thumbnail
			}
		}

		try {
			const response = await fetch('/api/gallery/upload', {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				let errorMessage = `Upload failed (${response.status})`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorData.message || errorMessage;
				} catch {
					try {
						const text = await response.text();
						if (text) errorMessage = text;
					} catch {
						// Use default error message
					}
				}
				return { success: false, error: errorMessage };
			}

			const result = await response.json();
			console.log('Upload result:', result);
			if (result.success) {
				return { success: true };
			} else {
				return { success: false, error: result.error || result.message || 'Upload failed' };
			}
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
			return { success: false, error: errorMessage };
		}
	}

	async function handleUploadStart(payload: UploadPayload) {
		const { files, uploaderName, description, previews } = payload;
		const totalFiles = files.length;

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

			// Update toast with progress
			toast.loading(`Uploading ${i + 1}/${totalFiles}...`, {
				id: toastId,
				description: `${successCount} uploaded, ${failedCount} failed`,
			});

			const result = await uploadSingleFile(file, preview, uploaderName, description);

			if (result.success) {
				successCount++;
			} else {
				failedCount++;
				failedFiles.push({
					file,
					error: result.error || 'Unknown error',
					preview,
				});
			}
		}

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
		const totalFiles = failedFiles.length;
		const toastId = toast.loading(
			`Mengulangi upload ${totalFiles} ${totalFiles === 1 ? 'file' : 'files'}...`
		);

		let successCount = 0;
		let failedCount = 0;
		const stillFailedFiles: FailedFile[] = [];

		for (let i = 0; i < failedFiles.length; i++) {
			const { file, preview } = failedFiles[i];

			toast.loading(`Mengulangi ${i + 1}/${totalFiles}...`, {
				id: toastId,
				description: `${successCount} berhasil, ${failedCount} masih gagal`,
			});

			const result = await uploadSingleFile(file, preview, uploaderName, description);

			if (result.success) {
				successCount++;
			} else {
				failedCount++;
				stillFailedFiles.push({
					file,
					error: result.error || 'Unknown error',
					preview,
				});
			}
		}

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
			<p class="mt-4 text-lg text-wedding-text-muted md:text-xl">
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
/>

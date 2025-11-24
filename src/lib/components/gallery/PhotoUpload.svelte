<script lang="ts">
	import { untrack } from 'svelte';
	import { getRandomPlaceholder } from '$lib/utils/placeholders';
	import MediaLightbox from '$lib/components/gallery/MediaLightbox.svelte';
	import { generateThumbnail, VideoThumbnailExtractor } from '$lib/utils/image-processor';
	import { formatFileSize } from '$lib/utils/file-size';

	interface Props {
		isActive?: boolean;
		onUploadStart?: (_payload: UploadPayload) => void;
		onClose: () => void;
		isOpen: boolean;
		preSelectedFiles?: File[];
		onRequestMoreFiles?: () => void;
		additionalFiles?: File[];
	}

	interface UploadPayload {
		files: File[];
		uploaderName: string;
		description: string;
		previews: string[];
	}

	let {
		isActive = true,
		onUploadStart,
		onClose,
		isOpen,
		preSelectedFiles,
		onRequestMoreFiles,
		additionalFiles,
	}: Props = $props();

	let files = $state<File[]>([]);
	let previews = $state<string[]>([]); // Full preview URLs for MediaLightbox
	let thumbnails = $state<string[]>([]); // Thumbnail URLs for grid display
	let uploaderName = $state('');
	let description = $state('');
	let error = $state('');
	let namePlaceholder = $state(getRandomPlaceholder());
	let showPreviewModal = $state(false);
	let selectedPreviewIndex = $state(-1);

	function isVideoFile(file: File): boolean {
		return file.type.startsWith('video/');
	}

	function removeFile(index: number) {
		// Clean up object URLs before removing
		if (previews[index] && previews[index].startsWith('blob:')) {
			URL.revokeObjectURL(previews[index]);
		}
		if (thumbnails[index] && thumbnails[index].startsWith('blob:')) {
			URL.revokeObjectURL(thumbnails[index]);
		}
		files = files.filter((_, i) => i !== index);
		previews = previews.filter((_, i) => i !== index);
		thumbnails = thumbnails.filter((_, i) => i !== index);
	}

	function handleThumbnailClick(index: number) {
		selectedPreviewIndex = index;
		showPreviewModal = true;
	}

	function handleClosePreviewModal() {
		showPreviewModal = false;
		selectedPreviewIndex = -1;
	}

	// Transform files to Photo format for MediaLightbox
	const previewPhotos = $derived(
		files.map((file, index) => ({
			id: `${file.name}-${file.size}-${index}`,
			url: previews[index] || '',
			thumbnail: thumbnails[index] || previews[index] || '',
			content_type: file.type,
			media_type: (isVideoFile(file) ? 'video' : 'image') as 'image' | 'video',
			description: description || undefined,
			uploader_name: uploaderName || undefined,
		}))
	);

	// Calculate total file size
	const totalFileSize = $derived(files.reduce((sum, f) => sum + f.size, 0));

	function handleConfirmUpload() {
		if (files.length === 0) {
			error = 'Please select at least one photo';
			return;
		}

		if (!isActive) {
			error = 'This session is no longer accepting uploads';
			return;
		}

		// Create payload and call callback
		if (onUploadStart) {
			onUploadStart({
				files: [...files],
				uploaderName: uploaderName || getRandomPlaceholder(),
				description: description,
				previews: [...previews],
			});
		}

		// Close modal immediately
		resetForm();
		onClose();
	}

	function resetForm() {
		// Clean up all object URLs
		previews.forEach((url) => {
			if (url && url.startsWith('blob:')) {
				URL.revokeObjectURL(url);
			}
		});
		thumbnails.forEach((url) => {
			if (url && url.startsWith('blob:')) {
				URL.revokeObjectURL(url);
			}
		});
		files = [];
		previews = [];
		thumbnails = [];
		uploaderName = '';
		description = '';
		error = '';
		showPreviewModal = false;
		selectedPreviewIndex = -1;
		// Get a new random placeholder for next time
		namePlaceholder = getRandomPlaceholder();
	}

	function handleClose() {
		resetForm();
		onClose();
	}

	function handleUploadAreaClick() {
		if (onRequestMoreFiles) {
			onRequestMoreFiles();
		}
	}

	// Handle preSelectedFiles when modal opens
	$effect(() => {
		if (isOpen && preSelectedFiles && preSelectedFiles.length > 0 && previews.length === 0) {
			// Only populate if modal is open, preSelectedFiles exist, and no previews exist yet
			// Using previews.length instead of files.length to avoid dependency on files that we modify
			const newFiles = [...preSelectedFiles];
			const newPreviews: string[] = [];
			const newThumbnails: string[] = [];

			// Create previews and thumbnails for pre-selected files
			(async () => {
				for (const file of newFiles) {
					// Create full preview URL
					const previewUrl = URL.createObjectURL(file);
					newPreviews.push(previewUrl);

					// Generate thumbnail
					try {
						if (isVideoFile(file)) {
							const thumbnailBlob = await VideoThumbnailExtractor.extractThumbnail(file, 1.5, 300);
							if (thumbnailBlob) {
								const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
								newThumbnails.push(thumbnailUrl);
							} else {
								// Fallback to preview if thumbnail generation fails
								newThumbnails.push(previewUrl);
							}
						} else {
							// For images, File extends Blob so we can pass it directly
							const thumbnailBlob = await generateThumbnail(file, 300);
							const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
							newThumbnails.push(thumbnailUrl);
						}
					} catch (error) {
						console.error('Failed to generate thumbnail:', error);
						// Fallback to preview if thumbnail generation fails
						newThumbnails.push(previewUrl);
					}
				}

				files = newFiles;
				previews = newPreviews;
				thumbnails = newThumbnails;
			})();
		}
		// Removed: else if (!isOpen) resetForm() - let handleClose() handle cleanup
	});

	// Handle additionalFiles - append to existing files
	$effect(() => {
		if (additionalFiles && additionalFiles.length > 0 && isOpen) {
			// Use untrack to read files without creating dependency
			// This prevents effect from re-running when files change after append
			const currentFiles = untrack(() => files);

			// Append files that don't already exist (avoid duplicates)
			const newFiles = additionalFiles.filter(
				(newFile) =>
					!currentFiles.some(
						(existing) =>
							existing.name === newFile.name &&
							existing.size === newFile.size &&
							existing.lastModified === newFile.lastModified
					)
			);

			if (newFiles.length > 0) {
				// Append to existing files
				files = [...currentFiles, ...newFiles];

				// Create previews and thumbnails for new files
				(async () => {
					const currentPreviews = untrack(() => previews);
					const currentThumbnails = untrack(() => thumbnails);
					const newPreviews: string[] = [];
					const newThumbnails: string[] = [];

					for (const file of newFiles) {
						// Create full preview URL
						const previewUrl = URL.createObjectURL(file);
						newPreviews.push(previewUrl);

						// Generate thumbnail
						try {
							if (isVideoFile(file)) {
								const thumbnailBlob = await VideoThumbnailExtractor.extractThumbnail(file, 1.5, 300);
								if (thumbnailBlob) {
									const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
									newThumbnails.push(thumbnailUrl);
								} else {
									// Fallback to preview if thumbnail generation fails
									newThumbnails.push(previewUrl);
								}
							} else {
								// For images, convert File to Blob first
								const imageBlob = new Blob([file], { type: file.type });
								const thumbnailBlob = await generateThumbnail(imageBlob, 300);
								const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
								newThumbnails.push(thumbnailUrl);
							}
						} catch (error) {
							console.error('Failed to generate thumbnail:', error);
							// Fallback to preview if thumbnail generation fails
							newThumbnails.push(previewUrl);
						}
					}

					previews = [...currentPreviews, ...newPreviews];
					thumbnails = [...currentThumbnails, ...newThumbnails];
				})();
			}
		}
	});

	// Initialize placeholder when modal opens
	$effect(() => {
		if (isOpen) {
			namePlaceholder = getRandomPlaceholder();
		}
	});

	// Update placeholder when input is focused and empty for extra dynamism
	function handleNameFocus() {
		if (!uploaderName) {
			namePlaceholder = getRandomPlaceholder();
		}
	}

	// Cleanup on unmount
	$effect(() => {
		return () => {
			// Cleanup preview URLs when component unmounts
			previews.forEach((url) => {
				if (url && url.startsWith('blob:')) {
					URL.revokeObjectURL(url);
				}
			});
			// Cleanup thumbnail URLs when component unmounts
			thumbnails.forEach((url) => {
				if (url && url.startsWith('blob:')) {
					URL.revokeObjectURL(url);
				}
			});
		};
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div
			class="absolute inset-0 bg-black/50"
			onclick={handleClose}
			onkeydown={(e) => e.key === 'Escape' && handleClose()}
			role="button"
			tabindex="0"
			aria-label="Close modal"
		/>

		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-wedding-beige bg-white shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-wedding-beige p-6">
				<h2 class="font-serif text-2xl font-semibold text-wedding-text-primary">Upload Photos</h2>
				<button
					type="button"
					onclick={handleClose}
					aria-label="Close upload modal"
					class="rounded-lg p-1 text-wedding-text-muted transition hover:bg-wedding-cream"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Scrollable Content -->
			<div class="flex-1 overflow-y-auto p-6">
				{#if !isActive}
					<div class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
						<p class="font-medium">This session is no longer accepting uploads</p>
					</div>
				{/if}

				<div class="space-y-4">
					<div>
						<button
							type="button"
							class="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-wedding-beige bg-wedding-cream transition hover:border-wedding-sage"
							onclick={handleUploadAreaClick}
						>
							<svg
								class="h-12 w-12 text-wedding-text-muted"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M12 4v16m8-8H4"
								/>
							</svg>
							<span class="mt-2 text-sm font-medium text-wedding-text-primary"
								>Upload Photos or Videos</span
							>
							<span class="mt-1 text-xs text-wedding-text-muted"
								>Tap to select from gallery or camera</span
							>
						</button>
					</div>

					{#if previews.length > 0}
						<div class="grid grid-cols-3 gap-2">
							{#each previews as preview, i (i)}
								<div class="group relative aspect-square">
									<button
										type="button"
										onclick={() => handleThumbnailClick(i)}
										class="absolute inset-0 h-full w-full cursor-pointer"
										aria-label="Preview media {i + 1}"
									>
										{#if isVideoFile(files[i])}
											<img
												src={thumbnails[i] || preview}
												alt="Video thumbnail {i + 1}"
												class="h-full w-full rounded-lg object-cover"
											/>
											<div
												class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg"
											>
												<svg class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
													<path d="M8 5v14l11-7z" />
												</svg>
											</div>
										{:else}
											<img
												src={thumbnails[i] || preview}
												alt="Preview {i + 1}"
												class="h-full w-full rounded-lg object-cover"
											/>
										{/if}
									</button>
									<!-- File size overlay -->
									<div
										class="absolute bottom-1 left-1 z-10 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white backdrop-blur-sm"
									>
										<div class="flex items-center gap-1">
											{#if isVideoFile(files[i])}
												<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
													<path d="M8 5v14l11-7z" />
												</svg>
											{:else}
												<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
													/>
												</svg>
											{/if}
											<span>{formatFileSize(files[i].size)}</span>
										</div>
									</div>
									<button
										type="button"
										onclick={(e) => {
											e.stopPropagation();
											removeFile(i);
										}}
										aria-label="Remove file"
										class="absolute right-1 top-1 z-10 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							{/each}
						</div>
						<!-- Total file size summary -->
						<div class="mt-2 rounded-lg border border-wedding-beige bg-wedding-cream/50 px-3 py-2">
							<div class="flex items-center justify-between text-sm">
								<span class="font-medium text-wedding-text-primary">
									Total: {formatFileSize(totalFileSize)}
								</span>
								<span class="text-wedding-text-muted">
									{files.length} {files.length === 1 ? 'file' : 'files'}
								</span>
							</div>
						</div>
					{/if}

					<div>
						<label
							for="uploaderName"
							class="mb-1 block text-sm font-medium text-wedding-text-primary"
						>
							Your Name (optional)
						</label>
						<input
							type="text"
							id="uploaderName"
							bind:value={uploaderName}
							placeholder={namePlaceholder}
							onfocus={handleNameFocus}
							class="w-full rounded-lg border border-wedding-beige px-3 py-2 text-sm focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
						/>
					</div>

					<div>
						<label
							for="description"
							class="mb-1 block text-sm font-medium text-wedding-text-primary"
						>
							Caption (optional)
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="2"
							placeholder="Add a caption for your photos..."
							class="w-full rounded-lg border border-wedding-beige px-3 py-2 text-sm focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
						/>
					</div>

					{#if error}
						<div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
							{error}
						</div>
					{/if}
				</div>
			</div>

			<!-- Sticky Footer with Buttons -->
			<div class="sticky bottom-0 border-t border-wedding-beige bg-white p-6">
				{#if files.length > 0}
					<div class="mb-3 text-center text-xs text-wedding-text-muted">
						Uploading {formatFileSize(totalFileSize)} may take a while depending on your connection
					</div>
				{/if}
				<div class="flex gap-x-3">
					<button
						type="button"
						onclick={handleClose}
						class="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleConfirmUpload}
						disabled={!isActive || files.length === 0}
						class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:border-2 disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 enabled:bg-blue-600 enabled:text-white enabled:shadow-md enabled:hover:bg-blue-700"
					>
						Upload {files.length > 0 ? `(${files.length})` : ''}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<MediaLightbox
	photos={previewPhotos}
	currentIndex={selectedPreviewIndex}
	isOpen={showPreviewModal}
	onClose={handleClosePreviewModal}
/>

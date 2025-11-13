<script lang="ts">
	import { getDeviceInfo, getNetworkInfo } from '$lib/utils/device';

	interface Props {
		isActive?: boolean;
		onSuccess?: () => void;
		onClose: () => void;
		isOpen: boolean;
	}

	let { isActive = true, onSuccess, onClose, isOpen }: Props = $props();

	let files = $state<File[]>([]);
	let previews = $state<string[]>([]);
	let uploaderName = $state('');
	let description = $state('');
	let isUploading = $state(false);
	let uploadProgress = $state(0);
	let error = $state('');
	let successCount = $state(0);

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;

		const selectedFiles = Array.from(input.files);
		files = [...files, ...selectedFiles];

		selectedFiles.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				if (e.target?.result) {
					previews = [...previews, e.target.result as string];
				}
			};
			reader.readAsDataURL(file);
		});
	}

	function isVideoFile(file: File): boolean {
		return file.type.startsWith('video/');
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
		previews = previews.filter((_, i) => i !== index);
	}

	async function uploadFiles() {
		if (files.length === 0) {
			error = 'Please select at least one photo';
			return;
		}

		if (!isActive) {
			error = 'This session is no longer accepting uploads';
			return;
		}

		isUploading = true;
		error = '';
		successCount = 0;

		const deviceInfo = getDeviceInfo();
		const networkInfo = getNetworkInfo();

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const formData = new FormData();

			formData.append('file', file);
			formData.append('uploader_name', uploaderName || 'Anonymous');
			formData.append('description', description);
			formData.append('device_info', deviceInfo);
			formData.append('network_info', networkInfo);
			formData.append('original_size', file.size.toString());

			try {
				const img = new Image();
				img.src = previews[i];
				await new Promise((resolve) => {
					img.onload = resolve;
				});
				formData.append('width', img.width.toString());
				formData.append('height', img.height.toString());
			} catch (err) {
				console.error('Failed to get image dimensions:', err);
			}

			try {
				const response = await fetch('/api/gallery/upload', {
					method: 'POST',
					body: formData
				});

				if (!response.ok) {
					let errorMessage = `Upload failed (${response.status})`;
					try {
						const errorData = await response.json();
						errorMessage = errorData.error || errorData.message || errorMessage;
					} catch {
						// If response is not JSON, try to get text
						try {
							const text = await response.text();
							if (text) errorMessage = text;
						} catch {
							// Use default error message
						}
					}
					throw new Error(errorMessage);
				}

				const result = await response.json();

				if (result.success) {
					successCount++;
					uploadProgress = Math.round(((i + 1) / files.length) * 100);
				} else {
					throw new Error(result.error || result.message || 'Upload failed');
				}
			} catch (err) {
				console.error('Upload error:', err);
				const errorMessage = err instanceof Error ? err.message : 'Upload failed. Please try again.';
				error = errorMessage;
				isUploading = false;
				return;
			}
		}

		isUploading = false;
		uploadProgress = 100;

		setTimeout(() => {
			resetForm();
			onClose();
			if (onSuccess) onSuccess();
		}, 1000);
	}

	function resetForm() {
		files = [];
		previews = [];
		uploaderName = '';
		description = '';
		uploadProgress = 0;
		error = '';
		successCount = 0;
	}

	function handleClose() {
		if (!isUploading) {
			resetForm();
			onClose();
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="absolute inset-0 bg-black/50" onclick={handleClose}></div>

		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-wedding-beige bg-white shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-wedding-beige p-6">
				<h2 class="font-serif text-2xl font-semibold text-wedding-text-primary">
					Upload Photos
				</h2>
				<button
					type="button"
					onclick={handleClose}
					disabled={isUploading}
					class="rounded-lg p-1 text-wedding-text-muted transition hover:bg-wedding-cream disabled:opacity-50"
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
					<div
						class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800"
					>
						<p class="font-medium">This session is no longer accepting uploads</p>
					</div>
				{/if}

				<div class="space-y-4">
					<div>
						<label
							class="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-wedding-beige bg-wedding-cream transition hover:border-wedding-sage"
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
							<span class="mt-2 text-sm font-medium text-wedding-text-primary">Upload Photos or Videos</span>
							<span class="mt-1 text-xs text-wedding-text-muted">Tap to select from gallery or camera</span>
							<input
								type="file"
								accept="image/*,video/*"
								capture="environment"
								multiple
								onchange={handleFileSelect}
								disabled={isUploading || !isActive}
								class="hidden"
							/>
						</label>
					</div>

					{#if previews.length > 0}
						<div class="grid grid-cols-3 gap-2">
							{#each previews as preview, i (i)}
								<div class="group relative aspect-square">
									{#if isVideoFile(files[i])}
										<video
											src={preview}
											class="h-full w-full rounded-lg object-cover"
											muted
										></video>
										<div class="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
											<svg class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
												<path d="M8 5v14l11-7z" />
											</svg>
										</div>
									{:else}
										<img
											src={preview}
											alt="Preview {i + 1}"
											class="h-full w-full rounded-lg object-cover"
										/>
									{/if}
									<button
										type="button"
										onclick={() => removeFile(i)}
										disabled={isUploading}
										class="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
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
					{/if}

					<div>
						<label for="uploaderName" class="mb-1 block text-sm font-medium text-wedding-text-primary">
							Your Name (optional)
						</label>
						<input
							type="text"
							id="uploaderName"
							bind:value={uploaderName}
							disabled={isUploading}
							placeholder="Anonymous"
							class="w-full rounded-lg border border-wedding-beige px-3 py-2 text-sm focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20 disabled:bg-gray-50"
						/>
					</div>

					<div>
						<label for="description" class="mb-1 block text-sm font-medium text-wedding-text-primary">
							Caption (optional)
						</label>
						<textarea
							id="description"
							bind:value={description}
							disabled={isUploading}
							rows="2"
							placeholder="Add a caption for your photos..."
							class="w-full rounded-lg border border-wedding-beige px-3 py-2 text-sm focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20 disabled:bg-gray-50"
						></textarea>
					</div>

					{#if isUploading}
						<div class="rounded-lg bg-wedding-cream p-4">
							<div class="mb-2 flex justify-between text-sm">
								<span class="text-wedding-text-primary">Uploading...</span>
								<span class="font-medium text-wedding-sage">{uploadProgress}%</span>
							</div>
							<div class="h-2 overflow-hidden rounded-full bg-wedding-beige">
								<div
									class="h-full bg-wedding-sage transition-all duration-300"
									style="width: {uploadProgress}%"
								></div>
							</div>
							<p class="mt-2 text-xs text-wedding-text-muted">
								{successCount} of {files.length} photos uploaded
							</p>
						</div>
					{/if}

					{#if error}
						<div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
							{error}
						</div>
					{/if}
				</div>
			</div>

			<!-- Sticky Footer with Buttons -->
			<div class="sticky bottom-0 border-t border-wedding-beige bg-white p-6">
				<div class="flex gap-x-3">
					<button
						type="button"
						onclick={handleClose}
						disabled={isUploading}
						class="flex-1 rounded-lg border border-wedding-beige bg-white px-4 py-2 text-sm font-medium text-wedding-text-primary transition hover:bg-wedding-cream disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={uploadFiles}
						disabled={isUploading || !isActive || files.length === 0}
						class="flex-1 rounded-lg bg-wedding-sage px-4 py-2 text-sm font-medium text-white transition hover:bg-wedding-sage/90 disabled:opacity-50"
					>
						{#if isUploading}
							Uploading...
						{:else}
							Upload {files.length > 0 ? `(${files.length})` : ''}
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

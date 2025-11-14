<script lang="ts">
	interface Props {
		isActive?: boolean;
		onUploadStart?: (payload: UploadPayload) => void;
		onClose: () => void;
		isOpen: boolean;
	}

	interface UploadPayload {
		files: File[];
		uploaderName: string;
		description: string;
		previews: string[];
	}

	let { isActive = true, onUploadStart, onClose, isOpen }: Props = $props();

	let files = $state<File[]>([]);
	let previews = $state<string[]>([]);
	let uploaderName = $state('');
	let description = $state('');
	let error = $state('');

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files) return;

		const selectedFiles = Array.from(input.files);
		files = [...files, ...selectedFiles];

		// Use URL.createObjectURL for better memory management
		selectedFiles.forEach((file) => {
			const objectUrl = URL.createObjectURL(file);
			previews = [...previews, objectUrl];
		});
	}

	function isVideoFile(file: File): boolean {
		return file.type.startsWith('video/');
	}

	function removeFile(index: number) {
		// Clean up object URL before removing
		if (previews[index] && previews[index].startsWith('blob:')) {
			URL.revokeObjectURL(previews[index]);
		}
		files = files.filter((_, i) => i !== index);
		previews = previews.filter((_, i) => i !== index);
	}

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
				uploaderName: uploaderName || 'Anonymous',
				description: description,
				previews: [...previews]
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
		files = [];
		previews = [];
		uploaderName = '';
		description = '';
		error = '';
	}

	function handleClose() {
		resetForm();
		onClose();
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
		};
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div 
			class="absolute inset-0 bg-black/50" 
			onclick={handleClose} 
			onkeydown={(e) => e.key === 'Escape' && handleClose()}
			role="button" 
			tabindex="0" 
			aria-label="Close modal"
		></div>

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
								disabled={!isActive}
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
										aria-label="Remove file"
										class="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100"
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
							placeholder="Anonymous"
							class="w-full rounded-lg border border-wedding-beige px-3 py-2 text-sm focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
						/>
					</div>

					<div>
						<label for="description" class="mb-1 block text-sm font-medium text-wedding-text-primary">
							Caption (optional)
						</label>
						<textarea
							id="description"
							bind:value={description}
							rows="2"
							placeholder="Add a caption for your photos..."
							class="w-full rounded-lg border border-wedding-beige px-3 py-2 text-sm focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
						></textarea>
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
				<div class="flex gap-x-3">
					<button
						type="button"
						onclick={handleClose}
						class="flex-1 rounded-lg border border-wedding-beige bg-white px-4 py-2 text-sm font-medium text-wedding-text-primary transition hover:bg-wedding-cream"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={handleConfirmUpload}
						disabled={!isActive || files.length === 0}
						class="flex-1 rounded-lg bg-wedding-sage px-4 py-2 text-sm font-medium text-white transition hover:bg-wedding-sage/90 disabled:opacity-50"
					>
						Upload {files.length > 0 ? `(${files.length})` : ''}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

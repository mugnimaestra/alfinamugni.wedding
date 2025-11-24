<script lang="ts">
	import { fade } from 'svelte/transition';

	interface Photo {
		id: string | number;
		title: string;
		description?: string;
		uploader_name: string;
		upload_date: string;
		thumbnail: string;
		url: string;
		content_type?: string;
		media_type?: 'image' | 'video';
	}

	interface Props {
		photo: Photo | null;
		isOpen: boolean;
		onCancel: () => void;
		onConfirm: () => void;
	}

	let { photo, isOpen, onCancel, onConfirm }: Props = $props();

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onCancel();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onCancel();
		}
	}

	function isVideo(photo: Photo | null): boolean {
		if (!photo) return false;
		return (
			photo.media_type === 'video' ||
			photo.content_type?.startsWith('video/') ||
			false
		);
	}

	$effect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			document.addEventListener('keydown', handleKeyDown);
		} else {
			document.body.style.overflow = '';
			document.removeEventListener('keydown', handleKeyDown);
		}
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = '';
		};
	});
</script>

{#if isOpen && photo}
	<!-- Backdrop -->
	<div
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
		onclick={handleBackdropClick}
		role="button"
		tabindex="0"
		aria-label="Close preview modal"
	>
		<!-- Modal Content -->
		<div
			class="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-wedding-beige bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-wedding-beige bg-wedding-cream/30 p-4">
				<div class="flex-1">
					<h2 class="font-serif text-xl font-semibold text-wedding-text-primary">
						Confirm Deletion
					</h2>
					<p class="mt-1 text-sm text-wedding-text-muted">
						Review the media before deleting
					</p>
				</div>
				<button
					type="button"
					onclick={onCancel}
					aria-label="Close modal"
					class="ml-4 rounded-lg p-2 text-wedding-text-muted transition hover:bg-wedding-beige/50"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Media Preview -->
			<div class="flex-1 overflow-auto bg-wedding-cream/10 p-6">
				<div class="flex flex-col items-center gap-4">
					<!-- Image Preview -->
					{#if !isVideo(photo)}
						<div class="flex max-h-[60vh] w-full items-center justify-center overflow-hidden rounded-lg bg-wedding-beige/20">
							<img
								src={photo.url}
								alt={photo.title}
								class="max-h-[60vh] w-auto object-contain"
							/>
						</div>
					{:else}
						<!-- Video Preview -->
						<div class="flex w-full max-w-3xl items-center justify-center overflow-hidden rounded-lg bg-black">
							<video
								src={photo.url}
								controls
								class="max-h-[60vh] w-full object-contain"
							>
								Your browser does not support the video tag.
							</video>
						</div>
					{/if}

					<!-- Metadata -->
					<div class="w-full rounded-lg border border-wedding-beige bg-white p-4">
						<h3 class="font-serif text-lg font-semibold text-wedding-text-primary">
							{photo.title}
						</h3>
						{#if photo.description}
							<p class="mt-2 text-sm text-wedding-text-muted">{photo.description}</p>
						{/if}
						<div class="mt-3 flex items-center gap-4 text-xs text-wedding-text-muted">
							<div>
								<span class="font-medium">Uploaded by:</span> {photo.uploader_name}
							</div>
							<div>
								<span class="font-medium">Date:</span>{' '}
								{new Date(photo.upload_date).toLocaleDateString()}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer with Action Buttons -->
			<div class="border-t border-wedding-beige bg-white p-4">
				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={onCancel}
						class="rounded-lg border-2 border-wedding-beige bg-white px-6 py-2 text-sm font-medium text-wedding-text-primary transition hover:bg-wedding-cream"
					>
						Cancel
					</button>
					<button
						type="button"
						onclick={onConfirm}
						class="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
					>
						Delete Media
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}


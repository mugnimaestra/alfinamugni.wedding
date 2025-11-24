<script lang="ts">
	import { getRandomPlaceholder } from '$lib/utils/placeholders';

	interface Photo {
		id: string | number;
		url: string;
		thumbnail?: string;
		description?: string;
		uploader_name?: string;
		upload_date?: string;
		content_type?: string;
		media_type?: 'image' | 'video';
	}

	interface Props {
		initialPhotos: Photo[];
		onPhotoClick: (_photo: Photo) => void;
	}

	let { initialPhotos, onPhotoClick }: Props = $props();

	let photos = $state<Photo[]>(initialPhotos);
	let page = $state(2);
	let loading = $state(false);
	let hasMore = $state(true);
	let sentinelRef = $state<HTMLDivElement | null>(null);
	let previousPhotoCount = $state(initialPhotos.length);
	let newPhotoIds = $state<Set<string | number>>(new Set());

	// Watch for new photos added (from uploads)
	$effect(() => {
		if (initialPhotos.length > previousPhotoCount) {
			// New photos were added - mark them for animation
			const newIds = new Set<string | number>();
			initialPhotos.slice(0, initialPhotos.length - previousPhotoCount).forEach((p) => {
				newIds.add(p.id);
			});
			newPhotoIds = newIds;

			// Clear animation after 2 seconds
			setTimeout(() => {
				newPhotoIds = new Set();
			}, 2000);
		}
		photos = initialPhotos;
		previousPhotoCount = initialPhotos.length;
	});

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;

		try {
			const response = await fetch(`/api/gallery/photos?page=${page}&limit=30`);
			const data = await response.json();

			if (data.success && data.photos.length > 0) {
				// Photos already have url and thumbnail from the API endpoint
				interface ApiPhoto {
					id: number;
					url: string;
					thumbnail: string;
					description?: string;
					uploader_name?: string;
					upload_date?: string;
					content_type?: string;
					media_type?: string;
				}
				const newPhotos = (data.photos as ApiPhoto[]).map((p: ApiPhoto) => ({
					id: p.id,
					url: p.url,
					thumbnail: p.thumbnail,
					description: p.description || '',
					uploader_name: p.uploader_name || getRandomPlaceholder(),
					upload_date: p.upload_date,
					content_type: p.content_type || 'image/jpeg',
					media_type:
						(p.media_type as 'image' | 'video') ||
						(p.content_type?.startsWith('video/') ? 'video' : 'image'),
				}));

				photos = [...photos, ...newPhotos];
				page += 1;
				hasMore = data.photos.length === 30;
			} else {
				hasMore = false;
			}
		} catch (error) {
			console.error('Error loading more photos:', error);
			hasMore = false;
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (!sentinelRef || typeof window === 'undefined') return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					loadMore();
				}
			},
			{ rootMargin: '200px' }
		);

		observer.observe(sentinelRef);

		return () => {
			observer.disconnect();
		};
	});

	function isVideo(photo: Photo): boolean {
		return photo.media_type === 'video' || photo.content_type?.startsWith('video/') || false;
	}
</script>

{#if photos.length === 0 && !loading}
	<div
		class="flex min-h-[400px] items-center justify-center rounded-xl border border-wedding-beige bg-white p-12"
	>
		<div class="text-center">
			<svg
				class="mx-auto h-16 w-16 text-wedding-text-muted"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
			<h3 class="mt-4 font-serif text-xl font-semibold text-wedding-text-primary">No photos yet</h3>
			<p class="mt-2 text-wedding-text-muted">
				Be the first to share a moment from our special day!
			</p>
		</div>
	</div>
{:else}
	<div class="masonry-grid">
		{#each photos as photo (photo.id)}
			<button
				type="button"
				onclick={() => onPhotoClick(photo)}
				class="masonry-item group flex flex-col overflow-hidden rounded border border-wedding-beige/30 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-1 {newPhotoIds.has(
					photo.id
				)
					? 'animate-fadeInScale'
					: ''}"
			>
				<div class="relative overflow-hidden">
					{#if isVideo(photo)}
						{#if photo.thumbnail}
							<!-- Use thumbnail image for iOS Safari compatibility -->
							<img
								src={photo.thumbnail}
								alt={photo.description || 'Video thumbnail'}
								loading="lazy"
								class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						{:else}
							<!-- Fallback to video element with poster attribute -->
							<video
								src={photo.url}
								class="h-full w-full object-cover"
								preload="metadata"
								muted
								playsinline
								poster={photo.thumbnail}
							/>
						{/if}
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/20 transition-all group-hover:bg-black/30"
						>
							<div class="rounded-full bg-white/90 p-3 backdrop-blur-sm">
								<svg class="h-8 w-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8 5v14l11-7z" />
								</svg>
							</div>
						</div>
					{:else}
						<img
							src={photo.thumbnail || photo.url}
							alt={photo.description || 'Wedding photo'}
							loading="lazy"
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					{/if}

					{#if photo.description}
						<div
							class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-left"
						>
							<p class="truncate text-xs text-white">
								{photo.description}
							</p>
						</div>
					{/if}
				</div>
			</button>
		{/each}
	</div>

	<div bind:this={sentinelRef} class="h-4" />

	{#if loading}
		<div class="flex justify-center py-8">
			<div class="flex items-center gap-2 text-wedding-text-muted">
				<svg class="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
				<span>Loading more...</span>
			</div>
		</div>
	{/if}

	{#if !hasMore && photos.length > 0}
		<div class="py-8 text-center text-sm text-wedding-text-muted">
			You've reached the end of the gallery
		</div>
	{/if}
{/if}

<style>
	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.animate-fadeInScale {
		animation: fadeInScale 0.6s ease-out;
	}

	.masonry-grid {
		column-count: 2;
		column-gap: 0.25rem; /* 4px - minimal spacing for mobile */
	}

	.masonry-item {
		break-inside: avoid;
		margin-bottom: 0.25rem; /* 4px - minimal spacing for mobile */
		display: inline-block;
		width: 100%;
	}

	@media (min-width: 640px) {
		.masonry-grid {
			column-count: 3;
			column-gap: 0.375rem; /* 6px */
		}
		.masonry-item {
			margin-bottom: 0.375rem; /* 6px */
		}
	}

	@media (min-width: 1024px) {
		.masonry-grid {
			column-count: 4;
			column-gap: 0.5rem; /* 8px */
		}
		.masonry-item {
			margin-bottom: 0.5rem; /* 8px */
		}
	}

	@media (min-width: 1536px) {
		.masonry-grid {
			column-count: 6;
		}
	}
</style>

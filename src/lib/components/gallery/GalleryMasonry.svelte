<script lang="ts">
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
		onPhotoClick: (photo: Photo) => void;
	}

	let { initialPhotos, onPhotoClick }: Props = $props();

	let photos = $state<Photo[]>(initialPhotos);
	let page = $state(2);
	let loading = $state(false);
	let hasMore = $state(true);
	let sentinelRef = $state<HTMLDivElement | null>(null);

	async function loadMore() {
		if (loading || !hasMore) return;
		loading = true;

		try {
			const response = await fetch(`/api/gallery/photos?page=${page}&limit=30`);
			const data = await response.json();

			if (data.success && data.photos.length > 0) {
				const newPhotos = data.photos.map((p: any) => ({
					id: p.id,
					url: `/api/photos/${p.id}`,
					thumbnail: `/api/photos/${p.id}`,
					description: p.description || '',
					uploader_name: p.uploader_name || 'Anonymous',
					upload_date: p.upload_date,
					content_type: p.content_type || 'image/jpeg',
					media_type: p.media_type || (p.content_type?.startsWith('video/') ? 'video' : 'image')
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
				class="masonry-item group flex flex-col overflow-hidden rounded-lg border border-wedding-beige bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
			>
				<div class="relative overflow-hidden">
					{#if isVideo(photo)}
						<video
							src={photo.url}
							class="h-full w-full object-cover"
							preload="metadata"
							muted
						></video>
						<div
							class="absolute inset-0 flex items-center justify-center bg-black/20 transition-all group-hover:bg-black/30"
						>
							<div class="rounded-full bg-white/90 p-3 backdrop-blur-sm">
								<svg class="h-8 w-8 text-wedding-sage" fill="currentColor" viewBox="0 0 24 24">
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
							class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-left opacity-0 transition-opacity group-hover:opacity-100"
						>
							<p class="line-clamp-2 text-sm text-white">
								{photo.description}
							</p>
						</div>
					{/if}
				</div>

				{#if photo.uploader_name}
					<div class="p-3 text-left">
						<p class="text-sm text-wedding-text-muted">
							by <span class="font-medium text-wedding-text-primary">{photo.uploader_name}</span>
						</p>
					</div>
				{/if}
			</button>
		{/each}
	</div>

	<div bind:this={sentinelRef} class="h-4"></div>

	{#if loading}
		<div class="flex justify-center py-8">
			<div class="flex items-center gap-2 text-wedding-text-muted">
				<svg class="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
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
	.masonry-grid {
		column-count: 2;
		column-gap: 1rem;
	}

	.masonry-item {
		break-inside: avoid;
		margin-bottom: 1rem;
		display: inline-block;
		width: 100%;
	}

	@media (min-width: 640px) {
		.masonry-grid {
			column-count: 3;
		}
	}

	@media (min-width: 1024px) {
		.masonry-grid {
			column-count: 4;
		}
	}

	@media (min-width: 1536px) {
		.masonry-grid {
			column-count: 6;
		}
	}
</style>

<script lang="ts">
	interface Photo {
		id: string | number;
		url: string;
		thumbnail?: string;
		description?: string;
		uploader_name?: string;
		upload_date?: string;
	}

	interface Props {
		photos: Photo[];
		onPhotoClick: (photo: Photo) => void;
	}

	interface PhotoLayout {
		photo: Photo;
		column: number;
		top: number;
		left: number;
		height: number;
		width: number;
		naturalWidth: number;
		naturalHeight: number;
		loaded: boolean;
	}

	let { photos, onPhotoClick }: Props = $props();

	let containerRef: HTMLDivElement | null = $state(null);
	let columnCount = $state(1);
	let columnHeights = $state<number[]>([]);
	let photoLayouts = $state<PhotoLayout[]>([]);
	let gap = 16; // gap-4 = 16px

	// Calculate column count based on container width
	function calculateColumnCount(width: number): number {
		if (width < 640) return 1; // Mobile
		if (width < 1024) return 2; // Tablet
		if (width < 1536) return 3; // Desktop
		return 4; // Large desktop
	}

	// Debounce function
	function debounce<T extends (...args: any[]) => void>(
		func: T,
		wait: number
	): (...args: Parameters<T>) => void {
		let timeout: ReturnType<typeof setTimeout> | null = null;
		return function executedFunction(...args: Parameters<T>) {
			const later = () => {
				timeout = null;
				func(...args);
			};
			if (timeout) clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	// Initialize layout
	function initializeLayout() {
		if (!containerRef) return;

		const containerWidth = containerRef.offsetWidth;
		const newColumnCount = calculateColumnCount(containerWidth);
		columnCount = newColumnCount;

		// Initialize column heights
		columnHeights = Array(newColumnCount).fill(0);

		// Reset photo layouts
		photoLayouts = photos.map((photo) => ({
			photo,
			column: 0,
			top: 0,
			left: 0,
			height: 0,
			width: 0,
			naturalWidth: 0,
			naturalHeight: 0,
			loaded: false,
		}));
	}

	// Calculate layout for a single photo
	function calculatePhotoLayout(
		photoLayout: PhotoLayout,
		naturalWidth: number,
		naturalHeight: number
	) {
		if (!containerRef) return;

		const containerWidth = containerRef.offsetWidth;
		const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;
		const aspectRatio = naturalHeight / naturalWidth;
		const imageHeight = columnWidth * aspectRatio;

		// Account for uploader name section if present (approximately 60px)
		const uploaderSectionHeight = photoLayout.photo.uploader_name ? 60 : 0;
		const totalHeight = imageHeight + uploaderSectionHeight;

		// Find shortest column
		const shortestColumnIndex = columnHeights.reduce(
			(minIndex, height, index) => (height < columnHeights[minIndex] ? index : minIndex),
			0
		);

		// Calculate position
		const top = columnHeights[shortestColumnIndex];
		const left = shortestColumnIndex * (columnWidth + gap);

		// Update photo layout
		photoLayout.column = shortestColumnIndex;
		photoLayout.top = top;
		photoLayout.left = left;
		photoLayout.height = totalHeight;
		photoLayout.width = columnWidth;
		photoLayout.naturalWidth = naturalWidth;
		photoLayout.naturalHeight = naturalHeight;
		photoLayout.loaded = true;

		// Update column height (reassign to ensure reactivity)
		columnHeights = columnHeights.map((height, index) =>
			index === shortestColumnIndex ? height + totalHeight + gap : height
		);
	}

	// Recalculate all layouts
	function recalculateLayout() {
		if (!containerRef || photos.length === 0) return;

		requestAnimationFrame(() => {
			const containerWidth = containerRef!.offsetWidth;
			const newColumnCount = calculateColumnCount(containerWidth);

			if (newColumnCount !== columnCount) {
				initializeLayout();
			}

			// Reset column heights
			columnHeights = Array(columnCount).fill(0);

			// Recalculate layouts for loaded photos
			photoLayouts.forEach((layout) => {
				if (layout.loaded && layout.naturalWidth > 0 && layout.naturalHeight > 0) {
					// Recalculate based on natural dimensions
					const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;
					const aspectRatio = layout.naturalHeight / layout.naturalWidth;
					const imageHeight = columnWidth * aspectRatio;
					const uploaderSectionHeight = layout.photo.uploader_name ? 60 : 0;
					const totalHeight = imageHeight + uploaderSectionHeight;

					const shortestColumnIndex = columnHeights.reduce(
						(minIndex, height, index) => (height < columnHeights[minIndex] ? index : minIndex),
						0
					);

					layout.column = shortestColumnIndex;
					layout.top = columnHeights[shortestColumnIndex];
					layout.left = shortestColumnIndex * (columnWidth + gap);
					layout.height = totalHeight;
					layout.width = columnWidth;

					columnHeights = columnHeights.map((height, index) =>
						index === shortestColumnIndex ? height + totalHeight + gap : height
					);
				}
			});
		});
	}

	// Handle image load
	function handleImageLoad(event: Event, photoLayout: PhotoLayout) {
		const img = event.target as HTMLImageElement;
		if (img.naturalWidth && img.naturalHeight) {
			calculatePhotoLayout(photoLayout, img.naturalWidth, img.naturalHeight);
		}
	}

	// Handle resize
	const handleResize = debounce(() => {
		recalculateLayout();
	}, 150);

	// Initialize on mount and when photos change
	$effect(() => {
		if (containerRef) {
			initializeLayout();
		}
	});

	// Watch for photos changes
	$effect(() => {
		if (photos.length > 0 && containerRef) {
			initializeLayout();
		}
	});

	// Set up resize observer for container
	$effect(() => {
		if (!containerRef || typeof window === 'undefined') return;

		const resizeObserver = new ResizeObserver(() => {
			handleResize();
		});

		resizeObserver.observe(containerRef);

		// Also listen to window resize as fallback
		window.addEventListener('resize', handleResize);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', handleResize);
		};
	});

	// Calculate container height
	const containerHeight = $derived(columnHeights.length > 0 ? Math.max(...columnHeights) : 0);
</script>

{#if photos.length === 0}
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
	<div bind:this={containerRef} class="relative w-full" style="height: {containerHeight}px;">
		{#each photoLayouts as photoLayout (photoLayout.photo.id)}
			<button
				type="button"
				onclick={() => onPhotoClick(photoLayout.photo)}
				class="group absolute flex flex-col overflow-hidden rounded-lg border border-wedding-beige bg-white shadow-sm transition-all hover:shadow-md"
				style="left: {photoLayout.left}px; top: {photoLayout.top}px; width: {photoLayout.width}px; {photoLayout.loaded
					? `height: ${photoLayout.height}px; opacity: 1;`
					: 'opacity: 0;'}"
			>
				<div
					class="relative flex-1 overflow-hidden"
					style="height: {photoLayout.loaded && photoLayout.photo.uploader_name
						? photoLayout.height - 60
						: photoLayout.loaded
						? photoLayout.height
						: 'auto'}px;"
				>
					<img
						src={photoLayout.photo.thumbnail || photoLayout.photo.url}
						alt={photoLayout.photo.description || 'Wedding photo'}
						loading="lazy"
						onload={(e) => handleImageLoad(e, photoLayout)}
						class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
					/>
					{#if photoLayout.photo.description}
						<div
							class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-left opacity-0 transition-opacity group-hover:opacity-100"
						>
							<p class="line-clamp-2 text-sm text-white">
								{photoLayout.photo.description}
							</p>
						</div>
					{/if}
				</div>
				{#if photoLayout.photo.uploader_name}
					<div class="p-3 text-left">
						<p class="text-sm text-wedding-text-muted">
							by <span class="font-medium text-wedding-text-primary"
								>{photoLayout.photo.uploader_name}</span
							>
						</p>
					</div>
				{/if}
			</button>
		{/each}
	</div>
{/if}

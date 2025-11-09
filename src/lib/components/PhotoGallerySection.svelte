<script lang="ts">
	interface Photo {
		id: number;
		url: string;
		alt: string;
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

	// Photo gallery images from the reference website
	const galleryPhotos: Photo[] = [
		{
			id: 1,
			url: '/photos/gf-1-2.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 2,
			url: '/photos/gf-2-2.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 3,
			url: '/photos/gf-3-5.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 4,
			url: '/photos/gf-4-2.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 5,
			url: '/photos/gf-5-4.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 6,
			url: '/photos/gf-6-1.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 7,
			url: '/photos/gf-7-2.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 8,
			url: '/photos/gf-8-2.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 9,
			url: '/photos/gf-9-1.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 10,
			url: '/photos/gf-10-1.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
		{
			id: 11,
			url: '/photos/gf-11.jpg',
			alt: 'Alfina & Mugni Wedding Photo',
		},
	];

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
		photoLayouts = galleryPhotos.map((photo) => ({
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
		photoLayout.height = imageHeight;
		photoLayout.width = columnWidth;
		photoLayout.naturalWidth = naturalWidth;
		photoLayout.naturalHeight = naturalHeight;
		photoLayout.loaded = true;

		// Update column height (reassign to ensure reactivity)
		columnHeights = columnHeights.map((height, index) =>
			index === shortestColumnIndex ? height + imageHeight + gap : height
		);
	}

	// Recalculate all layouts
	function recalculateLayout() {
		if (!containerRef || galleryPhotos.length === 0) return;

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

					const shortestColumnIndex = columnHeights.reduce(
						(minIndex, height, index) => (height < columnHeights[minIndex] ? index : minIndex),
						0
					);

					layout.column = shortestColumnIndex;
					layout.top = columnHeights[shortestColumnIndex];
					layout.left = shortestColumnIndex * (columnWidth + gap);
					layout.height = imageHeight;
					layout.width = columnWidth;

					columnHeights = columnHeights.map((height, index) =>
						index === shortestColumnIndex ? height + imageHeight + gap : height
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
		if (galleryPhotos.length > 0 && containerRef) {
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

<section
	id="photo-gallery"
	class="py-20 px-4 bg-gradient-to-b from-wedding-sky to-wedding-silver-light"
>
	<div class="max-w-6xl mx-auto">
		<div class="text-center mb-12">
			<h2 class="font-serif text-4xl md:text-6xl mb-6 font-light text-wedding-navy">Galeri Foto</h2>
			<p class="text-lg md:text-xl text-wedding-text-light max-w-2xl mx-auto">
				Momen-momen indah perjalanan cinta kami
			</p>
		</div>

		<!-- Masonry Grid Layout -->
		{#if galleryPhotos.length === 0}
			<div class="text-center text-wedding-text-muted py-12">
				<p>Galeri foto akan segera hadir</p>
			</div>
		{:else}
			<div bind:this={containerRef} class="relative w-full" style="height: {containerHeight}px;">
				{#each photoLayouts as photoLayout (photoLayout.photo.id)}
					<div
						class="group absolute overflow-hidden rounded-lg shadow-md transition-all hover:shadow-xl"
						style="left: {photoLayout.left}px; top: {photoLayout.top}px; width: {photoLayout.width}px; {photoLayout.loaded
							? `height: ${photoLayout.height}px; opacity: 1;`
							: 'opacity: 0;'}"
					>
						<img
							src={photoLayout.photo.url}
							alt={photoLayout.photo.alt}
							loading="lazy"
							onload={(e) => handleImageLoad(e, photoLayout)}
							class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
						/>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

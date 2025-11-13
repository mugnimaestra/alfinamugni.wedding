<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale, fly } from 'svelte/transition';
	import { quintOut, quintIn, quintInOut } from 'svelte/easing';
	import type { TransitionConfig } from 'svelte/transition';

	// Custom transition that combines fade and scale
	function fadeScale(
		node: Element,
		{
			duration = 300,
			start = 0.95,
			easing = quintOut,
		}: { duration?: number; start?: number; easing?: (t: number) => number } = {}
	): TransitionConfig {
		// Respect reduced motion preference
		if (prefersReducedMotion()) {
			return { duration: 0 };
		}

		const o = +getComputedStyle(node).opacity;
		const s = start;

		return {
			duration,
			easing,
			css: (t) => {
				const eased = easing(t);
				return `opacity: ${eased * o}; transform: scale(${s + (1 - s) * eased})`;
			},
		};
	}

	// Custom fade transition that respects reduced motion
	function accessibleFade(
		node: Element,
		{
			duration = 300,
			easing = quintOut,
		}: { duration?: number; easing?: (t: number) => number } = {}
	) {
		if (prefersReducedMotion()) {
			return { duration: 0 };
		}
		return fade(node, { duration, easing });
	}

	// Custom fly transition that respects reduced motion
	function accessibleFly(
		node: Element,
		params: { x?: number; y?: number; duration?: number; easing?: (t: number) => number } = {}
	) {
		if (prefersReducedMotion()) {
			return { duration: 0 };
		}
		return fly(node, params);
	}

	// Custom transition that combines fly and fade for image navigation
	function flyFade(
		node: Element,
		params: {
			x?: number;
			y?: number;
			duration?: number;
			easing?: (t: number) => number;
			direction?: 'in' | 'out';
		} = {}
	): TransitionConfig {
		if (prefersReducedMotion()) {
			return { duration: 0 };
		}

		const x = params.x ?? 0;
		const y = params.y ?? 0;
		const duration = params.duration ?? 200;
		const easing = params.easing ?? quintInOut;
		const direction = params.direction;

		return {
			duration,
			easing,
			css: (t) => {
				const eased = easing(t);
				// For 'in' transitions: opacity goes from 0 to 1, transform from offset to 0
				// For 'out' transitions: opacity goes from 1 to 0, transform from 0 to offset
				if (direction === 'out') {
					// Leaving: fade out and move to offset position
					return `opacity: ${1 - eased}; transform: translate(${eased * x}px, ${eased * y}px)`;
				} else {
					// Entering: fade in and move from offset to center
					return `opacity: ${eased}; transform: translate(${(1 - eased) * x}px, ${
						(1 - eased) * y
					}px)`;
				}
			},
		};
	}

	interface Photo {
		id: string | number;
		url: string;
		description?: string;
		uploader_name?: string;
		upload_date?: string;
		content_type?: string;
		media_type?: 'image' | 'video';
	}

	interface Props {
		photos: Photo[];
		currentIndex: number;
		isOpen: boolean;
		onClose: () => void;
	}

	let { photos, currentIndex, isOpen, onClose }: Props = $props();

	let currentPhotoIndex = $state(currentIndex);
	let previousPhotoIndex = $state<number | null>(null);
	let navigationDirection = $state<'left' | 'right' | null>(null);
	let lastSyncedPropIndex = $state(currentIndex);

	// Helper to check reduced motion preference
	function prefersReducedMotion(): boolean {
		if (typeof window === 'undefined') return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}

	// Helper to check if a photo is a video
	function isVideo(photo: Photo | null): boolean {
		if (!photo) return false;
		return photo.media_type === 'video' || photo.content_type?.startsWith('video/') || false;
	}

	// Update currentPhotoIndex when currentIndex prop changes (only from external prop changes)
	$effect(() => {
		if (isOpen && currentIndex >= 0 && currentIndex < photos.length) {
			// Only sync when the prop actually changed from what we last saw
			// This prevents internal navigation from being overridden
			if (currentIndex !== lastSyncedPropIndex) {
				previousPhotoIndex = currentPhotoIndex !== currentIndex ? currentPhotoIndex : null;
				currentPhotoIndex = currentIndex;
				lastSyncedPropIndex = currentIndex;
			}
		} else if (!isOpen) {
			// Reset when modal closes
			currentPhotoIndex = 0;
			previousPhotoIndex = null;
			navigationDirection = null;
			lastSyncedPropIndex = currentIndex;
		}
	});

	const currentPhoto = $derived(photos[currentPhotoIndex] || null);

	const canGoPrevious = $derived(currentPhotoIndex > 0);
	const canGoNext = $derived(currentPhotoIndex < photos.length - 1);
	const photoCounter = $derived(`${currentPhotoIndex + 1} / ${photos.length}`);

	function goToPrevious() {
		if (canGoPrevious) {
			const oldIndex = currentPhotoIndex;
			previousPhotoIndex = oldIndex;
			navigationDirection = 'left';
			currentPhotoIndex = currentPhotoIndex - 1;
			// Clear previous photo and navigation direction after transition completes
			setTimeout(() => {
				previousPhotoIndex = null;
				navigationDirection = null;
			}, 250);
		}
	}

	function goToNext() {
		if (canGoNext) {
			const oldIndex = currentPhotoIndex;
			previousPhotoIndex = oldIndex;
			navigationDirection = 'right';
			currentPhotoIndex = currentPhotoIndex + 1;
			// Clear previous photo and navigation direction after transition completes
			setTimeout(() => {
				previousPhotoIndex = null;
				navigationDirection = null;
			}, 250);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;

		if (e.key === 'Escape') {
			onClose();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			goToPrevious();
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			goToNext();
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeydown);
			return () => window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if isOpen && currentPhoto && photos.length > 0}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div
			class="absolute inset-0 bg-black/80 backdrop-blur-sm"
			onclick={onClose}
			transition:accessibleFade={{ duration: 300, easing: quintOut }}
		/>

		<div
			class="relative z-10 w-full max-w-5xl"
			in:fadeScale={{ duration: 300, start: 0.95, easing: quintOut }}
			out:fadeScale={{ duration: 250, start: 0.95, easing: quintIn }}
		>
			<!-- Close Button -->
			<button
				type="button"
				onclick={onClose}
				class="absolute -top-12 right-0 z-20 rounded-lg p-2 text-white transition hover:bg-white/10"
				style="pointer-events: auto;"
				transition:accessibleFade={{ duration: 200, delay: 100 }}
			>
				<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>

			<!-- Photo Counter -->
			{#if photos.length > 1}
				<div
					class="absolute -top-12 left-0 rounded-lg bg-black/50 px-3 py-1.5 text-sm text-white"
					transition:accessibleFade={{ duration: 200, delay: 100 }}
				>
					{photoCounter}
				</div>
			{/if}

			<!-- Previous Button -->
			{#if canGoPrevious}
				<button
					type="button"
					onclick={goToPrevious}
					class="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-wedding-accent"
					style="pointer-events: auto;"
					aria-label="Previous photo"
					transition:accessibleFade={{ duration: 200, delay: 150 }}
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
			{/if}

			<!-- Next Button -->
			{#if canGoNext}
				<button
					type="button"
					onclick={goToNext}
					class="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 p-3 text-white transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-wedding-accent"
					style="pointer-events: auto;"
					aria-label="Next photo"
					transition:accessibleFade={{ duration: 200, delay: 150 }}
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			{/if}

			<div class="rounded-lg bg-white p-2 shadow-2xl">
				<div
					class="relative w-full flex items-center justify-center overflow-hidden"
					style="min-height: 70vh; pointer-events: none;"
				>
					<!-- Previous image/video (fading out) -->
					{#if previousPhotoIndex !== null && previousPhotoIndex !== currentPhotoIndex && photos[previousPhotoIndex]}
						{#key photos[previousPhotoIndex].id || previousPhotoIndex}
							<div
								class="absolute inset-0 flex items-center justify-center"
								out:flyFade={{
									x:
										navigationDirection === 'left' ? 50 : navigationDirection === 'right' ? -50 : 0,
									duration: 200,
									easing: quintInOut,
									direction: 'out',
								}}
								style="z-index: 1; pointer-events: none;"
							>
								{#if isVideo(photos[previousPhotoIndex])}
									<video
										src={photos[previousPhotoIndex].url}
										class="max-h-[70vh] w-full rounded object-contain"
										controls
										muted
										loop
									></video>
								{:else}
									<img
										src={photos[previousPhotoIndex].url}
										alt={photos[previousPhotoIndex].description || 'Wedding photo'}
										class="max-h-[70vh] w-full rounded object-contain"
									/>
								{/if}
							</div>
						{/key}
					{/if}

					<!-- Current image/video (fading in) -->
					{#if currentPhoto}
						{#key currentPhoto.id || currentPhotoIndex}
							<div
								class="absolute inset-0 flex items-center justify-center"
								in:flyFade={{
									x:
										navigationDirection === 'left' ? -50 : navigationDirection === 'right' ? 50 : 0,
									duration: navigationDirection ? 200 : 0,
									easing: quintInOut,
									direction: 'in',
								}}
								style="z-index: 2; pointer-events: auto;"
							>
								{#if isVideo(currentPhoto)}
									<video
										src={currentPhoto.url}
										class="max-h-[70vh] w-full rounded object-contain"
										controls
										autoplay
										muted
										loop
									></video>
								{:else}
									<img
										src={currentPhoto.url}
										alt={currentPhoto.description || 'Wedding photo'}
										class="max-h-[70vh] w-full rounded object-contain"
									/>
								{/if}
							</div>
						{/key}
					{/if}
				</div>

				{#if currentPhoto.description || currentPhoto.uploader_name}
					<div class="border-t border-wedding-beige p-4">
						{#if currentPhoto.description}
							<p class="text-wedding-text-primary">
								{currentPhoto.description}
							</p>
						{/if}
						{#if currentPhoto.uploader_name}
							<p class="mt-2 text-sm text-wedding-text-muted">
								Shared by <span class="font-medium text-wedding-text-primary"
									>{currentPhoto.uploader_name}</span
								>
								{#if currentPhoto.upload_date}
									· {new Date(currentPhoto.upload_date).toLocaleDateString()}
								{/if}
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

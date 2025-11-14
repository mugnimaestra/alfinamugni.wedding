<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Dynamic import GLightbox - hanya di client-side
	let GLightbox: any = null;
	let glightboxLoaded = $state(false);

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

	interface GLightboxElement {
		href: string;
		type: 'image' | 'video';
		source?: string;
		title?: string;
		description?: string;
		width?: string;
	}

	interface GLightboxOptions {
		elements: GLightboxElement[];
		autoplayVideos?: boolean;
		touchNavigation?: boolean;
		loop?: boolean;
		keyboardNavigation?: boolean;
		closeOnOutsideClick?: boolean;
		openEffect?: string;
		closeEffect?: string;
		plyr?: {
			config?: {
				ratio?: string;
				muted?: boolean;
				hideControls?: boolean;
				[key: string]: any;
			};
		};
		skin?: string;
		[key: string]: any;
	}

	let { photos, currentIndex, isOpen, onClose }: Props = $props();

	let lightboxInstance: any = null;

	// Load GLightbox dan CSS hanya di client-side
	onMount(async () => {
		if (!browser) return;

		try {
			// Import CSS secara dynamic
			await import('glightbox/dist/css/glightbox.css');

			// Import GLightbox secara dynamic
			const glightboxModule = await import('glightbox');
			GLightbox = glightboxModule.default;
			glightboxLoaded = true;
		} catch (error) {
			console.error('Failed to load GLightbox:', error);
		}
	});

	// Helper to check if a photo is a video
	function isVideo(photo: Photo): boolean {
		return photo.media_type === 'video' || photo.content_type?.startsWith('video/') || false;
	}

	// Transform Photo interface to GLightbox element format
	function transformPhotosToElements(photos: Photo[]): GLightboxElement[] {
		return photos.map((photo) => {
			const isVideoType = isVideo(photo);

			// Build description HTML
			let descriptionHtml = '';
			if (photo.description || photo.uploader_name) {
				descriptionHtml = '<div class="glightbox-description-content">';
				if (photo.description) {
					descriptionHtml += `<p class="glightbox-desc-text">${photo.description}</p>`;
				}
				if (photo.uploader_name) {
					const dateStr = photo.upload_date
						? ` · ${new Date(photo.upload_date).toLocaleDateString()}`
						: '';
					descriptionHtml += `<p class="glightbox-uploader-info">Shared by <span class="glightbox-uploader-name">${photo.uploader_name}</span>${dateStr}</p>`;
				}
				descriptionHtml += '</div>';
			}

			return {
				href: photo.url,
				type: isVideoType ? 'video' : 'image',
				source: isVideoType ? 'local' : undefined,
				title: photo.description || '',
				description: descriptionHtml || undefined,
				width: isVideoType ? '90vw' : undefined,
			};
		});
	}

	// Initialize GLightbox
	function initLightbox() {
		if (!browser || !glightboxLoaded || !GLightbox || lightboxInstance) return;

		const elements = transformPhotosToElements(photos);

		lightboxInstance = (GLightbox as any)({
			elements,
			autoplayVideos: false,
			touchNavigation: true,
			loop: false,
			keyboardNavigation: true,
			closeOnOutsideClick: true,
			openEffect: 'fade',
			closeEffect: 'fade',
			plyr: {
				config: {
					ratio: '16:9',
					muted: false,
					hideControls: false,
				} as any,
			},
			skin: 'wedding-theme',
		});

		// Listen to close event
		lightboxInstance.on('close', () => {
			onClose();
		});
	}

	// Update lightbox elements when photos change
	function updateLightboxElements() {
		if (!lightboxInstance) return;
		const elements = transformPhotosToElements(photos);
		lightboxInstance.setElements(elements);
	}

	// Watch for isOpen changes
	$effect(() => {
		// Pastikan GLightbox sudah dimuat sebelum menggunakan
		if (!glightboxLoaded || !browser) return;

		if (isOpen && photos.length > 0 && currentIndex >= 0 && currentIndex < photos.length) {
			if (!lightboxInstance) {
				initLightbox();
			}
			if (lightboxInstance) {
				updateLightboxElements();
				// Small delay to ensure DOM is ready
				setTimeout(() => {
					lightboxInstance.openAt(currentIndex);
				}, 50);
			}
		} else if (!isOpen && lightboxInstance) {
			lightboxInstance.close();
		}
	});

	// Watch for photos changes (only update if lightbox is already initialized)
	$effect(() => {
		if (lightboxInstance && photos.length > 0 && isOpen) {
			updateLightboxElements();
		}
	});

	onDestroy(() => {
		if (lightboxInstance) {
			lightboxInstance.destroy();
			lightboxInstance = null;
		}
	});
</script>

<style>
	/* Custom GLightbox theme untuk wedding design */
	:global(.glightbox-wedding-theme .gslide-media) {
		background-color: transparent;
	}

	:global(.glightbox-wedding-theme .goverlay) {
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
	}

	:global(.glightbox-wedding-theme .gslide-inner-content) {
		background-color: white;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	:global(.glightbox-wedding-theme .gslide-description) {
		background-color: white;
		border-top: 1px solid var(--wedding-beige);
		padding: 1rem;
	}

	:global(.glightbox-wedding-theme .gslide-title) {
		font-family: 'Playfair Display', serif;
		color: var(--wedding-text-primary);
		font-size: 1.25rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	:global(.glightbox-wedding-theme .gdesc-inner) {
		padding: 0;
	}

	:global(.glightbox-description-content) {
		color: var(--wedding-text-primary);
	}

	:global(.glightbox-desc-text) {
		color: var(--wedding-text-primary);
		margin-bottom: 0.5rem;
		line-height: 1.6;
	}

	:global(.glightbox-uploader-info) {
		font-size: 0.875rem;
		color: var(--wedding-text-muted);
		margin-top: 0.5rem;
	}

	:global(.glightbox-uploader-name) {
		font-weight: 500;
		color: var(--wedding-text-primary);
	}

	:global(.glightbox-wedding-theme .gbtn) {
		background-color: rgba(0, 0, 0, 0.5);
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	:global(.glightbox-wedding-theme .gbtn:hover) {
		background-color: rgba(0, 0, 0, 0.7);
		transform: scale(1.1);
	}

	:global(.glightbox-wedding-theme .gclose) {
		top: 1rem;
		right: 1rem;
	}

	:global(.glightbox-wedding-theme .gprev),
	:global(.glightbox-wedding-theme .gnext) {
		width: 48px;
		height: 48px;
	}

	:global(.glightbox-wedding-theme .gprev svg),
	:global(.glightbox-wedding-theme .gnext svg),
	:global(.glightbox-wedding-theme .gclose svg) {
		fill: white;
		width: 24px;
		height: 24px;
	}

	:global(.glightbox-wedding-theme .gslide-media img) {
		max-height: 80vh;
		object-fit: contain;
	}

	:global(.glightbox-wedding-theme .gslide-media video) {
		max-height: 80vh;
		width: auto;
	}

	/* Counter styling */
	:global(.glightbox-wedding-theme .gslide-counter) {
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: 20px;
		font-size: 0.875rem;
		top: 1rem;
		left: 1rem;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		:global(.glightbox-wedding-theme .gslide-media img),
		:global(.glightbox-wedding-theme .gslide-media video) {
			max-height: 70vh;
		}

		:global(.glightbox-wedding-theme .gprev),
		:global(.glightbox-wedding-theme .gnext) {
			width: 40px;
			height: 40px;
		}
	}
</style>

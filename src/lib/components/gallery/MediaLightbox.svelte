<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Dynamic import GLightbox - hanya di client-side
	let GLightbox: any = null;
	let glightboxLoaded = $state(false);

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
		photos: Photo[];
		currentIndex: number;
		isOpen: boolean;
		onClose: () => void;
		onSlideChange?: (photoId: number) => void;
	}

	interface GLightboxElement {
		href: string;
		type: 'image' | 'video';
		source?: string;
		title?: string;
		description?: string;
		width?: string;
		poster?: string;
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
				ratio?: string | null;
				muted?: boolean;
				hideControls?: boolean;
				[key: string]: any;
			};
		};
		skin?: string;
		[key: string]: any;
	}

	interface GLightboxInstance {
		setElements: (elements: GLightboxElement[]) => void;
		openAt: (index: number) => void;
		close: () => void;
		destroy: () => void;
		on: (event: string, callback: (data?: any) => void) => void;
		getSlideIndex?: () => number;
	}

	type GLightboxFactory = (options: GLightboxOptions) => GLightboxInstance;

	let { photos, currentIndex, isOpen, onClose, onSlideChange }: Props = $props();

	let lightboxInstance: GLightboxInstance | null = null;
	let lastReportedIndex = $state(-1);
	let navigationObserver: MutationObserver | null = null;
	let navCleanup: (() => void) | null = null;

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
						? ` · ${new Date(photo.upload_date).toLocaleString('en-US', {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
								hour: '2-digit',
								minute: '2-digit',
								second: '2-digit',
								hour12: false
							})}`
						: '';
					descriptionHtml += `<p class="glightbox-uploader-info">Shared by <span class="glightbox-uploader-name">${photo.uploader_name}</span>${dateStr}</p>`;
				}
				descriptionHtml += '</div>';
			}

			// Validate and set poster/thumbnail for videos
			let posterUrl: string | undefined = undefined;
			if (isVideoType && photo.thumbnail) {
				// Ensure thumbnail URL is valid (not empty, null, or undefined)
				// Handle both string and potential null values from server
				const thumbnail = typeof photo.thumbnail === 'string' ? photo.thumbnail.trim() : '';
				if (thumbnail && thumbnail.length > 0) {
					posterUrl = thumbnail;
					// Debug logging for thumbnail URLs
					if (browser && import.meta.env.DEV) {
						console.log('[MediaLightbox] Video thumbnail:', {
							photoId: photo.id,
							thumbnailUrl: posterUrl,
							videoUrl: photo.url,
						});
					}
				}
			}

			const element: GLightboxElement = {
				href: photo.url,
				type: isVideoType ? 'video' : 'image',
				source: isVideoType ? 'local' : undefined,
				title: photo.description || '',
				description: descriptionHtml || undefined,
				width: isVideoType ? '90vw' : undefined,
				poster: posterUrl,
			};

			return element;
		});
	}

	// Initialize GLightbox
	function initLightbox() {
		if (!browser || !glightboxLoaded || !GLightbox || lightboxInstance) return;

		const elements = transformPhotosToElements(photos);

		lightboxInstance = GLightbox({
			elements,
			autoplayVideos: false,
			touchNavigation: true,
			loop: false,
			keyboardNavigation: true,
			closeOnOutsideClick: true,
			closeButton: true,
			openEffect: 'fade',
			closeEffect: 'fade',
			plyr: {
				config: {
					ratio: null, // Respect native video aspect ratio
					muted: false,
					hideControls: false,
				},
			},
			skin: 'wedding-theme',
		});

		// Listen to close event
		if (lightboxInstance) {
			lightboxInstance.on('close', () => {
				onClose();
			});

			// Listen to slide change events to update hash
			// GLightbox uses different event names in different versions
			if (onSlideChange) {
				const handleSlideChange = (data?: any) => {
					// Try to get index from event data or from GLightbox instance
					let slideIndex = -1;
					
					if (data) {
						// Try different possible data structures
						slideIndex = data.index ?? data.current ?? data.slideIndex ?? -1;
					}
					
					// Fallback: try to get from GLightbox instance if available
					if (slideIndex === -1 && lightboxInstance?.getSlideIndex) {
						slideIndex = lightboxInstance.getSlideIndex();
					}
					
					// Final fallback: use currentIndex prop
					if (slideIndex === -1) {
						slideIndex = currentIndex;
					}

					// Only update if index changed and is valid
					if (slideIndex >= 0 && slideIndex < photos.length && slideIndex !== lastReportedIndex) {
						lastReportedIndex = slideIndex;
						const photo = photos[slideIndex];
						const photoId = typeof photo.id === 'number' ? photo.id : parseInt(String(photo.id), 10);
						if (!isNaN(photoId)) {
							onSlideChange(photoId);
						}
					}
				};

				// Try multiple event names (different GLightbox versions use different names)
				lightboxInstance.on('slide_changed', handleSlideChange);
				lightboxInstance.on('slideChange', handleSlideChange);
				lightboxInstance.on('slidechange', handleSlideChange);

				// Also listen to navigation events as a fallback
				// Wait a bit for DOM to be ready
				setTimeout(() => {
					if (!browser) return;
					
					const getCurrentSlideIndex = (): number => {
						// Try to get slide index from counter
						const slideCounter = document.querySelector('.glightbox-wedding-theme .gslide-counter');
						if (slideCounter) {
							const counterText = slideCounter.textContent || '';
							const match = counterText.match(/(\d+)\s*\/\s*\d+/);
							if (match) {
								return parseInt(match[1], 10) - 1; // Convert to 0-based index
							}
						}
						return -1;
					};
					
					const handleNavAction = () => {
						// Small delay to let GLightbox update the slide first
						setTimeout(() => {
							const slideIndex = getCurrentSlideIndex();
							if (slideIndex >= 0 && slideIndex < photos.length && slideIndex !== lastReportedIndex) {
								lastReportedIndex = slideIndex;
								const photo = photos[slideIndex];
								const photoId = typeof photo.id === 'number' ? photo.id : parseInt(String(photo.id), 10);
								if (!isNaN(photoId)) {
									onSlideChange(photoId);
								}
							}
						}, 100);
					};
					
					// Listen to navigation button clicks
					const prevButton = document.querySelector('.glightbox-wedding-theme .gprev');
					const nextButton = document.querySelector('.glightbox-wedding-theme .gnext');
					
					if (prevButton) {
						prevButton.addEventListener('click', handleNavAction);
					}
					if (nextButton) {
						nextButton.addEventListener('click', handleNavAction);
					}
					
					// Also listen to keyboard arrow keys (GLightbox handles these)
					const handleKeyDown = (e: KeyboardEvent) => {
						if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
							handleNavAction();
						}
					};
					
					document.addEventListener('keydown', handleKeyDown);
					
					// Watch slide counter for changes (catches touch swipes and all navigation methods)
					const slideCounter = document.querySelector('.glightbox-wedding-theme .gslide-counter');
					if (slideCounter) {
						navigationObserver = new MutationObserver(() => {
							// Small delay to let GLightbox finish updating
							setTimeout(() => {
								const slideIndex = getCurrentSlideIndex();
								if (slideIndex >= 0 && slideIndex < photos.length && slideIndex !== lastReportedIndex) {
									lastReportedIndex = slideIndex;
									const photo = photos[slideIndex];
									const photoId = typeof photo.id === 'number' ? photo.id : parseInt(String(photo.id), 10);
									if (!isNaN(photoId)) {
										onSlideChange(photoId);
									}
								}
							}, 50);
						});
						
						// Watch for text content changes in the counter
						navigationObserver.observe(slideCounter, {
							childList: true,
							characterData: true,
							subtree: true
						});
					}
					
					// Store cleanup function
					navCleanup = () => {
						if (prevButton) {
							prevButton.removeEventListener('click', handleNavAction);
						}
						if (nextButton) {
							nextButton.removeEventListener('click', handleNavAction);
						}
						document.removeEventListener('keydown', handleKeyDown);
					};
				}, 200);
			}
		}
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
					if (lightboxInstance) {
						lightboxInstance.openAt(currentIndex);
					}
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

	// Track when lightbox opens to set initial reported index
	$effect(() => {
		if (isOpen && currentIndex >= 0 && currentIndex < photos.length) {
			// Reset last reported index when modal opens
			lastReportedIndex = currentIndex;
		}
	});

	onDestroy(() => {
		if (navigationObserver) {
			navigationObserver.disconnect();
			navigationObserver = null;
		}
		
		// Clean up navigation listeners
		if (navCleanup) {
			navCleanup();
			navCleanup = null;
		}
		
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
		font-size: 1rem;
		color: var(--wedding-text-muted);
		margin-top: 0.5rem;
	}

	:global(.glightbox-uploader-name) {
		font-weight: 500;
		color: var(--wedding-text-primary);
	}

	/* Video-specific minimalist caption styles */
	:global(.glightbox-wedding-theme .gslide:has(.plyr) .gslide-description) {
		padding: 0.5rem !important;
	}

	:global(.glightbox-wedding-theme .gslide:has(.plyr) .gslide-title) {
		margin-bottom: 0.25rem !important;
	}

	:global(.glightbox-wedding-theme .gslide:has(.plyr) .glightbox-desc-text) {
		font-size: 0.875rem !important;
		margin-bottom: 0.25rem !important;
		line-height: 1.4 !important;
	}

	:global(.glightbox-wedding-theme .gslide:has(.plyr) .glightbox-uploader-info) {
		font-size: 0.8rem !important;
		margin-top: 0.25rem !important;
	}

	/* Base button styles */
	:global(.glightbox-wedding-theme .gbtn) {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: auto !important;
	}

	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Close Button - Elegant Wedding Theme */
	:global(.glightbox-wedding-theme .gclose) {
		position: absolute !important;
		top: 1.5rem !important;
		right: 1.5rem !important;
		width: 44px !important;
		height: 44px !important;
		z-index: 9999 !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		visibility: visible !important;
		opacity: 1 !important;
		background-color: rgba(250, 247, 245, 0.9) !important;
		border: 1.5px solid rgba(77, 51, 38, 0.3) !important;
		border-radius: 50% !important;
		backdrop-filter: blur(8px) !important;
		-webkit-backdrop-filter: blur(8px) !important;
		box-shadow: 0 2px 8px rgba(77, 51, 38, 0.15) !important;
		transition: all 0.2s ease !important;
		pointer-events: auto !important;
		animation: fadeInScale 0.3s ease-out forwards !important;
	}

	:global(.glightbox-wedding-theme .gclose:hover) {
		transform: scale(1.05) !important;
		border-color: rgba(77, 51, 38, 0.5) !important;
		box-shadow: 0 4px 12px rgba(77, 51, 38, 0.25) !important;
		background-color: rgba(250, 247, 245, 0.95) !important;
	}

	:global(.glightbox-wedding-theme .gclose svg) {
		fill: #4d3326;
		width: 20px;
		height: 20px;
		stroke: #4d3326;
		stroke-width: 2.5;
		transition: all 0.2s ease;
	}

	:global(.glightbox-wedding-theme .gclose:hover svg) {
		transform: rotate(90deg);
	}

	/* Navigation Arrows - Elegant Floating Controls */
	:global(.glightbox-wedding-theme .gprev),
	:global(.glightbox-wedding-theme .gnext) {
		position: absolute !important;
		width: 56px !important;
		height: 56px !important;
		top: 50% !important;
		transform: translateY(-50%) !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		visibility: visible !important;
		background-color: rgba(250, 247, 245, 0.85) !important;
		border: 1.5px solid rgba(77, 51, 38, 0.2) !important;
		border-radius: 50% !important;
		backdrop-filter: blur(8px) !important;
		-webkit-backdrop-filter: blur(8px) !important;
		box-shadow: 0 2px 8px rgba(77, 51, 38, 0.15) !important;
		transition: all 0.2s ease !important;
		pointer-events: auto !important;
		z-index: 9998 !important;
	}

	:global(.glightbox-wedding-theme .gprev) {
		left: 1.5rem !important;
		opacity: 0 !important;
		animation: slideInLeft 0.3s ease-out 0.1s forwards !important;
	}

	:global(.glightbox-wedding-theme .gnext) {
		right: 1.5rem !important;
		opacity: 0 !important;
		animation: slideInRight 0.3s ease-out 0.1s forwards !important;
	}

	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateY(-50%) translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) translateX(0);
		}
	}

	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateY(-50%) translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateY(-50%) translateX(0);
		}
	}

	:global(.glightbox-wedding-theme .gprev:hover),
	:global(.glightbox-wedding-theme .gnext:hover) {
		transform: translateY(-50%) scale(1.08) !important;
		background-color: rgba(250, 247, 245, 0.95) !important;
		border-color: rgba(77, 51, 38, 0.4) !important;
		box-shadow: 0 4px 12px rgba(77, 51, 38, 0.25) !important;
	}

	:global(.glightbox-wedding-theme .gprev svg),
	:global(.glightbox-wedding-theme .gnext svg) {
		fill: #4d3326;
		width: 24px;
		height: 24px;
		transition: transform 0.2s ease;
	}

	:global(.glightbox-wedding-theme .gprev:hover svg) {
		transform: translateX(-2px);
	}

	:global(.glightbox-wedding-theme .gnext:hover svg) {
		transform: translateX(2px);
	}

	:global(.glightbox-wedding-theme .gslide-media img) {
		max-height: 80vh;
		object-fit: contain;
	}

	:global(.glightbox-wedding-theme .gslide-media video) {
		max-height: 80vh;
		width: auto;
	}

	/* Override Plyr default 16:9 aspect ratio */
	:global(.glightbox-wedding-theme .gslide-media video),
	:global(.glightbox-wedding-theme .plyr__video-wrapper) {
		aspect-ratio: auto !important;
		max-height: 80vh !important;
		width: auto !important;
	}

	:global(.glightbox-wedding-theme .plyr) {
		aspect-ratio: auto !important;
	}

	:global(.glightbox-wedding-theme .plyr__video-embed) {
		aspect-ratio: auto !important;
		padding-bottom: 0 !important; /* Remove 16:9 padding */
	}

	/* Counter Badge - Elegant Wedding Typography */
	:global(.glightbox-wedding-theme .gslide-counter) {
		position: absolute !important;
		top: 1.5rem !important;
		left: 1.5rem !important;
		z-index: 9997 !important;
		visibility: visible !important;
		background-color: rgba(77, 51, 38, 0.85) !important;
		color: #faf7f5 !important;
		padding: 0.5rem 1rem !important;
		border-radius: 24px !important;
		font-size: 0.875rem !important;
		font-weight: 500 !important;
		font-family: 'Playfair Display', serif !important;
		box-shadow: 0 2px 8px rgba(77, 51, 38, 0.2) !important;
		backdrop-filter: blur(4px) !important;
		-webkit-backdrop-filter: blur(4px) !important;
		opacity: 0 !important;
		animation: fadeInSlideDown 0.3s ease-out 0.15s forwards !important;
		transition: all 0.2s ease !important;
		pointer-events: auto !important;
		display: block !important;
	}

	@keyframes fadeInSlideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.glightbox-wedding-theme .gslide-counter:hover) {
		background-color: rgba(77, 51, 38, 0.95) !important;
		box-shadow: 0 4px 12px rgba(77, 51, 38, 0.3) !important;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		:global(.glightbox-wedding-theme .gslide-media img),
		:global(.glightbox-wedding-theme .gslide-media video) {
			max-height: 70vh;
		}

		/* Mobile: Override Plyr aspect ratio */
		:global(.glightbox-wedding-theme .plyr__video-wrapper) {
			max-height: 70vh !important;
		}

		/* Mobile Overlay - Lighter brown backdrop */
		:global(.glightbox-wedding-theme .goverlay) {
			background: rgba(77, 51, 38, 0.85) !important;
			backdrop-filter: blur(4px) !important;
			-webkit-backdrop-filter: blur(4px) !important;
		}

		/* Mobile Description Area - Brown flat background */
		:global(.glightbox-wedding-theme .gslide-description) {
			background-color: #4d3326 !important;
			border-top: none !important;
		}

		:global(.glightbox-wedding-theme .gslide-title) {
			color: #faf7f5 !important;
		}

		:global(.glightbox-description-content) {
			color: #faf7f5 !important;
		}

		:global(.glightbox-desc-text) {
			color: #faf7f5 !important;
		}

		:global(.glightbox-uploader-info) {
			color: rgba(250, 247, 245, 0.8) !important;
		}

		:global(.glightbox-uploader-name) {
			color: #faf7f5 !important;
		}

		/* Mobile Video-specific minimalist caption styles */
		:global(.glightbox-wedding-theme .gslide:has(.plyr) .gslide-description) {
			padding: 0.375rem !important;
		}

		:global(.glightbox-wedding-theme .gslide:has(.plyr) .gslide-title) {
			margin-bottom: 0.2rem !important;
		}

		:global(.glightbox-wedding-theme .gslide:has(.plyr) .glightbox-desc-text) {
			font-size: 0.8rem !important;
			margin-bottom: 0.2rem !important;
			line-height: 1.35 !important;
		}

		:global(.glightbox-wedding-theme .gslide:has(.plyr) .glightbox-uploader-info) {
			font-size: 0.75rem !important;
			margin-top: 0.2rem !important;
		}

		/* Mobile Navigation Arrows */
		:global(.glightbox-wedding-theme .gprev),
		:global(.glightbox-wedding-theme .gnext) {
			width: 48px !important;
			height: 48px !important;
		}

		:global(.glightbox-wedding-theme .gprev) {
			left: 1rem !important;
		}

		:global(.glightbox-wedding-theme .gnext) {
			right: 1rem !important;
		}

		:global(.glightbox-wedding-theme .gprev svg),
		:global(.glightbox-wedding-theme .gnext svg) {
			width: 20px;
			height: 20px;
		}

		/* Mobile Close Button */
		:global(.glightbox-wedding-theme .gclose) {
			top: 1rem !important;
			right: 1rem !important;
			width: 40px !important;
			height: 40px !important;
			background-color: rgba(250, 247, 245, 0.95) !important;
		}

		:global(.glightbox-wedding-theme .gclose svg) {
			width: 18px;
			height: 18px;
		}

		/* Mobile Counter */
		:global(.glightbox-wedding-theme .gslide-counter) {
			top: 1rem !important;
			left: 1rem !important;
			font-size: 0.8125rem !important;
			padding: 0.375rem 0.875rem !important;
		}
	}
</style>

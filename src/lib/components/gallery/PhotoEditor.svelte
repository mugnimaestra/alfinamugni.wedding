<script lang="ts">
	import { Sliders, RotateCw, X } from 'lucide-svelte';

	interface PhotoEditorProps {
		imageUrl: string;
		onSave?: (editedImage: Blob) => void;
		onCancel?: () => void;
	}

	let { imageUrl, onSave, onCancel }: PhotoEditorProps = $props();

	// Editor state
	let brightness = $state(0);
	let contrast = $state(0);
	let saturation = $state(0);
	let rotation = $state(0);
	let selectedFilter = $state<string | null>(null);

	// Canvas refs
	let canvas: HTMLCanvasElement;
	let previewCanvas: HTMLCanvasElement;
	let originalImage: HTMLImageElement;
	let isProcessing = $state(false);

	// Available filters
	const filters = [
		{ id: 'none', name: 'None', css: 'none' },
		{ id: 'vintage', name: 'Vintage', css: 'sepia(0.5) contrast(0.8)' },
		{ id: 'bw', name: 'B&W', css: 'grayscale(1) contrast(1.2)' },
		{ id: 'warm', name: 'Warm', css: 'sepia(0.3) saturate(1.3)' },
		{ id: 'cool', name: 'Cool', css: 'hue-rotate(180deg) saturate(0.8)' },
		{ id: 'dramatic', name: 'Dramatic', css: 'contrast(1.5) saturate(1.2)' }
	];

	// Load and process image
	$effect(() => {
		if (canvas && imageUrl) {
			loadAndProcessImage();
		}
	});

	// Update preview when adjustments change
	$effect(() => {
		if (canvas && originalImage) {
			applyEdits();
		}
	});

	async function loadAndProcessImage() {
		const img = new Image();
		img.crossOrigin = 'anonymous';

		img.onload = () => {
			originalImage = img;
			canvas.width = img.width;
			canvas.height = img.height;
			previewCanvas.width = img.width;
			previewCanvas.height = img.height;
			applyEdits();
		};

		img.onerror = () => {
			console.error('Failed to load image');
		};

		img.src = imageUrl;
	}

	function applyEdits() {
		if (!canvas || !originalImage) return;

		const ctx = canvas.getContext('2d')!;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Save context state
		ctx.save();

		// Apply rotation
		if (rotation !== 0) {
			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.rotate((rotation * Math.PI) / 180);
			ctx.translate(-canvas.width / 2, -canvas.height / 2);
		}

		// Draw original image
		ctx.drawImage(originalImage, 0, 0);

		// Restore context
		ctx.restore();

		// Get image data for adjustments
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;

		// Apply brightness, contrast, and saturation
		for (let i = 0; i < data.length; i += 4) {
			// Get RGB values
			let r = data[i];
			let g = data[i + 1];
			let b = data[i + 2];

			// Apply brightness
			if (brightness !== 0) {
				r = clamp(r + brightness);
				g = clamp(g + brightness);
				b = clamp(b + brightness);
			}

			// Apply contrast
			if (contrast !== 0) {
				const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
				r = clamp(factor * (r - 128) + 128);
				g = clamp(factor * (g - 128) + 128);
				b = clamp(factor * (b - 128) + 128);
			}

			// Apply saturation
			if (saturation !== 0) {
				const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
				const satFactor = 1 + saturation / 100;
				r = clamp(gray + satFactor * (r - gray));
				g = clamp(gray + satFactor * (g - gray));
				b = clamp(gray + satFactor * (b - gray));
			}

			// Update pixel data
			data[i] = r;
			data[i + 1] = g;
			data[i + 2] = b;
		}

		// Put modified image data back
		ctx.putImageData(imageData, 0, 0);

		// Update preview canvas
		updatePreview();
	}

	function updatePreview() {
		const previewCtx = previewCanvas.getContext('2d')!;
		previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
		previewCtx.drawImage(canvas, 0, 0);
	}

	function clamp(value: number): number {
		return Math.max(0, Math.min(255, value));
	}

	function rotateImage() {
		rotation = (rotation + 90) % 360;
	}

	function resetEdits() {
		brightness = 0;
		contrast = 0;
		saturation = 0;
		rotation = 0;
		selectedFilter = null;
	}

	async function handleSave() {
		if (!canvas) return;

		isProcessing = true;

		try {
			const blob = await new Promise<Blob>((resolve, reject) => {
				canvas.toBlob((blob) => {
					if (blob) resolve(blob);
					else reject(new Error('Failed to create blob'));
				}, 'image/jpeg', 0.9);
			});

			onSave?.(blob);
		} catch (error) {
			console.error('Failed to save edited image:', error);
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="photo-editor fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
	<!-- Header -->
	<div class="flex items-center justify-between p-4 bg-gray-900 text-white">
		<h2 class="text-xl font-semibold">Photo Editor</h2>
		<button
			onclick={onCancel}
			class="p-2 hover:bg-gray-800 rounded-lg transition-colors"
			aria-label="Close editor"
		>
			<X class="w-6 h-6" />
		</button>
	</div>

	<!-- Main Content -->
	<div class="flex-1 flex flex-col md:flex-row overflow-hidden">
		<!-- Preview Area -->
		<div class="flex-1 flex items-center justify-center p-4 overflow-auto">
			<div class="relative max-w-full max-h-full">
				<canvas bind:this={canvas} class="hidden" />
				<canvas
					bind:this={previewCanvas}
					class="max-w-full max-h-full shadow-2xl"
					style="filter: {selectedFilter ? filters.find((f) => f.id === selectedFilter)?.css : 'none'}"
				/>
			</div>
		</div>

		<!-- Controls Panel -->
		<div class="w-full md:w-80 bg-gray-900 text-white p-6 overflow-y-auto space-y-6">
			<!-- Filters -->
			<div>
				<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
					<Sliders class="w-5 h-5" />
					Filters
				</h3>
				<div class="grid grid-cols-3 gap-2">
					{#each filters as filter}
						<button
							onclick={() => (selectedFilter = filter.id === 'none' ? null : filter.id)}
							class="p-2 rounded-lg border-2 transition-all {selectedFilter === filter.id ||
							(selectedFilter === null && filter.id === 'none')
								? 'border-blue-500 bg-blue-500/20'
								: 'border-gray-700 hover:border-gray-600'}"
						>
							{filter.name}
						</button>
					{/each}
				</div>
			</div>

			<!-- Brightness -->
			<div>
				<label class="block text-sm font-medium mb-2">
					Brightness: {brightness}
				</label>
				<input
					type="range"
					bind:value={brightness}
					min="-100"
					max="100"
					step="1"
					class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
				/>
			</div>

			<!-- Contrast -->
			<div>
				<label class="block text-sm font-medium mb-2">
					Contrast: {contrast}
				</label>
				<input
					type="range"
					bind:value={contrast}
					min="-100"
					max="100"
					step="1"
					class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
				/>
			</div>

			<!-- Saturation -->
			<div>
				<label class="block text-sm font-medium mb-2">
					Saturation: {saturation}
				</label>
				<input
					type="range"
					bind:value={saturation}
					min="-100"
					max="100"
					step="1"
					class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
				/>
			</div>

			<!-- Rotation -->
			<div>
				<h3 class="text-lg font-semibold mb-3">Rotation</h3>
				<button
					onclick={rotateImage}
					class="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
				>
					<RotateCw class="w-5 h-5" />
					Rotate 90°
				</button>
				<p class="text-sm text-gray-400 mt-2">Current: {rotation}°</p>
			</div>

			<!-- Actions -->
			<div class="space-y-2 pt-4 border-t border-gray-800">
				<button
					onclick={resetEdits}
					class="w-full px-4 py-2 border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
				>
					Reset All
				</button>
				<button
					onclick={handleSave}
					disabled={isProcessing}
					class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
				>
					{isProcessing ? 'Processing...' : 'Save Changes'}
				</button>
				<button
					onclick={onCancel}
					class="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.slider::-webkit-slider-thumb {
		appearance: none;
		width: 20px;
		height: 20px;
		background: #3b82f6;
		cursor: pointer;
		border-radius: 50%;
	}

	.slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		background: #3b82f6;
		cursor: pointer;
		border-radius: 50%;
		border: none;
	}
</style>


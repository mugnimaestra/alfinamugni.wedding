<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { Camera, FolderOpen, X } from 'lucide-svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onFilesSelected: (_files: FileList) => void;
	}

	let { isOpen, onClose, onFilesSelected }: Props = $props();

	let cameraInputRef: HTMLInputElement;
	let galleryInputRef: HTMLInputElement;

	function handleCameraClick() {
		cameraInputRef?.click();
	}

	function handleGalleryClick() {
		galleryInputRef?.click();
	}

	function handleCameraSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			onFilesSelected(input.files);
			onClose();
			// Reset input untuk allow select same file lagi
			input.value = '';
		}
	}

	function handleGallerySelect(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			onFilesSelected(input.files);
			onClose();
			// Reset input untuk allow select same file lagi
			input.value = '';
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		// Hanya close jika click langsung di backdrop, bukan di child element
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div
		transition:fade={{ duration: 200 }}
		class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
		onclick={handleBackdropClick}
		onkeydown={handleKeyDown}
		role="button"
		tabindex="0"
		aria-label="Close media source picker"
	>
		<!-- Bottomsheet -->
		<div
			transition:fly={{ y: 300, duration: 300, easing: (t) => 1 - Math.pow(1 - t, 3) }}
			class="absolute bottom-0 left-0 right-0 max-h-[40vh] rounded-t-3xl bg-white shadow-2xl pb-safe"
		>
			<!-- Handle bar -->
			<div class="flex justify-center pt-3 pb-2">
				<div class="h-1 w-12 rounded-full bg-wedding-beige" />
			</div>

			<!-- Content -->
			<div class="px-6 pb-6 pt-2">
				<!-- Header -->
				<div class="mb-4 flex items-center justify-between">
					<h3 class="font-serif text-xl font-semibold text-wedding-text-primary">
						Pilih Sumber Media
					</h3>
					<button
						type="button"
						onclick={onClose}
						aria-label="Close"
						class="rounded-lg p-1 text-wedding-text-muted transition hover:bg-wedding-cream"
					>
						<X class="h-5 w-5" />
					</button>
				</div>

				<!-- Options -->
				<div class="flex flex-col gap-3">
					<!-- Camera Option -->
					<button
						type="button"
						onclick={handleCameraClick}
						class="flex min-h-[56px] items-center gap-4 rounded-xl border-2 border-wedding-sage bg-white px-4 py-4 text-left transition-all hover:scale-[1.02] hover:bg-wedding-cream active:scale-[0.98]"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-wedding-sage text-wedding-text-primary"
						>
							<Camera class="h-6 w-6" />
						</div>
						<div class="flex-1">
							<div class="font-medium text-wedding-text-primary">Ambil Foto</div>
							<div class="text-sm text-wedding-text-muted">
								Gunakan kamera untuk mengambil foto baru
							</div>
						</div>
					</button>

					<!-- Gallery Option -->
					<button
						type="button"
						onclick={handleGalleryClick}
						class="flex min-h-[56px] items-center gap-4 rounded-xl border-2 border-wedding-sage bg-white px-4 py-4 text-left transition-all hover:scale-[1.02] hover:bg-wedding-cream active:scale-[0.98]"
					>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full bg-wedding-sage text-wedding-text-primary"
						>
							<FolderOpen class="h-6 w-6" />
						</div>
						<div class="flex-1">
							<div class="font-medium text-wedding-text-primary">Pilih dari Galeri</div>
							<div class="text-sm text-wedding-text-muted">
								Pilih foto atau video dari galeri Anda
							</div>
						</div>
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Hidden File Inputs -->
<input
	bind:this={cameraInputRef}
	type="file"
	accept="image/*,video/*"
	capture="environment"
	multiple
	onchange={handleCameraSelect}
	class="hidden"
	aria-label="Camera input"
/>

<input
	bind:this={galleryInputRef}
	type="file"
	accept="image/*,video/*"
	multiple
	onchange={handleGallerySelect}
	class="hidden"
	aria-label="Gallery input"
/>

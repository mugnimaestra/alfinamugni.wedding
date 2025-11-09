<script lang="ts">
	import { onMount } from 'svelte';

	interface Photo {
		id: string | number;
		url: string;
		description?: string;
		uploader_name?: string;
		upload_date?: string;
	}

	interface Props {
		photo: Photo | null;
		isOpen: boolean;
		onClose: () => void;
	}

	let { photo, isOpen, onClose }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen) {
			onClose();
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeydown);
			return () => window.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if isOpen && photo}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="absolute inset-0 bg-black/80" onclick={onClose}></div>

		<div class="relative z-10 w-full max-w-5xl">
			<button
				type="button"
				onclick={onClose}
				class="absolute -top-12 right-0 rounded-lg p-2 text-white transition hover:bg-white/10"
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

			<div class="rounded-lg bg-white p-2 shadow-2xl">
				<img
					src={photo.url}
					alt={photo.description || 'Wedding photo'}
					class="max-h-[70vh] w-full rounded object-contain"
				/>

				{#if photo.description || photo.uploader_name}
					<div class="border-t border-wedding-beige p-4">
						{#if photo.description}
							<p class="text-wedding-text-primary">
								{photo.description}
							</p>
						{/if}
						{#if photo.uploader_name}
							<p class="mt-2 text-sm text-wedding-text-muted">
								Shared by <span class="font-medium text-wedding-text-primary"
									>{photo.uploader_name}</span
								>
								{#if photo.upload_date}
									· {new Date(photo.upload_date).toLocaleDateString()}
								{/if}
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

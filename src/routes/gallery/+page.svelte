<script lang="ts">
	import PhotoUpload from '$lib/components/gallery/PhotoUpload.svelte';
	import PhotoGrid from '$lib/components/gallery/PhotoGrid.svelte';
	import PhotoModal from '$lib/components/gallery/PhotoModal.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';

	interface Photo {
		id: number;
		filename: string;
		original_name: string;
		uploader_name: string;
		description: string;
		upload_date: string;
		r2_key: string;
	}

	let { data }: { data: PageData } = $props();

	let showUploadModal = $state(false);
	let selectedPhoto = $state<any>(null);
	let showPhotoModal = $state(false);

	const transformedPhotos = $derived(
		data.photos.map((p: any) => ({
			id: p.id,
			url: `/api/photos/${p.id}`,
			thumbnail: `/api/photos/${p.id}`,
			description: p.description || '',
			uploader_name: p.uploader_name || 'Anonymous',
			upload_date: p.upload_date
		}))
	);

	function handlePhotoClick(photo: any) {
		selectedPhoto = photo;
		showPhotoModal = true;
	}

	function handleCloseModal() {
		selectedPhoto = null;
		showPhotoModal = false;
	}

	async function handleUploadSuccess() {
		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Gallery - Alfina & Mugni Wedding</title>
	<meta
		name="description"
		content="Share and view beautiful moments from Alfina & Mugni's wedding"
	/>
</svelte:head>

<main class="min-h-screen bg-gradient-to-b from-wedding-cream to-white px-4 py-12">
	<div class="mx-auto max-w-7xl">
		<div class="mb-12 text-center">
			<h1 class="font-serif text-4xl font-light text-wedding-brown md:text-6xl">
				Wedding Gallery
			</h1>
			<p class="mt-4 text-lg text-wedding-text-muted md:text-xl">
				Share your beautiful moments with us
			</p>
		</div>

		<div class="mb-8 flex justify-center">
			<button
				type="button"
				onclick={() => (showUploadModal = true)}
				class="inline-flex items-center gap-2 rounded-lg bg-wedding-sage px-6 py-3 font-medium text-white shadow-sm transition hover:bg-wedding-sage/90"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				Upload Photos
			</button>
		</div>

		<PhotoGrid photos={transformedPhotos} onPhotoClick={handlePhotoClick} />
	</div>
</main>

<PhotoUpload
	isOpen={showUploadModal}
	onClose={() => (showUploadModal = false)}
	onSuccess={handleUploadSuccess}
/>

<PhotoModal
	photo={selectedPhoto}
	isOpen={showPhotoModal}
	onClose={handleCloseModal}
/>


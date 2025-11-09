<script lang="ts">
	import PhotoUpload from '$lib/components/gallery/PhotoUpload.svelte';
	import PhotoGrid from '$lib/components/gallery/PhotoGrid.svelte';
	import PhotoModal from '$lib/components/gallery/PhotoModal.svelte';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';

	let { data }: { data: PageData } = $props();

	let showUploadModal = $state(false);
	let selectedPhoto = $state<any>(null);
	let showPhotoModal = $state(false);

	const transformedPhotos = $derived(
		(data.photos || []).map((p: any) => ({
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
	<title>{data.session?.title || 'Session Gallery'} - Alfina & Mugni Wedding</title>
	<meta
		name="description"
		content={data.session?.description || 'Share photos from our wedding'}
	/>
</svelte:head>

<main class="min-h-screen bg-gradient-to-b from-wedding-cream to-white px-4 py-12">
	<div class="mx-auto max-w-7xl">
		<div class="mb-12 text-center">
			<h1 class="font-serif text-4xl font-light text-wedding-brown md:text-6xl">
				{data.session?.title || 'Session Gallery'}
			</h1>
			{#if data.session?.description}
				<p class="mt-4 text-lg text-wedding-text-muted md:text-xl">
					{data.session.description}
				</p>
			{/if}

			{#if !data.session?.is_active}
				<div
					class="mx-auto mt-6 max-w-md rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800"
				>
					<p class="font-medium">This session is no longer accepting uploads</p>
					<p class="mt-1 text-sm">You can still view the photos below</p>
				</div>
			{/if}
		</div>

		<div class="mb-8 flex justify-center">
			<button
				type="button"
				onclick={() => (showUploadModal = true)}
				disabled={!data.session?.is_active}
				class="inline-flex items-center gap-2 rounded-lg bg-wedding-sage px-6 py-3 font-medium text-white shadow-sm transition hover:bg-wedding-sage/90 disabled:cursor-not-allowed disabled:opacity-50"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				{data.session?.is_active ? 'Upload Photos' : 'Uploads Closed'}
			</button>
		</div>

		<PhotoGrid photos={transformedPhotos} onPhotoClick={handlePhotoClick} />
	</div>
</main>

<PhotoUpload
	sessionId={data.session?.session_id || ''}
	isActive={data.session?.is_active ?? false}
	isOpen={showUploadModal}
	onClose={() => (showUploadModal = false)}
	onSuccess={handleUploadSuccess}
/>

<PhotoModal photo={selectedPhoto} isOpen={showPhotoModal} onClose={handleCloseModal} />

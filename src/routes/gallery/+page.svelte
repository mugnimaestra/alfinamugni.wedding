<script lang="ts">
	import { onMount } from 'svelte';
	import GalleryMasonry from '$lib/components/gallery/GalleryMasonry.svelte';
	import FloatingUploadButton from '$lib/components/gallery/FloatingUploadButton.svelte';
	import PhotoUpload from '$lib/components/gallery/PhotoUpload.svelte';
	import PhotoModal from '$lib/components/gallery/PhotoModal.svelte';
	import Toast from '$lib/components/Toast.svelte';
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
		content_type?: string;
	}

	let { data }: { data: PageData } = $props();

	let showUploadModal = $state(false);
	let selectedPhotoIndex = $state(-1);
	let showPhotoModal = $state(false);
	let showToast = $state(false);
	let toastMessage = $state('');

	const transformedPhotos = $derived(
		data.photos.map((p: any) => ({
			id: p.id,
			url: `/api/photos/${p.id}`,
			thumbnail: `/api/photos/${p.id}`,
			description: p.description || '',
			uploader_name: p.uploader_name || 'Anonymous',
			upload_date: p.upload_date,
			content_type: p.content_type || 'image/jpeg',
			media_type: p.media_type || (p.content_type?.startsWith('video/') ? 'video' : 'image'),
		}))
	);

	function handlePhotoClick(photo: any) {
		const index = transformedPhotos.findIndex((p) => p.id === photo.id);
		if (index !== -1) {
			selectedPhotoIndex = index;
			showPhotoModal = true;
		}
	}

	function handleCloseModal() {
		selectedPhotoIndex = -1;
		showPhotoModal = false;
	}

	async function handleUploadSuccess(count: number) {
		// Refresh the gallery data
		await invalidateAll();

		// Show celebratory toast
		const messages = [
			`🎉 ${count} foto berhasil diunggah! Terima kasih sudah berbagi kebahagiaan!`,
			`✨ Wow! ${count} momen indah telah ditambahkan ke galeri!`,
			`💕 Terima kasih! ${count} foto baru telah tersimpan dengan indah!`,
			`🌟 Luar biasa! ${count} kenangan baru telah mempercantik galeri kami!`,
		];

		// Pick a random encouraging message
		toastMessage = messages[Math.floor(Math.random() * messages.length)];
		showToast = true;
	}

	// Remove cover-active class to enable scrolling
	onMount(() => {
		document.body.classList.remove('cover-active');
	});
</script>

<svelte:head>
	<title>Gallery - Alfina & Mugni Wedding</title>
	<meta
		name="description"
		content="Share and view beautiful moments from Alfina & Mugni's wedding"
	/>
</svelte:head>

<main class="min-h-screen bg-gradient-to-b from-wedding-cream to-white px-4 py-12">
	<div class="mx-auto max-w-[1920px]">
		<div class="mb-12 text-center">
			<h1 class="font-serif text-4xl font-light text-wedding-brown md:text-6xl">Wedding Gallery</h1>
			<p class="mt-4 text-lg text-wedding-text-muted md:text-xl">
				Scroll through beautiful moments • Tap to upload yours
			</p>
		</div>

		<GalleryMasonry initialPhotos={transformedPhotos} onPhotoClick={handlePhotoClick} />
	</div>
</main>

<FloatingUploadButton onclick={() => (showUploadModal = true)} />

<PhotoUpload
	isOpen={showUploadModal}
	onClose={() => (showUploadModal = false)}
	onSuccess={handleUploadSuccess}
/>

<PhotoModal
	photos={transformedPhotos}
	currentIndex={selectedPhotoIndex}
	isOpen={showPhotoModal}
	onClose={handleCloseModal}
/>

<Toast
	message={toastMessage}
	show={showToast}
	onDismiss={() => (showToast = false)}
	duration={5000}
/>

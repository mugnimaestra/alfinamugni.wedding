<script lang="ts">
	import PhotoCard from '$lib/components/admin/PhotoCard.svelte';
	import DeletePreviewModal from '$lib/components/admin/DeletePreviewModal.svelte';
	import PullToRefresh from '$lib/components/PullToRefresh.svelte';
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';

	onMount(() => {
		document.body.classList.remove('cover-active');
	});

	interface Photo {
		id: string | number;
		title: string;
		description?: string;
		uploader_name: string;
		upload_date: string;
		thumbnail: string;
		url: string;
		content_type?: string;
		media_type?: 'image' | 'video';
	}

	let { data }: { data: PageData } = $props();

	let allPhotos = $state<Photo[]>(data.photos || []);
	let searchQuery = $state('');
	let isRefreshing = $state(false);
	
	// Snackbar state for refresh notifications
	let refreshSnackbar = $state<{
		show: boolean;
		message: string;
		type: 'success' | 'error' | 'loading';
		photoCount?: number;
	}>({ show: false, message: '', type: 'loading' });

	// Sync photos when data changes (after invalidateAll)
	$effect(() => {
		allPhotos = data.photos || [];
	});

	async function handleRefresh() {
		isRefreshing = true;
		
		// Show loading snackbar
		refreshSnackbar = {
			show: true,
			message: 'Syncing gallery...',
			type: 'loading'
		};
		
		try {
			const startTime = Date.now();
			await invalidateAll();
			const duration = Date.now() - startTime;
			
			// Clear selection on refresh to avoid stale references
			selectedIds = new Set();
			
			// Minimum display time for loading state (for UX)
			const minLoadTime = 500;
			if (duration < minLoadTime) {
				await new Promise(resolve => setTimeout(resolve, minLoadTime - duration));
			}
			
			// Show success snackbar with photo count
			refreshSnackbar = {
				show: true,
				message: 'Gallery refreshed!',
				type: 'success',
				photoCount: allPhotos.length
			};
			
			// Auto-hide after 3 seconds
			setTimeout(() => {
				refreshSnackbar = { ...refreshSnackbar, show: false };
			}, 3000);
			
		} catch (err) {
			refreshSnackbar = {
				show: true,
				message: 'Failed to refresh gallery',
				type: 'error'
			};
			
			setTimeout(() => {
				refreshSnackbar = { ...refreshSnackbar, show: false };
			}, 4000);
		} finally {
			isRefreshing = false;
		}
	}
	let selectedIds = $state<Set<string | number>>(new Set());
	let isDeleting = $state(false);
	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);
	let previewPhoto = $state<Photo | null>(null);
	let showPreviewModal = $state(false);

	const filteredPhotos = $derived(() => {
		if (!searchQuery.trim()) {
			return allPhotos;
		}

		const lowerQuery = searchQuery.toLowerCase();
		return allPhotos.filter(
			(photo) =>
				photo.title.toLowerCase().includes(lowerQuery) ||
				photo.description?.toLowerCase().includes(lowerQuery) ||
				photo.uploader_name.toLowerCase().includes(lowerQuery)
		);
	});

	const selectedCount = $derived(selectedIds.size);

	function toggleSelection(id: string | number) {
		const newSet = new Set(selectedIds);
		if (newSet.has(id)) {
			newSet.delete(id);
		} else {
			newSet.add(id);
		}
		selectedIds = newSet;
	}

	function deletePhoto(id: string | number) {
		const photo = allPhotos.find((p) => p.id === id);
		if (!photo) return;
		
		previewPhoto = photo;
		showPreviewModal = true;
	}

	function handleDeleteCancel() {
		showPreviewModal = false;
		previewPhoto = null;
	}

	async function handleDeleteConfirm() {
		if (!previewPhoto) return;

		const id = previewPhoto.id;
		showPreviewModal = false;

		try {
			const response = await fetch(`/api/photos/${id}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				allPhotos = allPhotos.filter((p) => p.id !== id);
				selectedIds.delete(id);
				showToast('Photo deleted successfully', 'success');
			} else {
				throw new Error('Failed to delete photo');
			}
		} catch (err) {
			showToast('Failed to delete photo', 'error');
		} finally {
			previewPhoto = null;
		}
	}

	async function bulkDelete() {
		if (selectedIds.size === 0) return;
		if (!confirm(`Delete ${selectedIds.size} photo(s)?`)) return;

		isDeleting = true;

		try {
			const deletePromises = Array.from(selectedIds).map((id) =>
				fetch(`/api/photos/${id}`, { method: 'DELETE' }).then((r) => ({
					id,
					success: r.ok,
				}))
			);

			const results = await Promise.all(deletePromises);
			const successIds = results.filter((r) => r.success).map((r) => r.id);
			const failedCount = results.length - successIds.length;

			allPhotos = allPhotos.filter((p) => !successIds.includes(p.id));
			selectedIds = new Set();

			if (failedCount > 0) {
				showToast(`Deleted ${successIds.length} photos, ${failedCount} failed`, 'error');
			} else {
				showToast(`Successfully deleted ${successIds.length} photo(s)`, 'success');
			}
		} catch (err) {
			showToast('Bulk delete failed', 'error');
		} finally {
			isDeleting = false;
		}
	}

	function showToast(message: string, type: 'success' | 'error') {
		toast = { message, type };
		setTimeout(() => {
			toast = null;
		}, 3000);
	}
</script>

<svelte:head>
	<title>Gallery Management - Admin</title>
</svelte:head>

<PullToRefresh onRefresh={handleRefresh} disabled={isRefreshing}>
<div class="min-h-screen bg-gradient-to-b from-wedding-cream to-white px-4 py-12">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="font-serif text-4xl font-light text-wedding-brown">Gallery Management</h1>
				<p class="mt-2 text-wedding-text-muted">Manage wedding photo submissions</p>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={handleRefresh}
					disabled={isRefreshing}
					class="inline-flex items-center justify-center rounded-full bg-wedding-sage p-2 text-white shadow-sm transition hover:bg-wedding-sage/90 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Refresh gallery"
					title="Refresh gallery"
				>
					<svg
						class="h-5 w-5"
						class:animate-spin={isRefreshing}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
				</button>
				<span
					class="rounded-full bg-wedding-sage/10 px-4 py-2 text-sm font-medium text-wedding-sage"
				>
					Total: {filteredPhotos().length}
				</span>
				{#if selectedCount > 0}
					<button
						type="button"
						onclick={bulkDelete}
						disabled={isDeleting}
						class="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						Delete ({selectedCount})
					</button>
				{/if}
			</div>
		</div>

		<div class="mb-8">
			<div class="relative">
				<svg
					class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-wedding-text-muted"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by title, description, or uploader..."
					class="w-full rounded-lg border border-wedding-beige bg-white py-3 pl-10 pr-4 focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-wedding-text-muted hover:bg-wedding-cream"
						aria-label="Clear search"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				{/if}
			</div>
		</div>

		{#if filteredPhotos().length === 0}
			<div
				class="flex min-h-[400px] items-center justify-center rounded-xl border border-wedding-beige bg-white p-12"
			>
				<div class="text-center">
					<svg
						class="mx-auto h-16 w-16 text-wedding-text-muted"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
					<h3 class="mt-4 font-serif text-xl font-semibold text-wedding-text-primary">
						{searchQuery ? 'No photos found' : 'No photos yet'}
					</h3>
					<p class="mt-2 text-wedding-text-muted">
						{searchQuery
							? 'Try adjusting your search criteria'
							: 'Photo submissions will appear here'}
					</p>
				</div>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each filteredPhotos() as photo (photo.id)}
					<PhotoCard
						{photo}
						isSelected={selectedIds.has(photo.id)}
						onToggleSelect={toggleSelection}
						onDelete={deletePhoto}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>
</PullToRefresh>

<!-- Refresh Snackbar with beautiful animations -->
{#if refreshSnackbar.show}
	<div 
		class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform"
		style="animation: snackbarSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;"
	>
		<!-- Glow effect behind the snackbar -->
		{#if refreshSnackbar.type === 'success'}
			<div 
				class="absolute inset-0 rounded-2xl bg-wedding-steel blur-xl"
				style="animation: pulseGlow 2s ease-in-out infinite; opacity: 0.5;"
			></div>
		{/if}
		
		<div 
			class={`
				relative overflow-hidden rounded-2xl px-6 py-4 shadow-2xl backdrop-blur-sm
				${refreshSnackbar.type === 'success' 
					? 'bg-wedding-steel' 
					: refreshSnackbar.type === 'error'
					? 'bg-red-500'
					: 'bg-wedding-steel/80'}
			`}
		>
			<!-- Animated background shimmer -->
			<div 
				class="absolute inset-0 opacity-30"
				style="background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: shimmer 2s infinite;"
			></div>
			
			<!-- Floating particles for success state -->
			{#if refreshSnackbar.type === 'success'}
				<div class="absolute inset-0 overflow-hidden">
					<!-- Floating dots -->
					{#each Array(6) as _, i}
						<div 
							class="absolute h-2 w-2 rounded-full bg-white/40"
							style="
								left: {10 + i * 15}%;
								animation: floatUp 1.5s ease-out {i * 0.1}s forwards;
								opacity: 0;
							"
						></div>
					{/each}
					<!-- Sparkle stars -->
					{#each Array(4) as _, i}
						<div 
							class="absolute text-lg"
							style="
								left: {5 + i * 25}%;
								top: 50%;
								animation: sparkle 1s ease-out {i * 0.15}s forwards;
								opacity: 0;
							"
						>✦</div>
					{/each}
				</div>
			{/if}
			
			<!-- Loading spinner particles -->
			{#if refreshSnackbar.type === 'loading'}
				<div class="absolute inset-0 overflow-hidden">
					{#each Array(3) as _, i}
						<div 
							class="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
							style="animation: orbit 1.2s linear {i * 0.4}s infinite;"
						></div>
					{/each}
				</div>
			{/if}
			
			<div class="relative flex items-center gap-4">
				<!-- Icon with animation -->
				<div class="flex-shrink-0">
					{#if refreshSnackbar.type === 'loading'}
						<div class="relative h-8 w-8">
							<svg 
								class="h-8 w-8 text-white" 
								style="animation: spin 1s linear infinite;"
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</div>
					{:else if refreshSnackbar.type === 'success'}
						<div 
							class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
							style="animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;"
						>
							<svg 
								class="h-6 w-6 text-white" 
								fill="none" 
								stroke="currentColor" 
								viewBox="0 0 24 24"
								style="animation: checkDraw 0.6s ease-out 0.2s forwards; stroke-dasharray: 30; stroke-dashoffset: 30;"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="3"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
					{:else}
						<div 
							class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
							style="animation: errorShake 0.5s ease-in-out;"
						>
							<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="3"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</div>
					{/if}
				</div>
				
				<!-- Message content -->
				<div class="flex flex-col">
					<span class="text-base font-semibold text-white" style="text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
						{refreshSnackbar.message}
					</span>
					{#if refreshSnackbar.type === 'success' && refreshSnackbar.photoCount !== undefined}
						<span class="text-sm text-white/80" style="animation: fadeInUp 0.4s ease-out 0.3s both;">
							{refreshSnackbar.photoCount} photo{refreshSnackbar.photoCount !== 1 ? 's' : ''} in gallery ✨
						</span>
					{/if}
					{#if refreshSnackbar.type === 'loading'}
						<span class="text-sm text-white/80">
							Please wait...
						</span>
					{/if}
				</div>
				
				<!-- Close button for success/error states -->
				{#if refreshSnackbar.type !== 'loading'}
					<button
						type="button"
						onclick={() => refreshSnackbar = { ...refreshSnackbar, show: false }}
						class="ml-2 flex-shrink-0 rounded-full p-1.5 text-white/70 transition-all hover:bg-white/20 hover:text-white active:scale-90"
						aria-label="Dismiss"
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</div>
			
			<!-- Progress bar for auto-dismiss -->
			{#if refreshSnackbar.type === 'success'}
				<div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
					<div 
						class="h-full bg-white/50"
						style="animation: progressShrink 3s linear forwards;"
					></div>
				</div>
			{/if}
		</div>
	</div>
{/if}

{#if toast}
	<div
		class={`fixed bottom-4 right-4 z-50 rounded-lg px-6 py-3 shadow-lg transition-all ${
			toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
		}`}
	>
		<div class="flex items-center gap-2">
			{#if toast.type === 'success'}
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			{:else}
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			{/if}
			<span class="font-medium">{toast.message}</span>
		</div>
	</div>
{/if}

<DeletePreviewModal
	photo={previewPhoto}
	isOpen={showPreviewModal}
	onCancel={handleDeleteCancel}
	onConfirm={handleDeleteConfirm}
/>

<style>
	/* Snackbar slide up animation */
	@keyframes snackbarSlideUp {
		0% {
			opacity: 0;
			transform: translateX(-50%) translateY(100%) scale(0.8);
		}
		100% {
			opacity: 1;
			transform: translateX(-50%) translateY(0) scale(1);
		}
	}
	
	/* Background shimmer effect */
	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}
	
	/* Floating particles animation */
	@keyframes floatUp {
		0% {
			opacity: 0;
			transform: translateY(20px) scale(0);
		}
		30% {
			opacity: 0.8;
			transform: translateY(0) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateY(-30px) scale(0.5);
		}
	}
	
	/* Orbiting particles for loading state */
	@keyframes orbit {
		0% {
			transform: translate(-50%, -50%) rotate(0deg) translateX(20px) rotate(0deg);
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			transform: translate(-50%, -50%) rotate(360deg) translateX(20px) rotate(-360deg);
			opacity: 1;
		}
	}
	
	/* Spinning refresh icon */
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
	
	/* Success icon pop animation */
	@keyframes successPop {
		0% {
			transform: scale(0) rotate(-45deg);
		}
		50% {
			transform: scale(1.2) rotate(10deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
		}
	}
	
	/* Checkmark draw animation */
	@keyframes checkDraw {
		to {
			stroke-dashoffset: 0;
		}
	}
	
	/* Error shake animation */
	@keyframes errorShake {
		0%, 100% {
			transform: translateX(0);
		}
		10%, 30%, 50%, 70%, 90% {
			transform: translateX(-4px);
		}
		20%, 40%, 60%, 80% {
			transform: translateX(4px);
		}
	}
	
	/* Fade in and slide up for secondary text */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	/* Progress bar shrinking animation */
	@keyframes progressShrink {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
	
	/* Sparkle star animation */
	@keyframes sparkle {
		0% {
			opacity: 0;
			transform: translateY(0) scale(0) rotate(0deg);
		}
		50% {
			opacity: 1;
			transform: translateY(-15px) scale(1.2) rotate(180deg);
		}
		100% {
			opacity: 0;
			transform: translateY(-35px) scale(0.5) rotate(360deg);
		}
	}
	
	/* Pulse glow for the snackbar */
	@keyframes pulseGlow {
		0%, 100% {
			box-shadow: 0 0 20px rgba(93, 136, 187, 0.4),
						0 10px 40px rgba(93, 136, 187, 0.2);
		}
		50% {
			box-shadow: 0 0 30px rgba(93, 136, 187, 0.6),
						0 10px 50px rgba(93, 136, 187, 0.3);
		}
	}
</style>

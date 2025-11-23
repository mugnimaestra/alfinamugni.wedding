<script lang="ts">
	import PhotoCard from '$lib/components/admin/PhotoCard.svelte';
	import type { PageData } from './$types';

	interface Photo {
		id: string | number;
		title: string;
		description?: string;
		uploader_name: string;
		upload_date: string;
		thumbnail: string;
	}

	let { data }: { data: PageData } = $props();

	let allPhotos = $state<Photo[]>(data.photos || []);
	let searchQuery = $state('');
	let selectedIds = $state<Set<string | number>>(new Set());
	let isDeleting = $state(false);
	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);

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

	async function deletePhoto(id: string | number) {
		if (!confirm('Delete this photo?')) return;

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

<div class="min-h-screen bg-gradient-to-b from-wedding-cream to-white px-4 py-12">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="font-serif text-4xl font-light text-wedding-brown">Gallery Management</h1>
				<p class="mt-2 text-wedding-text-muted">Manage wedding photo submissions</p>
			</div>
			<div class="flex items-center gap-2">
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

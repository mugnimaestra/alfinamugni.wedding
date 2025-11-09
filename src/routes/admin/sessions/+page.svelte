<script lang="ts">
	import SessionCard from '$lib/components/admin/SessionCard.svelte';
	import CreateSessionDialog from '$lib/components/admin/CreateSessionDialog.svelte';
	import QRCodeModal from '$lib/components/admin/QRCodeModal.svelte';

	interface GallerySession {
		id: number;
		session_id: string;
		title: string;
		description: string | null;
		is_active: number;
		photo_count: number;
		created_at: string;
		qr_code_url?: string | null;
	}

	let { data } = $props();

	let sessions = $state<GallerySession[]>(data.sessions || []);
	let isCreateOpen = $state(false);
	let isQROpen = $state(false);
	let selectedSession = $state<GallerySession | null>(null);
	let toast = $state<{ message: string; type: 'success' | 'error' } | null>(null);

	async function loadSessions() {
		try {
			const response = await fetch('/api/admin/sessions');
			const result = await response.json();
			if (result.success) {
				sessions = result.sessions;
			}
		} catch (err) {
			console.error('Failed to load sessions:', err);
		}
	}

	async function createSession(sessionData: {
		title: string;
		description: string;
		prefix: string;
		is_active: boolean;
	}) {
		const response = await fetch('/api/admin/sessions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(sessionData)
		});

		const result = await response.json();

		if (result.success) {
			await loadSessions();
			selectedSession = result.session;
			isQROpen = true;
			showToast('Session created successfully!', 'success');
		} else {
			throw new Error(result.error || 'Failed to create session');
		}
	}

	async function toggleActive(session: GallerySession) {
		const response = await fetch(`/api/admin/sessions/${session.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ is_active: !session.is_active })
		});

		if (response.ok) {
			await loadSessions();
			showToast(
				`Session ${session.is_active ? 'deactivated' : 'activated'}!`,
				'success'
			);
		} else {
			showToast('Failed to toggle session', 'error');
		}
	}

	function copyLink(sessionId: string) {
		const url = `${window.location.origin}/g/${sessionId}`;
		navigator.clipboard.writeText(url);
		showToast('Link copied to clipboard!', 'success');
	}

	function showQR(session: GallerySession) {
		selectedSession = session;
		isQROpen = true;
	}

	function showToast(message: string, type: 'success' | 'error') {
		toast = { message, type };
		setTimeout(() => {
			toast = null;
		}, 3000);
	}
</script>

<svelte:head>
	<title>Manage Sessions - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-wedding-cream to-white px-4 py-12">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="font-serif text-4xl font-light text-wedding-brown">
					Gallery Sessions
				</h1>
				<p class="mt-2 text-wedding-text-muted">
					Manage upload sessions and QR codes for guest photo sharing
				</p>
			</div>
			<button
				type="button"
				onclick={() => (isCreateOpen = true)}
				class="inline-flex items-center gap-2 rounded-lg bg-wedding-sage px-6 py-3 font-medium text-white shadow-sm transition hover:bg-wedding-sage/90"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				New Session
			</button>
		</div>

		{#if sessions.length === 0}
			<div
				class="rounded-xl border border-wedding-beige bg-white p-12 text-center shadow-sm"
			>
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
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					/>
				</svg>
				<h3 class="mt-4 font-serif text-xl font-semibold text-wedding-text-primary">
					No sessions yet
				</h3>
				<p class="mt-2 text-wedding-text-muted">
					Create your first session to start collecting guest photos
				</p>
				<button
					type="button"
					onclick={() => (isCreateOpen = true)}
					class="mt-6 inline-flex items-center gap-2 rounded-lg bg-wedding-sage px-6 py-3 font-medium text-white transition hover:bg-wedding-sage/90"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
					Create First Session
				</button>
			</div>
		{:else}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each sessions as session (session.id)}
					<SessionCard
						{session}
						onCopyLink={copyLink}
						onShowQR={showQR}
						onToggle={toggleActive}
					/>
				{/each}
			</div>
		{/if}
	</div>
</div>

<CreateSessionDialog
	isOpen={isCreateOpen}
	onClose={() => (isCreateOpen = false)}
	onCreate={createSession}
/>

<QRCodeModal
	session={selectedSession}
	isOpen={isQROpen}
	onClose={() => {
		isQROpen = false;
		selectedSession = null;
	}}
/>

{#if toast}
	<div
		class={`fixed bottom-4 right-4 z-50 rounded-lg px-6 py-3 shadow-lg transition-all ${
			toast.type === 'success'
				? 'bg-green-600 text-white'
				: 'bg-red-600 text-white'
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

<script lang="ts">
	interface GallerySession {
		id: number;
		session_id: string;
		title: string;
		description: string | null;
		is_active: number;
		photo_count: number;
		created_at: string;
	}

	interface Props {
		session: GallerySession;
		onCopyLink: (sessionId: string) => void;
		onShowQR: (session: GallerySession) => void;
		onToggle: (session: GallerySession) => Promise<void>;
	}

	let { session, onCopyLink, onShowQR, onToggle }: Props = $props();
	let isToggling = $state(false);

	async function handleToggle() {
		isToggling = true;
		try {
			await onToggle(session);
		} finally {
			isToggling = false;
		}
	}
</script>

<article
	class="rounded-xl border border-wedding-beige bg-white p-6 shadow-sm transition-all hover:shadow-md"
>
	<div class="mb-4 flex items-start justify-between">
		<div class="flex-1">
			<h3 class="text-lg font-semibold text-wedding-text-primary">
				{session.title}
			</h3>
			{#if session.description}
				<p class="mt-1 text-sm text-wedding-text-muted">
					{session.description}
				</p>
			{/if}
		</div>
		<span
			class={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
				session.is_active
					? 'bg-green-100 text-green-800'
					: 'bg-gray-100 text-gray-800'
			}`}
		>
			{session.is_active ? 'Active' : 'Inactive'}
		</span>
	</div>

	<div class="mb-4 flex items-center gap-4 text-sm text-wedding-text-muted">
		<div class="flex items-center gap-1">
			<svg
				class="h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
			<span>{session.photo_count} photos</span>
		</div>
		<div class="flex items-center gap-1">
			<svg
				class="h-4 w-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
				/>
			</svg>
			<span class="font-mono text-xs">{session.session_id}</span>
		</div>
	</div>

	<div class="flex flex-wrap gap-2">
		<button
			type="button"
			onclick={() => onCopyLink(session.session_id)}
			class="inline-flex items-center gap-1.5 rounded-lg border border-wedding-beige bg-white px-3 py-1.5 text-sm font-medium text-wedding-text-primary transition hover:bg-wedding-cream"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
				/>
			</svg>
			Copy Link
		</button>

		<button
			type="button"
			onclick={() => onShowQR(session)}
			class="inline-flex items-center gap-1.5 rounded-lg border border-wedding-beige bg-white px-3 py-1.5 text-sm font-medium text-wedding-text-primary transition hover:bg-wedding-cream"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
				/>
			</svg>
			Show QR
		</button>

		<button
			type="button"
			onclick={handleToggle}
			disabled={isToggling}
			class={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
				session.is_active
					? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
					: 'border border-green-600 bg-green-600 text-white hover:bg-green-700'
			} disabled:opacity-50`}
		>
			{#if isToggling}
				<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			{:else}
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
					/>
				</svg>
			{/if}
			{session.is_active ? 'Deactivate' : 'Activate'}
		</button>
	</div>
</article>

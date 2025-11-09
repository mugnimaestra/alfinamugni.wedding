<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';

	interface GallerySession {
		id: number;
		session_id: string;
		title: string;
		description: string | null;
		qr_code_url: string | null;
	}

	interface Props {
		session: GallerySession | null;
		isOpen: boolean;
		onClose: () => void;
	}

	let { session, isOpen, onClose }: Props = $props();
	let qrDataUrl = $state('');
	let isGenerating = $state(false);
	let copySuccess = $state(false);

	const sessionUrl = $derived(
		session && typeof window !== 'undefined'
			? `${window.location.origin}/g/${session.session_id}`
			: ''
	);

	async function generateQRCode() {
		if (!sessionUrl) return;

		isGenerating = true;
		try {
			const dataUrl = await QRCode.toDataURL(sessionUrl, {
				width: 300,
				margin: 2,
				color: {
					dark: '#4D3326',
					light: '#FFFFFF'
				}
			});
			qrDataUrl = dataUrl;
		} catch (err) {
			console.error('QR generation failed:', err);
		} finally {
			isGenerating = false;
		}
	}

	async function copyToClipboard() {
		if (!sessionUrl) return;

		try {
			await navigator.clipboard.writeText(sessionUrl);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (err) {
			console.error('Copy failed:', err);
		}
	}

	async function downloadQR() {
		if (!sessionUrl || !session) return;

		try {
			const highResDataUrl = await QRCode.toDataURL(sessionUrl, {
				width: 1200,
				margin: 2,
				color: {
					dark: '#4D3326',
					light: '#FFFFFF'
				}
			});

			const link = document.createElement('a');
			link.download = `qr-${session.session_id}.png`;
			link.href = highResDataUrl;
			link.click();
		} catch (err) {
			console.error('Download failed:', err);
		}
	}

	onMount(() => {
		if (isOpen && session) {
			generateQRCode();
		}
	});

	$effect(() => {
		if (isOpen && session && !qrDataUrl) {
			generateQRCode();
		}
	});
</script>

{#if isOpen && session}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
		<div class="absolute inset-0 bg-black/50" onclick={onClose}></div>

		<div
			class="relative z-10 w-full max-w-lg rounded-xl border border-wedding-beige bg-white p-6 shadow-2xl"
		>
			<div class="mb-6 flex items-center justify-between">
				<h2 class="font-serif text-2xl font-semibold text-wedding-text-primary">
					Session QR Code
				</h2>
				<button
					type="button"
					onclick={onClose}
					class="rounded-lg p-1 text-wedding-text-muted transition hover:bg-wedding-cream"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div class="space-y-6">
				<div class="text-center">
					<h3 class="text-lg font-semibold text-wedding-text-primary">
						{session.title}
					</h3>
					{#if session.description}
						<p class="mt-1 text-sm text-wedding-text-muted">
							{session.description}
						</p>
					{/if}
				</div>

				<div class="flex justify-center">
					{#if isGenerating}
						<div
							class="flex h-[300px] w-[300px] items-center justify-center rounded-lg bg-wedding-cream"
						>
							<svg
								class="h-12 w-12 animate-spin text-wedding-sage"
								fill="none"
								viewBox="0 0 24 24"
							>
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
						</div>
					{:else if qrDataUrl}
						<img
							src={qrDataUrl}
							alt="QR Code for {session.session_id}"
							class="rounded-lg border border-wedding-beige shadow-sm"
						/>
					{:else}
						<div
							class="flex h-[300px] w-[300px] items-center justify-center rounded-lg bg-wedding-cream"
						>
							<p class="text-sm text-wedding-text-muted">Failed to generate QR code</p>
						</div>
					{/if}
				</div>

				<div>
					<label class="mb-2 block text-sm font-medium text-wedding-text-primary">
						Session URL
					</label>
					<div class="flex gap-2">
						<input
							type="text"
							readonly
							value={sessionUrl}
							class="flex-1 rounded-lg border border-wedding-beige bg-wedding-cream px-3 py-2 font-mono text-sm text-wedding-text-primary focus:outline-none"
						/>
						<button
							type="button"
							onclick={copyToClipboard}
							class={`rounded-lg px-4 py-2 text-sm font-medium transition ${
								copySuccess
									? 'bg-green-600 text-white'
									: 'bg-wedding-sage text-white hover:bg-wedding-sage/90'
							}`}
						>
							{#if copySuccess}
								<svg
									class="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
							{:else}
								Copy
							{/if}
						</button>
					</div>
				</div>

				<div class="flex gap-3">
					<button
						type="button"
						onclick={downloadQR}
						disabled={!qrDataUrl}
						class="flex-1 rounded-lg border border-wedding-sage bg-white px-4 py-2.5 text-sm font-medium text-wedding-sage transition hover:bg-wedding-sage/5 disabled:opacity-50"
					>
						<span class="flex items-center justify-center gap-2">
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
									d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
								/>
							</svg>
							Download QR Code
						</span>
					</button>
					<button
						type="button"
						onclick={onClose}
						class="flex-1 rounded-lg bg-wedding-sage px-4 py-2.5 text-sm font-medium text-white transition hover:bg-wedding-sage/90"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}

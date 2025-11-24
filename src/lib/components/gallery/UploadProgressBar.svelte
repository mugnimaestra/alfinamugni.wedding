<script lang="ts">
	interface Props {
		isVisible: boolean;
		overallProgress: number;
		currentFileIndex: number;
		totalFiles: number;
		currentFileName: string;
		currentFileProgress: number;
	}

	let {
		isVisible,
		overallProgress,
		currentFileIndex,
		totalFiles,
		currentFileName,
		currentFileProgress,
	}: Props = $props();

	function formatFileName(fileName: string): string {
		if (!fileName) {
			return 'Preparing...';
		}
		// Truncate long file names
		if (fileName.length > 30) {
			return fileName.substring(0, 27) + '...';
		}
		return fileName;
	}
</script>

{#if isVisible}
	<div
		class="fixed bottom-8 left-1/2 z-[9999] -translate-x-1/2 w-full max-w-md px-4"
		role="status"
		aria-live="polite"
		aria-label="Upload progress"
	>
		<div
			class="rounded-xl border border-wedding-beige bg-white shadow-2xl p-4 animate-slideInUp"
		>
			<!-- Header -->
			<div class="mb-3 flex items-center justify-between">
				<div class="flex items-center gap-x-2">
					<svg
						class="h-5 w-5 animate-spin text-wedding-sage"
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
					<h3 class="font-serif text-lg font-semibold text-wedding-text-primary">
						Uploading Media
					</h3>
				</div>
				<span class="text-sm font-medium text-wedding-text-secondary">
					{Math.round(overallProgress)}%
				</span>
			</div>

			<!-- File Info -->
			<div class="mb-3">
				<div class="mb-1 flex items-center justify-between text-sm">
					<span class="text-wedding-text-secondary">
						File {currentFileIndex + 1} of {totalFiles}
					</span>
					<span class="text-wedding-text-muted-brown">
						{Math.round(currentFileProgress)}%
					</span>
				</div>
				<p class="truncate text-sm font-medium text-wedding-text-primary" title={currentFileName}>
					{formatFileName(currentFileName)}
				</p>
			</div>

			<!-- Overall Progress Bar -->
			<div class="mb-2">
				<div class="h-2 w-full overflow-hidden rounded-full bg-wedding-cream">
					<div
						class="h-full rounded-full bg-gradient-to-r from-wedding-sage to-wedding-steel transition-all duration-300 ease-out"
						style="width: {overallProgress}%"
						role="progressbar"
						aria-valuenow={overallProgress}
						aria-valuemin="0"
						aria-valuemax="100"
					/>
				</div>
			</div>

			<!-- Current File Progress Bar -->
			<div>
				<div class="h-1.5 w-full overflow-hidden rounded-full bg-wedding-beige">
					<div
						class="h-full rounded-full bg-wedding-accent-brown transition-all duration-300 ease-out"
						style="width: {currentFileProgress}%"
					/>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slideInUp {
		from {
			transform: translate(-50%, 100%);
			opacity: 0;
		}
		to {
			transform: translate(-50%, 0);
			opacity: 1;
		}
	}

	.animate-slideInUp {
		animation: slideInUp 0.3s ease-out;
	}
</style>


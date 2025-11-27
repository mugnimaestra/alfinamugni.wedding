<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	interface Props {
		children: import('svelte').Snippet;
		onRefresh?: () => Promise<void>;
		threshold?: number;
		disabled?: boolean;
	}

	let { children, onRefresh, threshold = 80, disabled = false }: Props = $props();

	let pullDistance = $state(0);
	let isRefreshing = $state(false);
	let isPulling = $state(false);
	let startY = $state(0);
	let containerEl: HTMLDivElement;

	const pullProgress = $derived(Math.min(pullDistance / threshold, 1));
	const shouldTrigger = $derived(pullDistance >= threshold);

	function handleTouchStart(e: TouchEvent) {
		if (disabled || isRefreshing) return;
		
		// Only activate pull-to-refresh when scrolled to top
		const scrollTop = containerEl?.scrollTop ?? window.scrollY;
		if (scrollTop > 5) return;

		startY = e.touches[0].clientY;
		isPulling = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isPulling || disabled || isRefreshing) return;

		const currentY = e.touches[0].clientY;
		const diff = currentY - startY;

		// Only track downward pulls
		if (diff > 0) {
			// Apply resistance for natural feel
			pullDistance = Math.min(diff * 0.5, threshold * 1.5);
			
			// Prevent default scroll when pulling
			if (pullDistance > 10) {
				e.preventDefault();
			}
		}
	}

	async function handleTouchEnd() {
		if (!isPulling || disabled) return;

		isPulling = false;

		if (shouldTrigger && !isRefreshing) {
			isRefreshing = true;
			pullDistance = threshold; // Keep indicator visible during refresh

			try {
				if (onRefresh) {
					await onRefresh();
				} else {
					await invalidateAll();
				}
			} catch (error) {
				console.error('Refresh failed:', error);
			} finally {
				isRefreshing = false;
				pullDistance = 0;
			}
		} else {
			pullDistance = 0;
		}
	}
</script>

<div
	bind:this={containerEl}
	class="pull-to-refresh-container relative"
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	role="region"
	aria-label="Pull to refresh"
>
	<!-- Pull indicator -->
	{#if pullDistance > 0 || isRefreshing}
		<div
			class="pull-indicator pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-center justify-center"
			style="height: {Math.max(pullDistance, isRefreshing ? 60 : 0)}px; transition: {isPulling ? 'none' : 'height 0.3s ease-out'};"
		>
			<div
				class="flex flex-col items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg"
				style="opacity: {pullProgress}; transform: scale({0.5 + pullProgress * 0.5});"
			>
				<svg
					class="h-6 w-6 text-wedding-sage"
					class:animate-spin={isRefreshing}
					style="transform: rotate({isRefreshing ? 0 : pullProgress * 180}deg); transition: {isRefreshing ? 'none' : 'transform 0.1s ease-out'};"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					{#if isRefreshing}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					{:else}
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 14l-7 7m0 0l-7-7m7 7V3"
						/>
					{/if}
				</svg>
				<span class="text-xs font-medium text-wedding-text-muted">
					{isRefreshing ? 'Refreshing...' : shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
				</span>
			</div>
		</div>
	{/if}

	<!-- Main content with offset during pull -->
	<div
		style="transform: translateY({pullDistance}px); transition: {isPulling ? 'none' : 'transform 0.3s ease-out'};"
	>
		{@render children()}
	</div>
</div>

<style>
	.pull-to-refresh-container {
		overscroll-behavior-y: contain;
		-webkit-overflow-scrolling: touch;
	}
</style>

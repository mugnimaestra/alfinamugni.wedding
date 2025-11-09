<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import lottie from 'lottie-web';

	interface Props {
		src: string;
		width?: number;
		height?: number;
		loop?: boolean;
		autoplay?: boolean;
		className?: string;
	}

	let {
		src,
		width = 64,
		height = 64,
		loop = true,
		autoplay = true,
		className = ''
	}: Props = $props();

	let container: HTMLDivElement;
	let animation: ReturnType<typeof lottie.loadAnimation> | null = null;

	onMount(() => {
		if (!container) return;

		// Check for reduced motion preference
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		try {
			animation = lottie.loadAnimation({
				container,
				renderer: 'svg',
				path: src,
				loop: prefersReducedMotion ? false : loop,
				autoplay: prefersReducedMotion ? false : autoplay
			});
		} catch (error) {
			console.error('Failed to load Lottie animation:', error);
		}
	});

	onDestroy(() => {
		if (animation) {
			animation.destroy();
			animation = null;
		}
	});
</script>

<div
	bind:this={container}
	class={className}
	style="width: {width}px; height: {height}px;"
	aria-hidden="true"
></div>


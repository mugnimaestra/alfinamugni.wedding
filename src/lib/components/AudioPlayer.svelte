<script lang="ts">
	import { onMount } from 'svelte';
	import { Pause, Play } from 'lucide-svelte';
	import { audioStore } from '$lib/stores/audioStore';
	import Toast from './Toast.svelte';

	let isPlaying = $state(false);
	let audioElement = $state<HTMLAudioElement | null>(null);
	let isHovered = $state(false);
	let wasPlayingBeforeBlur = $state(false);

	// Subscribe to audio store for autoplay trigger
	$effect(() => {
		if ($audioStore.shouldPlay && audioElement && audioElement.paused && !isPlaying) {
			play();
		}
	});

	onMount(() => {
		// Create audio element
		audioElement = new Audio('/The Wedding of Alfina & Mugni.mp3');
		audioElement.loop = true;
		audioElement.volume = 0.6;

		// Add event listeners
		audioElement.addEventListener('play', () => {
			isPlaying = true;
		});

		audioElement.addEventListener('pause', () => {
			isPlaying = false;
		});

		audioElement.addEventListener('ended', () => {
			isPlaying = false;
		});

		audioElement.addEventListener('error', (e) => {
			console.error('Audio playback error:', e);
			isPlaying = false;
		});

		// Keyboard support
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.code === 'Space' && e.target === document.body) {
				e.preventDefault();
				togglePlay();
			}
		};

		// Tab focus/blur handling - pause when tab loses focus, resume when regains focus
		const handleVisibilityChange = () => {
			if (document.hidden) {
				// Tab lost focus
				if (audioElement && !audioElement.paused) {
					wasPlayingBeforeBlur = true;
					pause();
				}
			} else {
				// Tab regained focus
				if (wasPlayingBeforeBlur && audioElement && audioElement.paused) {
					play();
					wasPlayingBeforeBlur = false;
				}
			}
		};

		document.addEventListener('keydown', handleKeyPress);
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('keydown', handleKeyPress);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			if (audioElement) {
				audioElement.pause();
				audioElement = null;
			}
		};
	});

	async function play() {
		if (audioElement && audioElement.paused) {
			try {
				await audioElement.play();
				isPlaying = true; // Update synchronously
				audioStore.setPlaying(true);

				// Reset shouldPlay after successful autoplay to prevent effect from retriggering
				if ($audioStore.shouldPlay) {
					audioStore.resetShouldPlay();
				}
			} catch (error) {
				isPlaying = false;
				audioStore.setPlaying(false);
				audioStore.showAutoplayBlockedToast();
			}
		}
	}

	function pause() {
		if (audioElement && !audioElement.paused) {
			audioElement.pause();
			isPlaying = false; // Update synchronously
			audioStore.setPlaying(false);
		}
	}

	function togglePlay() {
		if (audioElement && !audioElement.paused) {
			pause();
		} else {
			play();
		}
	}
</script>

<div class="audio-player-floating fixed bottom-8 right-8 z-[9998] flex flex-col gap-2 items-end">
	<!-- Music Bars Animation (shows when playing) -->
	{#if isPlaying}
		<div class="music-bars flex gap-[3px] items-end h-5 px-2">
			{#each [0, 1, 2] as i}
				<div
					class="music-bar w-[3px] bg-wedding-steel rounded-sm h-full origin-bottom"
					style="animation: musicBar 0.6s ease-in-out infinite; animation-delay: {i * 0.15}s"
				/>
			{/each}
		</div>
	{/if}

	<!-- Main Play/Pause Button -->
	<button
		onclick={() => {
			togglePlay();
		}}
		onmouseenter={() => (isHovered = true)}
		onmouseleave={() => (isHovered = false)}
		class="audio-control-button w-14 h-14 rounded-full bg-wedding-steel text-white border-2 border-white flex items-center justify-center cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all duration-300"
		class:scale-110={isHovered}
		class:shadow-[0_6px_16px_rgba(0,0,0,0.4)]={isHovered}
		aria-label={isPlaying ? 'Pause music' : 'Play music'}
		title={isPlaying ? 'Pause music (Space)' : 'Play music (Space)'}
	>
		{#if isPlaying}
			<Pause class="w-6 h-6" />
		{:else}
			<Play class="w-6 h-6 ml-0.5" />
		{/if}
	</button>
</div>

<!-- Toast for autoplay blocked -->
<Toast
	message="Click play button to start music"
	show={$audioStore.showAutoplayBlockedToast}
	onDismiss={() => audioStore.hideAutoplayBlockedToast()}
/>

<script lang="ts">
	import '../app.css';
	import AudioPlayer from '$lib/components/AudioPlayer.svelte';
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#B3CBE4" />
</svelte:head>

<!-- Main Content -->
<slot />

<!-- Audio Player -->
<AudioPlayer />

<style lang="postcss" global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
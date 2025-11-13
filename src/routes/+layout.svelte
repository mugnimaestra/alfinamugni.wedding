<script lang="ts">
	import '../app.css';
	import AudioPlayer from '$lib/components/AudioPlayer.svelte';
	import { siteConfig } from '$lib/config/site';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content={siteConfig.themeColor} />
	<meta name="language" content={siteConfig.language} />
	
	<!-- Base Open Graph properties -->
	<meta property="og:site_name" content={siteConfig.name} />
	<meta property="og:locale" content={siteConfig.locale} />
	
	<!-- Base canonical URL (can be overridden per page) -->
	<link rel="canonical" href={`${siteConfig.url}${$page.url.pathname}`} />
</svelte:head>

<!-- Main Content -->
<slot />

<!-- Audio Player - Hidden on gallery page -->
{#if $page.url.pathname !== '/gallery'}
	<AudioPlayer />
{/if}

<style lang="postcss" global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;
</style>
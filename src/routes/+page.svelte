<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import InvitationCover from '$lib/components/InvitationCover.svelte';
	import Navigation from '$lib/components/Navigation.svelte';
	import HeroSection from '$lib/components/HeroSection.svelte';
	import CountdownSection from '$lib/components/CountdownSection.svelte';
	import DetailsSection from '$lib/components/DetailsSection.svelte';
	import GiftSection from '$lib/components/GiftSection.svelte';
	import GallerySection from '$lib/components/GallerySection.svelte';
	import WishesSection from '$lib/components/WishesSection.svelte';
	import PhotoGallerySection from '$lib/components/PhotoGallerySection.svelte';
	import FooterSection from '$lib/components/FooterSection.svelte';
	import { siteConfig } from '$lib/config/site';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Cover always shows on page load
	let showCover = $state(true);
	let isHydrated = $state(false);

	/**
	 * Decodes and sanitizes guest name from URL query parameter
	 */
	function decodeGuestName(rawValue: string | null): string | undefined {
		if (!rawValue) {
			return undefined;
		}

		// Decode URL-encoded characters (handles %20, %2B, etc.)
		let decoded = decodeURIComponent(rawValue);

		// Replace + with spaces
		decoded = decoded.replace(/\+/g, ' ');

		// Trim whitespace and collapse multiple spaces to single space
		decoded = decoded.trim().replace(/\s+/g, ' ');

		// Return undefined if empty after processing
		if (!decoded) {
			return undefined;
		}

		// Validate length (max 100 characters)
		if (decoded.length > 100) {
			decoded = decoded.substring(0, 100).trim();
		}

		return decoded;
	}

	// Get guest name from server-side data, with reactive client-side updates
	const guestName = $derived.by(() => {
		// Check URL params first (for client-side navigation reactivity)
		const urlParam = $page.url.searchParams.get('to');
		if (urlParam) {
			return decodeGuestName(urlParam);
		}

		// Fallback to server-side data (for SSR initial load)
		return data.guestName;
	});

	onMount(() => {
		// Ensure body class is set for scroll lock
		document.body.classList.add('cover-active');

		// Mark as hydrated to enable smooth transitions
		isHydrated = true;

		// Ensure scroll is at top
		window.scrollTo(0, 0);
	});

	function handleOpenInvitation() {
		showCover = false;
		// Remove body class to unlock scroll
		document.body.classList.remove('cover-active');
	}

	// Build full URL for OG image
	const ogImageUrl = `${siteConfig.url}${siteConfig.ogImage}`;
	const pageUrl = `${siteConfig.url}${$page.url.pathname}`;

	// JSON-LD structured data for Event schema
	const eventStructuredData = {
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: siteConfig.name,
		description: siteConfig.description,
		startDate: `2025-11-29T10:00:00+07:00`,
		endDate: `2025-11-29T23:59:59+07:00`,
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		location: {
			'@type': 'Place',
			name: siteConfig.wedding.location.name,
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'Jakarta',
				addressCountry: siteConfig.wedding.location.addressCountry,
			},
		},
		organizer: [
			{
				'@type': 'Person',
				name: siteConfig.wedding.couple.bride,
			},
			{
				'@type': 'Person',
				name: siteConfig.wedding.couple.groom,
			},
		],
		image: ogImageUrl,
	};
	const jsonLdScript = `<script type="application/ld+json">${JSON.stringify(
		eventStructuredData
	)}<\/script>`;
</script>

<svelte:head>
	<title>{siteConfig.name}</title>
	<meta name="description" content={siteConfig.description} />
	<meta
		name="keywords"
		content="undangan pernikahan, wedding invitation, Alfina, Mugni, Jakarta, Indonesia, 29 November 2025"
	/>
	<meta name="author" content={siteConfig.author} />
	<meta
		name="robots"
		content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
	/>
	<link rel="canonical" href={pageUrl} />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:title" content={siteConfig.name} />
	<meta property="og:description" content={siteConfig.description} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Undangan Pernikahan Alfina & Mugni" />
	<meta property="og:locale" content={siteConfig.locale} />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={siteConfig.name} />
	<meta name="twitter:description" content={siteConfig.description} />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:image:alt" content="Undangan Pernikahan Alfina & Mugni" />

	<!-- JSON-LD Structured Data -->
	{@html jsonLdScript}
</svelte:head>

<!-- Invitation Cover (shows first, hides after clicking "Open Invitation") -->
{#if showCover}
	<InvitationCover {guestName} onOpen={handleOpenInvitation} />
{/if}

<!-- Main Website Content - ALWAYS rendered, initially hidden by cover -->
<div class="main-content" class:visible={!showCover} class:hydrated={isHydrated}>
	<Navigation />
	<main>
		<HeroSection />
		<CountdownSection />
		<DetailsSection />
		<GiftSection />
		<GallerySection />
		<WishesSection />
		<PhotoGallerySection />
		<FooterSection />
	</main>
</div>

<style>
	.main-content {
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.5s ease-in, visibility 0s linear 0.5s;
	}

	.main-content.visible {
		opacity: 1;
		visibility: visible;
		transition: opacity 0.5s ease-in, visibility 0s linear 0s;
	}

	.main-content.hydrated.visible {
		opacity: 1;
	}
</style>

<script lang="ts">
	import { audioStore } from '$lib/stores/audioStore';

	interface Props {
		guestName?: string;
		onOpen: () => void;
	}

	let { guestName, onOpen }: Props = $props();

	let coverRef = $state<HTMLDivElement | null>(null);
	let isAnimating = $state(false);

	function handleOpen() {
		if (isAnimating) {
			return;
		}

		if (!coverRef) {
			onOpen();
			audioStore.triggerPlay();
			return;
		}

		isAnimating = true;

		// Animate cover exit
		coverRef.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
		coverRef.style.opacity = '0';
		coverRef.style.transform = 'scale(1.1)';

		setTimeout(() => {
			onOpen();
			// Trigger audio after 600ms (when cover animation completes)
			audioStore.triggerPlay();
		}, 600);
	}

	/**
	 * Formats and sanitizes the guest name for display
	 */
	function formatGuestName(name: string | undefined): string {
		if (!name) {
			return 'Nama Tamu';
		}

		// Decode URL-encoded characters (handles %20, %2B, etc.)
		let formatted = decodeURIComponent(name);

		// Replace + with spaces (in case it wasn't decoded properly)
		formatted = formatted.replace(/\+/g, ' ');

		// Trim whitespace and collapse multiple spaces to single space
		formatted = formatted.trim().replace(/\s+/g, ' ');

		// Sanitize HTML to prevent XSS (remove any HTML tags)
		formatted = formatted.replace(/<[^>]*>/g, '');

		// Return formatted name or fallback if empty after processing
		return formatted || 'Nama Tamu';
	}

	const displayName = formatGuestName(guestName);
</script>

<div
	bind:this={coverRef}
	class="invitation-cover fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 bg-cover bg-no-repeat"
	style="background-image: url(/photos/cover-hero.jpg); background-position: 45% center;"
>
	<!-- Dark overlay for better text readability -->
	<div class="absolute inset-0 bg-black/45 z-[1]" />

	<!-- Content -->
	<div
		class="cover-content relative z-[2] text-center text-white max-w-xs sm:max-w-md md:max-w-2xl w-full px-4"
	>
		<!-- Kepada Bapak/Ibu/Saudara/i -->
		<div class="cover-dear text-base sm:text-lg font-light tracking-wider mb-2 opacity-95">
			Kepada Bapak/Ibu/Saudara/i
		</div>

		<div
			class="cover-guest-name text-xl sm:text-2xl md:text-3xl font-medium tracking-wide mb-6 sm:mb-10"
		>
			{displayName}
		</div>

		<!-- AM Monogram -->
		<div class="cover-monogram mb-6 sm:mb-8 flex justify-center">
			<img
				src="/A&M_Logo.svg"
				alt="A & M Logo"
				class="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32"
				style="filter: brightness(0) invert(1);"
			/>
		</div>

		<!-- Couple Names -->
		<div
			class="cover-couple-names text-3xl sm:text-4xl md:text-5xl font-serif mb-4 sm:mb-6 tracking-wide"
		>
			Alfina & Mugni
		</div>

		<!-- Wedding Date -->
		<div class="cover-date text-base sm:text-lg md:text-xl font-light mb-8 sm:mb-12 tracking-wide">
			29 November 2025
		</div>

		<!-- Open Invitation Button -->
		<button
			onclick={handleOpen}
			class="open-invitation-button wedding-button px-8 py-3 text-base sm:text-lg font-medium rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
		>
			Buka Undangan
		</button>
	</div>
</div>

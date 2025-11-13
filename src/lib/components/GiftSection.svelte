<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicOut, cubicIn } from 'svelte/easing';
	import { onMount } from 'svelte';

	type AnimationState = 'idle' | 'opening' | 'revealing' | 'complete';

	let showBankDetails = $state(false);
	let animationState = $state<AnimationState>('idle');
	let buttonElement = $state<HTMLButtonElement>();
	let envelopeContainer = $state<HTMLDivElement>();
	let envelopeFlap = $state<HTMLDivElement>();
	let cardElement = $state<HTMLDivElement>();
	let prefersReducedMotion = $state(false);

	// Animation values using Svelte 5 Tween
	let buttonScale = $state(new Tween(1, { duration: 0, easing: cubicIn }));
	let buttonOpacity = $state(new Tween(1, { duration: 0, easing: cubicIn }));
	let buttonHeight = $state(new Tween(60, { duration: 0, easing: cubicIn })); // Approximate button height in px
	let buttonMarginBottom = $state(new Tween(24, { duration: 0, easing: cubicIn })); // mb-6 = 24px
	let envelopeOpacity = $state(new Tween(0, { duration: 0, easing: cubicOut }));
	let envelopeScale = $state(new Tween(0.8, { duration: 0, easing: cubicOut }));
	let envelopeY = $state(new Tween(0, { duration: 0, easing: cubicOut }));
	let flapRotation = $state(new Tween(0, { duration: 0, easing: cubicOut }));
	let cardY = $state(new Tween(50, { duration: 0, easing: cubicOut }));
	let cardOpacity = $state(new Tween(0, { duration: 0, easing: cubicOut }));
	let cardScale = $state(new Tween(0.9, { duration: 0, easing: cubicOut }));

	// Content item animations (staggered)
	let contentItem1Opacity = $state(new Tween(0, { duration: 0, easing: cubicOut }));
	let contentItem1Y = $state(new Tween(10, { duration: 0, easing: cubicOut }));
	let contentItem2Opacity = $state(new Tween(0, { duration: 0, easing: cubicOut }));
	let contentItem2Y = $state(new Tween(10, { duration: 0, easing: cubicOut }));
	let contentItem3Opacity = $state(new Tween(0, { duration: 0, easing: cubicOut }));
	let contentItem3Y = $state(new Tween(10, { duration: 0, easing: cubicOut }));

	onMount(() => {
		prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	function copyToClipboard(text: string, type: string) {
		navigator.clipboard.writeText(text).then(() => {
			alert(`${type} nomor rekening telah disalin!`);
		});
	}

	function getAnimationDuration(baseDuration: number): number {
		return prefersReducedMotion ? 0.1 : baseDuration;
	}

	async function toggleBankDetails() {
		if (showBankDetails) {
			// Reset state
			showBankDetails = false;
			animationState = 'idle';

			// Reset all animation values
			buttonScale.set(1);
			buttonOpacity.set(1);
			buttonHeight.set(60);
			buttonMarginBottom.set(24);
			envelopeOpacity.set(0);
			envelopeScale.set(0.8);
			envelopeY.set(0);
			flapRotation.set(0);
			cardY.set(50);
			cardOpacity.set(0);
			cardScale.set(0.9);
			contentItem1Opacity.set(0);
			contentItem1Y.set(10);
			contentItem2Opacity.set(0);
			contentItem2Y.set(10);
			contentItem3Opacity.set(0);
			contentItem3Y.set(10);
			return;
		}

		try {
			// Step 1: Animate button out and collapse its space
			animationState = 'opening';
			const buttonDuration = getAnimationDuration(400);

			// Start showing envelope early so it can animate up smoothly
			showBankDetails = true;

			// Wait for DOM to update
			await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

			if (envelopeContainer) {
				const envelopeDuration = getAnimationDuration(600);
				// Calculate total space to move up (button height + margin)
				const totalSpace = 60 + 24; // button height + margin-bottom
				// Start envelope below and move it up as button collapses
				envelopeY.set(totalSpace, { duration: 0 }); // Start below
				envelopeOpacity.set(0.3, { duration: 0 }); // Start slightly visible

				// Animate button scale and opacity
				buttonScale.set(0, { duration: buttonDuration, easing: cubicIn });
				buttonOpacity.set(0, { duration: buttonDuration, easing: cubicIn });
				// Collapse button height and margin smoothly
				buttonHeight.set(0, { duration: buttonDuration, easing: cubicIn });
				buttonMarginBottom.set(0, { duration: buttonDuration, easing: cubicIn });
				// Move envelope up smoothly as button collapses (synchronized)
				envelopeY.set(0, { duration: buttonDuration, easing: cubicIn });
				envelopeOpacity.set(1, { duration: envelopeDuration, easing: cubicOut });
				envelopeScale.set(1, { duration: envelopeDuration, easing: cubicOut });

				await new Promise((resolve) =>
					setTimeout(resolve, Math.max(buttonDuration, envelopeDuration))
				);
			}

			// Step 3: Open flap (3D rotation)
			if (envelopeFlap) {
				const flapDuration = getAnimationDuration(800);
				flapRotation.set(-180, { duration: flapDuration, easing: cubicOut });

				await new Promise((resolve) => setTimeout(resolve, flapDuration));
			}

			// Step 4: Card reveal
			animationState = 'revealing';
			await new Promise((resolve) => requestAnimationFrame(resolve));

			if (cardElement) {
				const cardDuration = getAnimationDuration(600);
				cardY.set(0, { duration: cardDuration, easing: cubicOut });
				cardOpacity.set(1, { duration: cardDuration, easing: cubicOut });
				cardScale.set(1, { duration: cardDuration, easing: cubicOut });

				await new Promise((resolve) => setTimeout(resolve, cardDuration));

				// Step 5: Staggered content items
				const itemDuration = getAnimationDuration(400);
				const staggerDelay = prefersReducedMotion ? 0 : 100;

				// Item 1
				setTimeout(() => {
					contentItem1Opacity.set(1, { duration: itemDuration, easing: cubicOut });
					contentItem1Y.set(0, { duration: itemDuration, easing: cubicOut });
				}, 0);

				// Item 2
				setTimeout(() => {
					contentItem2Opacity.set(1, { duration: itemDuration, easing: cubicOut });
					contentItem2Y.set(0, { duration: itemDuration, easing: cubicOut });
				}, staggerDelay);

				// Item 3
				setTimeout(() => {
					contentItem3Opacity.set(1, { duration: itemDuration, easing: cubicOut });
					contentItem3Y.set(0, { duration: itemDuration, easing: cubicOut });
				}, staggerDelay * 2);
			}

			animationState = 'complete';
		} catch (error) {
			console.error('Animation error:', error);
			// Ensure content is visible on error
			if (cardElement) {
				cardY.set(0);
				cardOpacity.set(1);
				cardScale.set(1);
			}
			contentItem1Opacity.set(1);
			contentItem1Y.set(0);
			contentItem2Opacity.set(1);
			contentItem2Y.set(0);
			contentItem3Opacity.set(1);
			contentItem3Y.set(0);
			animationState = 'complete';
		}
	}
</script>

<section
	id="gift"
	class="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-wedding-sky to-wedding-silver-light"
>
	<div class="max-w-6xl mx-auto text-center">
		<h2 class="font-serif text-4xl md:text-6xl mb-6 font-light text-wedding-navy">
			Digital Gift
		</h2>

		<div class="max-w-3xl mx-auto mb-12">
			<p class="text-lg md:text-xl text-wedding-text-light">
				Doa restu Anda merupakan karunia yang sangat berarti bagi kami, dan jika memberi adalah
				ungkapan tanda kasih, Anda dapat memberi kado secara cashless.
			</p>
		</div>

		<div class="max-w-md mx-auto relative" style="min-height: 400px;">
			<!-- Klik Disini Button -->
			{#if animationState === 'idle' || animationState === 'opening'}
				<div
					style="height: {buttonHeight.current}px; margin-bottom: {buttonMarginBottom.current}px; overflow: hidden;"
				>
					<button
						bind:this={buttonElement}
						onclick={toggleBankDetails}
						class="wedding-button px-8 py-3 text-base sm:text-lg font-medium rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
						style="opacity: {buttonOpacity.current}; transform: scale({buttonScale.current}); pointer-events: {animationState ===
						'opening'
							? 'none'
							: 'auto'};"
					>
						Klik Disini
					</button>
				</div>
			{/if}

			<!-- Envelope Container -->
			{#if showBankDetails}
				<div
					bind:this={envelopeContainer}
					class="relative mb-6 envelope-container"
					style="opacity: {envelopeOpacity.current}; transform: scale({envelopeScale.current}) translateY({envelopeY.current}px); perspective: 1000px; transform-style: preserve-3d;"
				>
					<!-- Envelope Base -->
					<div
						class="relative w-full h-64 bg-gradient-to-b from-wedding-cream to-wedding-beige rounded-lg shadow-2xl"
						style="border: 2px solid rgba(93, 136, 187, 0.3);"
					>
						<!-- Envelope Flap -->
						<div
							bind:this={envelopeFlap}
							class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-wedding-sky to-wedding-cream rounded-t-lg origin-bottom envelope-flap"
							style="border: 2px solid rgba(93, 136, 187, 0.3); border-bottom: none; transform-origin: bottom center; transform: rotateX({flapRotation.current}deg); backface-visibility: hidden;"
						>
						<!-- Flap inner side (visible when opened) -->
						<div
							class="absolute inset-0 bg-gradient-to-b from-wedding-beige to-wedding-cream rounded-t-lg"
							style="backface-visibility: hidden; transform: rotateX(180deg);"
						></div>
						</div>

						<!-- Envelope Content Area -->
						<div class="absolute inset-0 flex items-center justify-center p-6 pt-20">
							<div
								bind:this={cardElement}
								class="wedding-card p-6 rounded-lg shadow-xl bg-white w-full max-w-sm card-initial"
								style="opacity: {cardOpacity.current}; transform: translateY({cardY.current}px) scale({cardScale.current});"
							>
								<div
									class="mb-4 card-content-item"
									style="opacity: {contentItem1Opacity.current}; transform: translateY({contentItem1Y.current}px);"
								>
									<h3 class="text-xl font-semibold mb-2 text-wedding-navy">Transfer Bank</h3>
									<div class="text-sm text-gray-600 mb-3">Bank Jago</div>
								</div>
								<div
									class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-lg mb-4 card-content-item"
									style="opacity: {contentItem2Opacity.current}; transform: translateY({contentItem2Y.current}px);"
								>
									<div class="text-xs uppercase tracking-wide mb-1">Nomor Rekening</div>
									<div class="text-lg font-mono">105803971206</div>
									<div class="text-sm mt-2">ALFINA NURMAYATI</div>
								</div>
								<button
									class="wedding-button w-full py-2 px-4 rounded transition-colors bg-wedding-steel text-white hover:bg-wedding-navy card-content-item"
									onclick={() => copyToClipboard('105803971206', 'Bank Jago')}
									style="opacity: {contentItem3Opacity.current}; transform: translateY({contentItem3Y.current}px);"
								>
									Salin Nomor Rekening
								</button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="mt-12 max-w-2xl mx-auto">
			<p class="text-wedding-wedding-silver-light text-sm italic">
				Terima kasih atas kebaikan dan kemurahan hati Anda. Doa dan kehadiran Anda sangat berarti
				bagi kami!
			</p>
		</div>
	</div>
</section>

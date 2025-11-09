<script lang="ts">
	import { onMount } from 'svelte';

	let days = $state(0);
	let hours = $state(0);
	let minutes = $state(0);
	let seconds = $state(0);

	onMount(() => {
		// Wedding date: November 29, 2025 at 9 AM Jakarta time (Akad Nikah)
		const weddingDate = new Date('2025-11-29T09:00:00+07:00').getTime();

		const updateCountdown = () => {
			const now = new Date().getTime();
			const distance = weddingDate - now;

			if (distance > 0) {
				days = Math.floor(distance / (1000 * 60 * 60 * 24));
				hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
				minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
				seconds = Math.floor((distance % (1000 * 60)) / 1000);
			} else {
				days = hours = minutes = seconds = 0;
			}
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);

		return () => clearInterval(interval);
	});
</script>

<section
	id="countdown"
	class="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-wedding-white to-wedding-silver-light"
>
	<div class="max-w-4xl mx-auto text-center">
		<h2 class="font-serif text-4xl md:text-6xl mb-4 font-light text-wedding-navy">
			Save The Date
		</h2>

		<p class="text-lg md:text-xl mb-12 text-wedding-text-light">Kami akan menikah dalam</p>

		<div class="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
			<!-- Days -->
			<div class="text-center">
				<div
					class="wedding-card p-6 md:p-8 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl bg-white border-2 border-wedding-silver"
				>
					<div class="text-3xl md:text-5xl font-bold mb-2 text-wedding-steel">
						{days}
					</div>
					<div class="text-sm md:text-base font-medium uppercase tracking-wider text-wedding-navy">
						Hari
					</div>
				</div>
			</div>

			<!-- Hours -->
			<div class="text-center">
				<div
					class="wedding-card p-6 md:p-8 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl bg-white border-2 border-wedding-silver"
				>
					<div class="text-3xl md:text-5xl font-bold mb-2 text-wedding-steel">
						{hours}
					</div>
					<div class="text-sm md:text-base font-medium uppercase tracking-wider text-wedding-navy">
						Jam
					</div>
				</div>
			</div>

			<!-- Minutes -->
			<div class="text-center">
				<div
					class="wedding-card p-6 md:p-8 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl bg-white border-2 border-wedding-silver"
				>
					<div class="text-3xl md:text-5xl font-bold mb-2 text-wedding-steel">
						{minutes}
					</div>
					<div class="text-sm md:text-base font-medium uppercase tracking-wider text-wedding-navy">
						Menit
					</div>
				</div>
			</div>

			<!-- Seconds -->
			<div class="text-center">
				<div
					class="wedding-card p-6 md:p-8 rounded-lg shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-xl bg-white border-2 border-wedding-silver"
				>
					<div class="text-3xl md:text-5xl font-bold mb-2 text-wedding-steel">
						{seconds}
					</div>
					<div class="text-sm md:text-base font-medium uppercase tracking-wider text-wedding-navy">
						Detik
					</div>
				</div>
			</div>
		</div>

		<div class="mt-12">
			<div class="text-2xl md:text-3xl font-serif mb-2 text-wedding-navy">
				Sabtu, 29 November 2025
			</div>
		</div>
	</div>
</section>

<section
	class="min-h-screen bg-gradient-to-b from-wedding-sky to-wedding-white flex flex-col items-center justify-center py-20 px-4 text-center"
>
	<div class="max-w-4xl mx-auto">
		<p class="text-xl md:text-2xl text-wedding-text-light mb-4 font-light">the Wedding of</p>

		<h1 class="font-serif text-5xl md:text-7xl lg:text-8xl text-wedding-navy mb-6 font-light">
			Alfina & Mugni
		</h1>

		<div class="w-32 h-0.5 bg-wedding-steel mx-auto mb-6"></div>

		<p class="text-lg md:text-xl text-wedding-navy mb-12 max-w-lg mx-auto">
			Kami berharap Anda menjadi bagian dari hari istimewa kami.
		</p>

		<button
			on:click={() => {
				const countdownSection = document.querySelector('#countdown');
				if (countdownSection) {
					countdownSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}}
			class="cursor-pointer"
			aria-label="Scroll to countdown section"
		>
			<svg
				class="w-8 h-8 text-wedding-steel mx-auto animate-bounce"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 14l-7 7m0 0l-7-7m7 7V3"
				/>
			</svg>
		</button>
	</div>
</section>

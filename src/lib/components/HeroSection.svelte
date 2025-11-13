<script lang="ts">
	import LottiePlayer from './animations/LottiePlayer.svelte';
</script>

<section
	class="min-h-screen bg-gradient-to-b from-wedding-sky to-wedding-white flex flex-col items-center justify-center py-20 px-4 text-center relative overflow-hidden"
>
	<!-- Decorative Lottie Animations -->
	<!-- Mobile: 6-8 animations, Desktop: 15-20 animations -->
	
	<!-- Top Left Corner - Flowers -->
	<div class="absolute top-8 left-4 md:top-12 md:left-8 opacity-60 animate-float">
		<LottiePlayer src="/animations/chamomile-flower.json" width={120} height={120} />
	</div>
	
	<!-- Top Right Corner - Bird -->
	<div class="absolute top-16 right-4 md:top-20 md:right-12 opacity-70 animate-float-delayed">
		<LottiePlayer src="/animations/bird.json" width={100} height={100} />
	</div>
	
	<!-- Left Side Mid - Flower with Leaf -->
	<div class="absolute left-2 top-1/3 md:left-8 opacity-50 animate-float">
		<LottiePlayer src="/animations/leaf-flower.json" width={140} height={140} />
	</div>
	
	<!-- Right Side Mid - Borage Flower -->
	<div class="absolute right-2 top-1/2 md:right-8 opacity-55 animate-float-delayed">
		<LottiePlayer src="/animations/borage-flower.json" width={130} height={130} />
	</div>
	
	<!-- Bottom Left - Line Art Flower -->
	<div class="absolute bottom-20 left-8 md:bottom-24 md:left-16 opacity-50 animate-float">
		<LottiePlayer src="/animations/line-art-flower.json" width={110} height={110} />
	</div>
	
	<!-- Bottom Right - Flower -->
	<div class="absolute bottom-24 right-6 md:bottom-28 md:right-14 opacity-60 animate-float-delayed">
		<LottiePlayer src="/animations/flower.json" width={120} height={120} />
	</div>
	
	<!-- Additional mobile animations (7-8) -->
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30 animate-float-slow pointer-events-none">
		<LottiePlayer src="/animations/leaf.json" width={60} height={60} />
	</div>
	
	<div class="absolute bottom-32 left-1/3 opacity-45 animate-float">
		<LottiePlayer src="/animations/flower.json" width={90} height={90} />
	</div>
	
	<!-- Desktop-only animations (9-20) -->
	<!-- Top section decorations -->
	<div class="hidden md:block absolute top-24 left-1/4 opacity-40 animate-float-slow">
		<LottiePlayer src="/animations/leaf.json" width={80} height={80} />
	</div>
	
	<div class="hidden md:block absolute top-32 right-1/4 opacity-50 animate-float">
		<LottiePlayer src="/animations/chamomile-flower.json" width={100} height={100} />
	</div>
	
	<div class="hidden lg:block absolute top-20 left-[15%] opacity-35 animate-float-delayed">
		<LottiePlayer src="/animations/bird.json" width={80} height={80} />
	</div>
	
	<div class="hidden lg:block absolute top-40 right-[20%] opacity-45 animate-float-slow">
		<LottiePlayer src="/animations/borage-flower.json" width={90} height={90} />
	</div>
	
	<!-- Middle section decorations -->
	<div class="hidden md:block absolute top-[40%] left-[12%] opacity-38 animate-float">
		<LottiePlayer src="/animations/line-art-flower.json" width={95} height={95} />
	</div>
	
	<div class="hidden md:block absolute top-[45%] right-[15%] opacity-42 animate-float-delayed">
		<LottiePlayer src="/animations/leaf-flower.json" width={110} height={110} />
	</div>
	
	<div class="hidden lg:block absolute top-[38%] left-[25%] opacity-30 animate-float-slow">
		<LottiePlayer src="/animations/flower.json" width={70} height={70} />
	</div>
	
	<div class="hidden lg:block absolute top-[55%] right-[22%] opacity-35 animate-float">
		<LottiePlayer src="/animations/chamomile-flower.json" width={85} height={85} />
	</div>
	
	<div class="hidden xl:block absolute top-[35%] right-[8%] opacity-40 animate-float-delayed">
		<LottiePlayer src="/animations/bird.json" width={90} height={90} />
	</div>
	
	<!-- Bottom section decorations -->
	<div class="hidden md:block absolute bottom-40 left-[18%] opacity-45 animate-float-slow">
		<LottiePlayer src="/animations/leaf-flower.json" width={100} height={100} />
	</div>
	
	<div class="hidden md:block absolute bottom-48 right-[25%] opacity-50 animate-float">
		<LottiePlayer src="/animations/borage-flower.json" width={105} height={105} />
	</div>
	
	<div class="hidden lg:block absolute bottom-36 left-[28%] opacity-35 animate-float-delayed">
		<LottiePlayer src="/animations/leaf.json" width={75} height={75} />
	</div>
	
	<div class="hidden lg:block absolute bottom-52 right-[18%] opacity-40 animate-float-slow">
		<LottiePlayer src="/animations/line-art-flower.json" width={88} height={88} />
	</div>
	
	<div class="hidden xl:block absolute bottom-44 left-[8%] opacity-38 animate-float">
		<LottiePlayer src="/animations/flower.json" width={95} height={95} />
	</div>
	
	<div class="hidden xl:block absolute bottom-56 right-[10%] opacity-43 animate-float-delayed">
		<LottiePlayer src="/animations/chamomile-flower.json" width={92} height={92} />
	</div>
	
	<!-- Extra decorative birds for large screens -->
	<div class="hidden xl:block absolute top-[28%] left-[35%] opacity-32 animate-float-slow">
		<LottiePlayer src="/animations/bird.json" width={70} height={70} />
	</div>
	
	<div class="hidden xl:block absolute bottom-[35%] right-[32%] opacity-30 animate-float">
		<LottiePlayer src="/animations/bird.json" width={65} height={65} />
	</div>

	<!-- Main Content -->
	<div class="max-w-4xl mx-auto relative z-10">
		<p class="text-xl md:text-2xl text-wedding-text-light mb-4 font-light">The Wedding of</p>

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

<style>
	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}
	
	@keyframes float-delayed {
		0%, 100% {
			transform: translateY(0px) translateX(0px);
		}
		50% {
			transform: translateY(-15px) translateX(5px);
		}
	}
	
	@keyframes float-slow {
		0%, 100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-10px) rotate(5deg);
		}
	}
	
	:global(.animate-float) {
		animation: float 6s ease-in-out infinite;
	}
	
	:global(.animate-float-delayed) {
		animation: float-delayed 7s ease-in-out infinite;
		animation-delay: 1s;
	}
	
	:global(.animate-float-slow) {
		animation: float-slow 8s ease-in-out infinite;
		animation-delay: 2s;
	}
</style>

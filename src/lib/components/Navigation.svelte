<script lang="ts">
	const navItems = [
		{ id: 'countdown', label: 'Hitung Mundur' },
		{ id: 'details', label: 'Detail Acara' },
		{ id: 'gift', label: 'Hadiah' },
		{ id: 'gallery', label: 'Kisah Kami' },
		{ id: 'photo-gallery', label: 'Galeri Foto' },
		{ id: 'wishes', label: 'Ucapan' },
	];

	function scrollToSection(sectionId: string) {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<nav
	id="main-navigation"
	class="hidden md:block fixed top-0 left-0 right-0 z-50 bg-wedding-sky bg-opacity-95 backdrop-blur-sm shadow-sm transition-all duration-300"
>
	<div class="max-w-6xl mx-auto px-4">
		<div class="flex items-center justify-between h-16">
			<!-- Logo/Title -->
			<button
				onclick={scrollToTop}
				class="nav-logo transition-all duration-300 transform hover:scale-105"
			>
				<img src="/A&M_Logo.svg" alt="A & M Logo" class="h-8 md:h-10 w-auto" />
			</button>

			<!-- Desktop Navigation -->
			<div class="hidden md:flex items-center space-x-8">
				{#each navItems as item (item.id)}
					<button
						onclick={() => scrollToSection(item.id)}
						class="nav-item text-wedding-text-steel hover:text-wedding-gold-dark transition-all duration-300 font-medium relative group"
					>
						{item.label}
						<span
							class="absolute -bottom-1 left-0 w-0 h-0.5 bg-wedding-gold-dark transition-all duration-300 group-hover:w-full"
						/>
					</button>
				{/each}
			</div>
		</div>
	</div>
</nav>

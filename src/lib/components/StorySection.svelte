<script lang="ts">
	interface StoryMilestone {
		year: string;
		title: string;
		description: string;
		icon: string;
		side: 'left' | 'right';
	}

	const storyMilestones: StoryMilestone[] = [
		{
			year: 'Masa Sekolah',
			title: 'Pertemuan Awal',
			description:
				'Kami bersekolah di SMP dan SMA yang sama, namun pertemuan kami yang sebenarnya terjadi di tempat yang tidak terduga. Takdir mempertemukan kami di waktu yang tepat.',
			icon: '📚',
			side: 'left'
		},
		{
			year: '10 Desember 2022',
			title: 'Hubungan Resmi',
			description:
				'Setelah saling mengenal lebih dalam, kami memutuskan untuk meresmikan hubungan kami. Ini adalah hari yang spesial ketika kami berkomitmen untuk saling mendukung dan tumbuh bersama.',
			icon: '❤️',
			side: 'right'
		},
		{
			year: 'Agustus 2024',
			title: 'Lamaran',
			description:
				'Dengan penuh kebahagiaan, Mugni melamar Alfina. Momen yang penuh haru dan sukacita, menandai langkah baru menuju kehidupan bersama sebagai suami istri.',
			icon: '💍',
			side: 'left'
		},
		{
			year: '29 November 2025',
			title: 'Hari Pernikahan Kami',
			description:
				'Dan sekarang, kami siap memulai babak baru sebagai suami istri, dikelilingi oleh keluarga dan teman-teman tercinta. Alhamdulillah untuk perjalanan indah ini!',
			icon: '👰‍♀️🤵‍♂️',
			side: 'right'
		}
	];
</script>

<section id="story-section" class="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-wedding-white">
	<div class="max-w-6xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="font-serif text-4xl md:text-6xl mb-6 font-light text-wedding-navy">
				Kisah Cinta Kami
			</h2>

		<p class="text-lg md:text-xl max-w-3xl mx-auto text-wedding-text-light">
			Dari teman kuliah hingga pasangan hidup - perjalanan cinta, pertumbuhan, dan momen-momen
			indah yang tak terhitung
		</p>
		</div>

		<!-- Timeline -->
		<div class="relative max-w-4xl mx-auto">
			<!-- Timeline Line -->
			<div
				class="absolute left-1/2 transform -translate-x-1/2 w-1 h-full hidden md:block bg-wedding-steel"
			></div>

			{#each storyMilestones as milestone (milestone.year)}
				<div
					class="relative flex items-center mb-12 md:mb-16 {milestone.side === 'left'
						? 'md:flex-row-reverse'
						: ''}"
				>
					<!-- Desktop Layout -->
					<div class="hidden md:flex md:w-1/2 md:px-8">
						<div
							class="wedding-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl w-full"
						>
							<div class="flex items-start space-x-4">
								<div class="text-4xl">{milestone.icon}</div>
								<div class="flex-1">
									<div class="text-wedding-steel text-sm font-medium mb-1">{milestone.year}</div>
									<h3 class="text-xl font-semibold text-wedding-navy mb-2">{milestone.title}</h3>
									<p class="text-wedding-text-steel text-sm leading-relaxed">
										{milestone.description}
									</p>
								</div>
							</div>
						</div>
					</div>

				<!-- Timeline Dot (Desktop) -->
				<div class="hidden md:block absolute left-1/2 transform -translate-x-1/2">
					<div
						class="w-6 h-6 rounded-full bg-wedding-steel border-4 border-wedding-white shadow-lg ring-4 ring-wedding-accent ring-opacity-60"
					></div>
				</div>

					<!-- Spacer (Desktop) -->
					<div class="hidden md:block md:w-1/2"></div>

					<!-- Mobile Layout -->
					<div class="md:hidden w-full">
						<div
							class="wedding-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl"
						>
							<div class="flex items-start space-x-4">
								<div class="text-4xl">{milestone.icon}</div>
								<div class="flex-1">
									<div class="text-wedding-steel text-sm font-medium mb-1">{milestone.year}</div>
									<h3 class="text-xl font-semibold text-wedding-navy mb-2">{milestone.title}</h3>
									<p class="text-wedding-text-steel text-sm leading-relaxed">
										{milestone.description}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>


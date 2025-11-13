<script lang="ts">
	import LottiePlayer from './animations/LottiePlayer.svelte';
</script>

<section
	id="gallery"
	class="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-wedding-silver-light to-wedding-white"
>
	<div class="max-w-6xl mx-auto">
		<!-- Header with Quote -->
		<div class="text-center mb-16">
			<h2 class="font-serif text-4xl md:text-6xl mb-8 font-light text-wedding-navy">Kisah Kami</h2>

			<div class="max-w-3xl mx-auto mb-8">
				<p class="text-lg md:text-xl text-wedding-text-dark italic leading-relaxed">
					Tidak ada yang spesial dalam cerita kami. Tapi kami sangat spesial untuk satu sama lain.
				</p>
			</div>
		</div>

		<!-- Timeline -->
		<div class="relative max-w-4xl mx-auto">
			<!-- Timeline Line (Desktop) -->
			<div
				class="absolute left-1/2 transform -translate-x-1/2 w-1 h-full hidden md:block bg-wedding-steel"
			/>

			<!-- Milestone 1: Awal Cerita -->
			<div class="relative flex items-center mb-12 md:mb-16 md:flex-row-reverse">
				<!-- Desktop Layout -->
				<div class="hidden md:flex md:w-1/2 md:px-8">
					<div
						class="wedding-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl w-full border-2 border-wedding-silver"
					>
						<div class="flex items-start space-x-4">
							<LottiePlayer
								src="/animations/plant-study.json"
								width={64}
								height={64}
								loop={true}
								autoplay={true}
							/>
							<div class="flex-1">
								<div class="text-wedding-steel text-sm font-medium mb-1">Masa Sekolah</div>
								<h3 class="text-xl font-semibold text-wedding-navy mb-2">Awal Cerita</h3>
								<p class="text-wedding-text-steel text-sm leading-relaxed">
									Menempuh pendidikan di SMP dan SMA yang sama, namun semesta mempertemukan kami di
									tempat yang tak pernah kami duga. Pertemuan berlanjut sampai akhirnya di malam ke
									sepuluh Desember 2022 diiringi gemerlap lampu kota kami sepakat menjalin hubungan.
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Timeline Dot (Desktop) -->
				<div class="hidden md:block absolute left-1/2 transform -translate-x-1/2">
					<div
						class="w-6 h-6 rounded-full bg-wedding-steel border-4 border-wedding-white shadow-lg ring-4 ring-wedding-accent ring-opacity-60"
					/>
				</div>

				<!-- Spacer (Desktop) -->
				<div class="hidden md:block md:w-1/2" />

				<!-- Mobile Layout -->
				<div class="md:hidden w-full">
					<div
						class="wedding-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl border-2 border-wedding-silver"
					>
						<div class="flex items-start space-x-4">
							<LottiePlayer
								src="/animations/plant-study.json"
								width={64}
								height={64}
								loop={true}
								autoplay={true}
							/>
							<div class="flex-1">
								<div class="text-wedding-steel text-sm font-medium mb-1">Masa Sekolah</div>
								<h3 class="text-xl font-semibold text-wedding-navy mb-2">Awal Cerita</h3>
								<p class="text-wedding-text-steel text-sm leading-relaxed">
									Menempuh pendidikan di SMP dan SMA yang sama, namun semesta mempertemukan kami di
									tempat yang tak pernah kami duga. Pertemuan berlanjut sampai akhirnya di malam ke
									sepuluh Desember 2022 diiringi gemerlap lampu kota kami sepakat menjalin hubungan.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Milestone 2: Lamaran -->
			<div class="relative flex items-center mb-12 md:mb-16">
				<!-- Desktop Layout -->
				<div class="hidden md:flex md:w-1/2 md:px-8">
					<div
						class="wedding-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl w-full border-2 border-wedding-silver"
					>
						<div class="flex items-start space-x-4">
							<LottiePlayer
								src="/animations/wedding-rings.json"
								width={64}
								height={64}
								loop={true}
								autoplay={true}
							/>
							<div class="flex-1">
								<div class="text-wedding-steel text-sm font-medium mb-1">Agustus 2024</div>
								<h3 class="text-xl font-semibold text-wedding-navy mb-2">Lamaran</h3>
								<p class="text-wedding-text-steel text-sm leading-relaxed">
									Semesta sepertinya suka mengaitkan malam dengan hubungan kami, sehingga pada suatu
									malam bulan Agustus 2024 terucaplah ajakan untuk menikah.
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Timeline Dot (Desktop) -->
				<div class="hidden md:block absolute left-1/2 transform -translate-x-1/2">
					<div
						class="w-6 h-6 rounded-full bg-wedding-steel border-4 border-wedding-white shadow-lg ring-4 ring-wedding-accent ring-opacity-60"
					/>
				</div>

				<!-- Spacer (Desktop) -->
				<div class="hidden md:block md:w-1/2" />

				<!-- Mobile Layout -->
				<div class="md:hidden w-full">
					<div
						class="wedding-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl border-2 border-wedding-silver"
					>
						<div class="flex items-start space-x-4">
							<LottiePlayer
								src="/animations/wedding-rings.json"
								width={64}
								height={64}
								loop={true}
								autoplay={true}
							/>
							<div class="flex-1">
								<div class="text-wedding-steel text-sm font-medium mb-1">Agustus 2024</div>
								<h3 class="text-xl font-semibold text-wedding-navy mb-2">Lamaran</h3>
								<p class="text-wedding-text-steel text-sm leading-relaxed">
									Semesta sepertinya suka mengaitkan malam dengan hubungan kami, sehingga pada suatu
									malam bulan Agustus 2024 terucaplah ajakan untuk menikah.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Milestone 3: Resepsi Pernikahan -->
			<div class="relative flex items-center mb-12 md:mb-16 md:flex-row-reverse">
				<!-- Desktop Layout -->
				<div class="hidden md:flex md:w-1/2 md:px-8">
					<div
						class="wedding-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl w-full border-2 border-wedding-silver"
					>
						<div class="flex items-start space-x-4">
							<LottiePlayer
								src="/animations/couple-holding-hands.json"
								width={64}
								height={64}
								loop={true}
								autoplay={true}
							/>
							<div class="flex-1">
								<div class="text-wedding-steel text-sm font-medium mb-1">29 November 2025</div>
								<h3 class="text-xl font-semibold text-wedding-navy mb-2">Resepsi Pernikahan</h3>
								<p class="text-wedding-text-steel text-sm leading-relaxed">
									Setelah melewati satu tahun yang panjang mempersiapkan segala hal, Inshaallah
									pernikahan kami akan diadakan pada Sabtu, 29 November 2025.
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Timeline Dot (Desktop) -->
				<div class="hidden md:block absolute left-1/2 transform -translate-x-1/2">
					<div
						class="w-6 h-6 rounded-full bg-wedding-steel border-4 border-wedding-white shadow-lg ring-4 ring-wedding-accent ring-opacity-60"
					/>
				</div>

				<!-- Spacer (Desktop) -->
				<div class="hidden md:block md:w-1/2" />

				<!-- Mobile Layout -->
				<div class="md:hidden w-full">
					<div
						class="wedding-card bg-white p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl border-2 border-wedding-silver"
					>
						<div class="flex items-start space-x-4">
							<LottiePlayer
								src="/animations/couple-holding-hands.json"
								width={64}
								height={64}
								loop={true}
								autoplay={true}
							/>
							<div class="flex-1">
								<div class="text-wedding-steel text-sm font-medium mb-1">29 November 2025</div>
								<h3 class="text-xl font-semibold text-wedding-navy mb-2">Resepsi Pernikahan</h3>
								<p class="text-wedding-text-steel text-sm leading-relaxed">
									Setelah melewati satu tahun yang panjang mempersiapkan segala hal, Inshaallah
									pernikahan kami akan diadakan pada Sabtu, 29 November 2025.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

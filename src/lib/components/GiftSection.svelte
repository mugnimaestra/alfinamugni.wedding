<script lang="ts">
	let showBankDetails = $state(false);

	function copyToClipboard(text: string, type: string) {
		navigator.clipboard.writeText(text).then(() => {
			alert(`${type} nomor rekening telah disalin!`);
		});
	}

	function toggleBankDetails() {
		showBankDetails = !showBankDetails;
	}
</script>

<section
	id="gift"
	class="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-wedding-sky to-wedding-silver-light"
>
	<div class="max-w-6xl mx-auto text-center">
		<h2 class="font-serif text-4xl md:text-6xl mb-6 font-light text-wedding-navy">
			Amplop Digital
		</h2>

		<div class="max-w-3xl mx-auto mb-12">
			<p class="text-lg md:text-xl text-wedding-text-light">
				Doa restu Anda merupakan karunia yang sangat berarti bagi kami, dan jika memberi adalah
				ungkapan tanda kasih, Anda dapat memberi kado secara cashless.
			</p>
		</div>

		<div class="max-w-md mx-auto">
			<!-- Klik Disini Button -->
			<button
				onclick={toggleBankDetails}
				class="wedding-button px-8 py-3 text-base sm:text-lg font-medium rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 mb-6"
			>
				Klik Disini
			</button>

			<!-- Bank Jago Transfer (Collapsible) -->
			{#if showBankDetails}
				<div
					class="wedding-card p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl bg-white"
				>
					<div class="mb-4">
						<h3 class="text-xl font-semibold mb-2 text-wedding-navy">Transfer Bank</h3>
						<div class="text-sm text-gray-600 mb-3">Bank Jago</div>
					</div>
					<div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-lg mb-4">
						<div class="text-xs uppercase tracking-wide mb-1">Nomor Rekening</div>
						<div class="text-lg font-mono">105803971206</div>
						<div class="text-sm mt-2">ALFINA NURMAYATI</div>
					</div>
					<button
						class="wedding-button w-full py-2 px-4 rounded transition-colors bg-wedding-steel text-white hover:bg-wedding-navy"
						onclick={() => copyToClipboard('105803971206', 'Bank Jago')}
					>
						Salin Nomor Rekening
					</button>
				</div>
			{/if}
		</div>

		<div class="mt-12 max-w-2xl mx-auto">
			<p class="text-wedding-text-muted text-sm italic">
				Terima kasih atas kebaikan dan kemurahan hati Anda. Doa dan kehadiran Anda sangat berarti
				bagi kami!
			</p>
		</div>
	</div>
</section>

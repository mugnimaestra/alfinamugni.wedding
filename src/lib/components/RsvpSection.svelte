<script lang="ts">
	let name = $state('');
	let email = $state('');
	let attending = $state('');
	let guests = $state(1);
	let message = $state('');
	let isSubmitting = $state(false);
	let showSuccess = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;

		// Simulate API call - will be implemented later
		setTimeout(() => {
			isSubmitting = false;
			showSuccess = true;
			// Reset form
			name = '';
			email = '';
			attending = '';
			guests = 1;
			message = '';

			// Hide success message after 5 seconds
			setTimeout(() => {
				showSuccess = false;
			}, 5000);
		}, 1000);
	}
</script>

<section id="rsvp" class="py-16 md:py-24 bg-wedding-white">
	<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
		<h2 class="text-4xl md:text-5xl font-serif text-center text-wedding-navy mb-4">RSVP</h2>
		<p class="text-center text-wedding-text-light mb-12">Mohon konfirmasi kehadiran Anda sebelum 15 November 2025</p>

		{#if showSuccess}
			<div class="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
				Terima kasih! RSVP Anda telah diterima.
			</div>
		{/if}

		<form class="space-y-6 bg-white p-8 rounded-lg border-2 border-wedding-silver shadow-lg" onsubmit={handleSubmit}>
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold focus:border-transparent"
					placeholder="Nama Anda"
				/>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold focus:border-transparent"
					placeholder="email@example.com"
				/>
			</div>

			<div>
				<label for="attending" class="block text-sm font-medium text-gray-700 mb-2">Akan Hadir? *</label>
				<select
					id="attending"
					bind:value={attending}
					required
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold focus:border-transparent"
				>
					<option value="">Pilih</option>
					<option value="yes">Ya, saya akan hadir!</option>
					<option value="no">Maaf, saya tidak dapat hadir</option>
					<option value="maybe">Belum yakin</option>
				</select>
			</div>

			<div>
				<label for="guests" class="block text-sm font-medium text-gray-700 mb-2">Jumlah Tamu</label>
				<input
					type="number"
					id="guests"
					bind:value={guests}
					min="1"
					max="10"
					class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold focus:border-transparent"
				/>
			</div>

			<div>
			<label for="message" class="block text-sm font-medium text-gray-700 mb-2">Pesan (Opsional)</label>
			<textarea
				id="message"
				bind:value={message}
				rows="4"
				class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold focus:border-transparent"
				placeholder="Ucapan atau pesan khusus..."
			></textarea>
			</div>

			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full bg-wedding-steel text-white py-3 rounded-lg font-semibold hover:bg-wedding-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
			>
				{isSubmitting ? 'Mengirim...' : 'Kirim RSVP'}
			</button>
		</form>
	</div>
</section>


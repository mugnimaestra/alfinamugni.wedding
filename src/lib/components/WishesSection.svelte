<script lang="ts">
	import { onMount } from 'svelte';

	interface WishRsvp {
		id: number;
		guest_name: string;
		message: string;
		attending: 'yes' | 'no' | null;
		created_at: string;
	}

	interface Counts {
		total: number;
	}

	let showForm = $state(false);
	let wishName = $state('');
	let wishEmail = $state('');
	let wishMessage = $state('');
	let attending = $state<'yes' | 'no'>('yes');
	let wishes = $state<WishRsvp[]>([]);
	let counts = $state<Counts>({ total: 0 });
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	onMount(async () => {
		await fetchWishes();
	});

	async function fetchWishes() {
		try {
			const response = await fetch('/api/wishes-rsvp');
			const data = await response.json();
			wishes = data.wishes || [];
			counts = data.counts || { total: 0 };
		} catch (error) {
			console.error('Error fetching wishes:', error);
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		errorMessage = '';
		successMessage = '';

		if (!wishName.trim() || !wishMessage.trim()) {
			errorMessage = 'Nama dan pesan wajib diisi';
			return;
		}

		if (wishMessage.trim().length < 2) {
			errorMessage = 'Pesan minimal 2 karakter';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/wishes-rsvp', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					guest_name: wishName,
					email: wishEmail || null,
					message: wishMessage,
					attending,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Gagal mengirim ucapan');
			}

			successMessage = data.message || 'Terima kasih atas ucapan dan konfirmasi kehadiran Anda!';
			wishName = '';
			wishEmail = '';
			wishMessage = '';
			attending = 'yes';
			showForm = false;

			// Refresh wishes list
			await fetchWishes();
		} catch (error: any) {
			errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
		} finally {
			isSubmitting = false;
		}
	}

	function formatTimestamp(timestamp: string): string {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 60) {
			return `${diffMins} menit yang lalu`;
		} else if (diffHours < 24) {
			return `${diffHours} jam yang lalu`;
		} else if (diffDays === 1) {
			return '1 hari yang lalu';
		} else {
			return `${diffDays} hari yang lalu`;
		}
	}
</script>

<section
	id="wishes"
	class="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-gradient-to-b from-wedding-white to-wedding-sky"
>
	<div class="max-w-6xl mx-auto w-full">
		<div class="text-center mb-12">
			<h2 class="font-serif text-4xl md:text-6xl mb-6 font-light text-wedding-navy">
				Ucapkan Sesuatu
			</h2>

			<h3 class="text-2xl md:text-3xl mb-8 text-wedding-navy font-medium">
				Berikan Ucapan & Doa Restu
			</h3>

			<!-- Counts -->
			<div class="flex justify-center gap-x-8 gap-y-4 mb-8 flex-wrap">
				<div class="text-center">
					<div class="text-3xl font-bold text-wedding-navy">{counts.total}</div>
					<div class="text-sm text-wedding-navy">Comments</div>
				</div>
			</div>
			<button
				onclick={() => (showForm = !showForm)}
				class="wedding-button bg-wedding-navy text-white px-8 py-3 rounded-full transition-all duration-300 hover:bg-wedding-steel border-2 border-transparent hover:border-wedding-steel"
			>
				{showForm ? 'Tutup Form' : 'Tulis Ucapan'}
			</button>
		</div>

		{#if showForm}
			<form
				class="wedding-card bg-white max-w-2xl mx-auto mb-12 border-2 border-wedding-silver"
				onsubmit={handleSubmit}
			>
				<div class="space-y-4">
					{#if errorMessage}
						<div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
							{errorMessage}
						</div>
					{/if}

					{#if successMessage}
						<div class="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
							{successMessage}
						</div>
					{/if}

					<div>
						<label for="wish-name" class="block text-sm font-medium text-wedding-navy mb-2">
							Nama Anda *
						</label>
						<input
							type="text"
							id="wish-name"
							bind:value={wishName}
							required
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold focus:border-transparent"
							placeholder="Nama atau Nama Keluarga"
						/>
					</div>

					<div>
						<label for="wish-email" class="block text-sm font-medium text-wedding-navy mb-2">
							Email (Opsional)
						</label>
						<input
							type="email"
							id="wish-email"
							bind:value={wishEmail}
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold focus:border-transparent"
							placeholder="email@example.com"
						/>
					</div>

					<div>
						<label for="wish-message" class="block text-sm font-medium text-wedding-navy mb-2">
							Ucapan Anda * <span class="text-xs text-wedding-navy">(minimal 2 karakter)</span>
						</label>
						<textarea
							id="wish-message"
							bind:value={wishMessage}
							required
							minlength="2"
							rows="4"
							class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold focus:border-transparent"
							placeholder="Tulis ucapan selamat Anda di sini..."
						/>
					</div>

					<div>
						<div class="block text-sm font-medium text-wedding-navy mb-2">
							Konfirmasi Kehadiran *
						</div>
						<div class="flex gap-x-4 gap-y-2">
							<label class="flex items-center cursor-pointer">
								<input
									type="radio"
									name="attending"
									value="yes"
									bind:group={attending}
									class="mr-2"
								/>
								<span class="text-wedding-navy">Datang</span>
							</label>
							<label class="flex items-center cursor-pointer">
								<input
									type="radio"
									name="attending"
									value="no"
									bind:group={attending}
									class="mr-2"
								/>
								<span class="text-wedding-navy">Absen</span>
							</label>
						</div>
					</div>

					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full wedding-button bg-wedding-steel text-white py-3 rounded-lg transition-colors hover:bg-wedding-accent disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? 'Mengirim...' : 'Kirim Ucapan'}
					</button>
				</div>
			</form>
		{/if}

		<!-- Wishes Display -->
		<div class="max-w-4xl mx-auto space-y-6">
			{#each wishes as wish (wish.id)}
				<div
					class="wedding-card bg-white transition-all duration-300 hover:shadow-xl border-l-4 border-wedding-steel"
				>
					<div class="flex justify-between items-start mb-3">
						<div class="flex items-center gap-x-3">
							<h3 class="font-semibold text-lg text-wedding-navy">{wish.guest_name}</h3>
							{#if wish.attending === 'yes'}
								<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Hadir</span>
							{:else if wish.attending === 'no'}
								<span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Tidak Hadir</span>
							{/if}
						</div>
						<span class="text-sm text-wedding-text-light">{formatTimestamp(wish.created_at)}</span>
					</div>
					<p class="text-wedding-text-dark leading-relaxed">{wish.message}</p>
				</div>
			{/each}

			{#if wishes.length === 0}
				<div class="text-center text-wedding-navy py-12">
					<p>Belum ada ucapan. Jadilah yang pertama memberikan ucapan!</p>
				</div>
			{/if}
		</div>

		<!-- Closing Text -->
		<div class="mt-12 max-w-3xl mx-auto text-center">
			<p class="text-wedding-text-dark leading-relaxed">
				Merupakan suatu kehormatan dan kebahagiaan bagi kami, apabila Bapak/Ibu/Saudara/i berkenan
				hadir dan memberikan doa restu. Atas kehadiran dan doa restunya, kami mengucapkan terima
				kasih.
			</p>
		</div>
	</div>
</section>

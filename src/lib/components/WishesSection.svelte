<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';

	interface WishRsvp {
		id: number;
		guest_name: string;
		message: string;
		attending: 'yes' | 'no' | null;
		visitor_count?: number;
		created_at: string;
	}

	interface Counts {
		total: number;
	}

	interface Pagination {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	}

	/**
	 * Decodes and sanitizes guest name from URL query parameter
	 */
	function decodeGuestName(rawValue: string | null): string | undefined {
		if (!rawValue) {
			return undefined;
		}

		// Decode URL-encoded characters (handles %20, %2B, etc.)
		let decoded = decodeURIComponent(rawValue);

		// Replace + with spaces
		decoded = decoded.replace(/\+/g, ' ');

		// Trim whitespace and collapse multiple spaces to single space
		decoded = decoded.trim().replace(/\s+/g, ' ');

		// Return undefined if empty after processing
		if (!decoded) {
			return undefined;
		}

		// Validate length (max 100 characters)
		if (decoded.length > 100) {
			decoded = decoded.substring(0, 100).trim();
		}

		return decoded;
	}

	let showForm = $state(false);
	let wishName = $state('');
	let wishMessage = $state('');
	let attending = $state<'yes' | 'no'>('yes');
	let visitorCount = $state(1);
	let wishes = $state<WishRsvp[]>([]);
	let counts = $state<Counts>({ total: 0 });
	let currentPage = $state(1);
	let totalPages = $state(1);
	let isLoading = $state(false);
	let isSubmitting = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	onMount(async () => {
		await fetchWishes(1);
	});

	// Pre-fill wishName from query parameter 'to' if available and field is empty
	$effect(() => {
		const urlParam = $page.url.searchParams.get('to');
		if (urlParam && !wishName) {
			const decodedName = decodeGuestName(urlParam);
			if (decodedName) {
				wishName = decodedName;
			}
		}
	});

	async function fetchWishes(page: number) {
		isLoading = true;
		try {
			const response = await fetch(`/api/wishes-rsvp?page=${page}&limit=10`);
			const data = await response.json();
			wishes = data.wishes || [];
			counts = data.counts || { total: 0 };
			if (data.pagination) {
				currentPage = data.pagination.page;
				totalPages = data.pagination.totalPages;
			}
		} catch (error) {
			console.error('Error fetching wishes:', error);
		} finally {
			isLoading = false;
		}
	}

	async function goToPage(page: number) {
		if (page < 1 || page > totalPages || isLoading) return;
		await fetchWishes(page);
		// Scroll to top of wishes section
		const wishesSection = document.getElementById('wishes');
		if (wishesSection) {
			wishesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

		if (attending === 'yes' && (visitorCount < 1 || visitorCount > 20)) {
			errorMessage = 'Jumlah pengunjung harus antara 1 dan 20';
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
					message: wishMessage,
					attending,
					visitor_count: attending === 'yes' ? visitorCount : null,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Gagal mengirim ucapan');
			}

			successMessage = data.message || 'Terima kasih atas ucapan dan konfirmasi kehadiran Anda!';
			wishName = '';
			wishMessage = '';
			attending = 'yes';
			visitorCount = 1;
			showForm = false;

			// Refresh wishes list - reset to page 1 to show new wish
			await fetchWishes(1);
		} catch (error: any) {
			errorMessage = error.message || 'Terjadi kesalahan. Silakan coba lagi.';
		} finally {
			isSubmitting = false;
		}
	}

	function formatTimestamp(timestamp: string): string {
		// Convert SQLite datetime format (YYYY-MM-DD HH:MM:SS) to ISO format with UTC indicator
		const utcTimestamp = timestamp.replace(' ', 'T') + 'Z';
		const date = new Date(utcTimestamp);
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
				Wishes & RSVP
			</h2>
			<!-- Callout Banner -->
			<div class="max-w-3xl mx-auto mb-8 p-4 bg-gradient-to-r from-wedding-sky/30 to-wedding-steel/20 border-2 border-wedding-steel/40 rounded-lg shadow-sm">
				<p class="text-wedding-navy font-medium text-base md:text-lg">
					Silakan isi formulir berikut untuk mengirimkan ucapan dan mengonfirmasi kehadiran Anda
				</p>
			</div>

			<!-- Mascot -->
			<div class="flex justify-center mb-8">
				<img src="/mascot.png" alt="Wedding Mascot" class="h-64 w-64 object-contain" />
			</div>
			<button
				onclick={() => (showForm = !showForm)}
				class="wedding-button bg-wedding-navy text-white px-8 py-3 rounded-full transition-all duration-300 hover:bg-wedding-steel border-2 border-transparent hover:border-wedding-steel"
			>
				{showForm ? 'Tutup Form' : 'Tulis Ucapan & RSVP'}
			</button>
		</div>

		{#if showForm}
			<form
				transition:fly={{ y: -20, duration: 300 }}
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

					<div class="p-4 bg-wedding-sky/20 border-2 border-wedding-steel/40 rounded-lg">
						<div class="flex items-center gap-x-2 mb-2">
							<svg
								class="w-5 h-5 text-wedding-steel"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<label class="block text-sm font-semibold text-wedding-navy">
								Konfirmasi Kehadiran *
							</label>
						</div>
						<p class="text-xs text-wedding-navy/80 mb-3 italic">
							Mohon konfirmasikan kehadiran Anda sebelum acara
						</p>
						<div class="flex gap-x-6 gap-y-2">
							<label
								class="flex items-center cursor-pointer p-3 rounded-lg transition-all duration-200 {attending ===
								'yes'
									? 'bg-wedding-steel/20 border-2 border-wedding-steel'
									: 'bg-white border-2 border-gray-200 hover:border-wedding-steel/40'}"
							>
								<input
									type="radio"
									name="attending"
									value="yes"
									bind:group={attending}
									class="mr-2 w-4 h-4 text-wedding-steel focus:ring-wedding-steel"
								/>
								<span class="text-wedding-navy font-medium">Datang</span>
							</label>
							<label
								class="flex items-center cursor-pointer p-3 rounded-lg transition-all duration-200 {attending ===
								'no'
									? 'bg-wedding-steel/20 border-2 border-wedding-steel'
									: 'bg-white border-2 border-gray-200 hover:border-wedding-steel/40'}"
							>
								<input
									type="radio"
									name="attending"
									value="no"
									bind:group={attending}
									onchange={() => {
										visitorCount = 1;
									}}
									class="mr-2 w-4 h-4 text-wedding-steel focus:ring-wedding-steel"
								/>
								<span class="text-wedding-navy font-medium">Absen</span>
							</label>
						</div>
					</div>

					{#if attending === 'yes'}
						<div>
							<label for="visitor-count" class="block text-sm font-medium text-wedding-navy mb-2">
								Jumlah Pengunjung *
							</label>
							<input
								type="number"
								id="visitor-count"
								bind:value={visitorCount}
								required
								min="1"
								max="20"
								class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-gold focus:border-wedding-gold focus:border-transparent"
								placeholder="1"
							/>
						</div>
					{/if}

					<button
						type="submit"
						disabled={isSubmitting}
						class="w-full wedding-button bg-wedding-steel text-white py-3 rounded-lg transition-colors hover:bg-wedding-accent disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isSubmitting ? 'Mengirim...' : 'Kirim Ucapan & Konfirmasi'}
					</button>
				</div>
			</form>
		{/if}

		<!-- Wishes Display -->
		<div class="max-w-4xl mx-auto space-y-6">
			{#if isLoading}
				<div class="text-center text-wedding-navy py-12">
					<p>Memuat ucapan...</p>
				</div>
			{:else}
				{#each wishes as wish (wish.id)}
					<div
						class="wedding-card bg-white transition-all duration-300 hover:shadow-xl border-l-4 border-wedding-steel"
					>
						<div class="flex justify-between items-start mb-3">
							<div class="flex items-center gap-x-3">
								<h3 class="font-semibold text-lg text-wedding-navy">{wish.guest_name}</h3>
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
			{/if}
		</div>

		<!-- Pagination Controls -->
		{#if totalPages > 1 && !isLoading}
			<div class="max-w-4xl mx-auto mt-8 flex items-center justify-center gap-x-4 gap-y-2 flex-wrap">
				<button
					onclick={() => goToPage(currentPage - 1)}
					disabled={currentPage === 1 || isLoading}
					class="wedding-button bg-wedding-navy text-white px-6 py-2 rounded-full transition-all duration-300 hover:bg-wedding-steel border-2 border-transparent hover:border-wedding-steel disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-wedding-navy"
				>
					Sebelumnya
				</button>
				<div class="text-wedding-navy font-medium">
					Halaman {currentPage} dari {totalPages}
				</div>
				<button
					onclick={() => goToPage(currentPage + 1)}
					disabled={currentPage === totalPages || isLoading}
					class="wedding-button bg-wedding-navy text-white px-6 py-2 rounded-full transition-all duration-300 hover:bg-wedding-steel border-2 border-transparent hover:border-wedding-steel disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-wedding-navy"
				>
					Selanjutnya
				</button>
			</div>
		{/if}

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

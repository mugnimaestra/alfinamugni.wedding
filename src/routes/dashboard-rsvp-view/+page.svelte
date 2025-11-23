<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	onMount(() => {
		document.body.classList.remove('cover-active');
	});

	interface RSVP {
		id: number;
		guest_name: string;
		email: string | null;
		message: string;
		attending: string | null;
		visitor_count: number | null;
		approved: number;
		created_at: string;
		ip_address: string | null;
		moderated_at: string | null;
		moderated_by: string | null;
	}

	type SortField = 'guest_name' | 'created_at' | 'attending' | null;
	type SortDirection = 'asc' | 'desc';

	let { data }: { data: PageData } = $props();

	let allRSVPs = $state<RSVP[]>(data.rsvps || []);
	let searchQuery = $state('');
	let attendingFilter = $state<string>('all');
	let sortField = $state<SortField>(null);
	let sortDirection = $state<SortDirection>('desc');
	let currentPage = $state(1);
	const itemsPerPage = 50;

	const filteredRSVPs = $derived(() => {
		let filtered = [...allRSVPs];

		// Apply search filter
		if (searchQuery.trim()) {
			const lowerQuery = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(rsvp) =>
					rsvp.guest_name.toLowerCase().includes(lowerQuery) ||
					rsvp.email?.toLowerCase().includes(lowerQuery) ||
					rsvp.message.toLowerCase().includes(lowerQuery)
			);
		}

		// Apply attending filter
		if (attendingFilter !== 'all') {
			filtered = filtered.filter((rsvp) => rsvp.attending === attendingFilter);
		}

		// Apply sorting
		if (sortField) {
			filtered.sort((a, b) => {
				let aVal: string | number | null;
				let bVal: string | number | null;

				switch (sortField) {
					case 'guest_name':
						aVal = a.guest_name.toLowerCase();
						bVal = b.guest_name.toLowerCase();
						break;
					case 'created_at':
						aVal = new Date(a.created_at).getTime();
						bVal = new Date(b.created_at).getTime();
						break;
					case 'attending':
						aVal = a.attending || '';
						bVal = b.attending || '';
						break;
					default:
						return 0;
				}

				if (aVal === null || aVal === undefined) return 1;
				if (bVal === null || bVal === undefined) return -1;

				if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
				if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
				return 0;
			});
		}

		return filtered;
	});

	const paginatedRSVPs = $derived(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filteredRSVPs().slice(start, end);
	});

	const totalPages = $derived(() => Math.ceil(filteredRSVPs().length / itemsPerPage));

	function handleSort(field: SortField) {
		if (sortField === field) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}
		currentPage = 1;
	}

	function clearFilters() {
		searchQuery = '';
		attendingFilter = 'all';
		sortField = null;
		sortDirection = 'desc';
		currentPage = 1;
	}

	function formatDate(dateString: string): string {
		try {
			return new Date(dateString).toLocaleString();
		} catch {
			return dateString;
		}
	}

	function truncateMessage(message: string, maxLength: number = 50): string {
		if (message.length <= maxLength) return message;
		return message.substring(0, maxLength) + '...';
	}

	function exportToCSV() {
		const headers = [
			'Guest Name',
			'Email',
			'Message',
			'Attending',
			'Visitor Count',
			'Created At',
			'IP Address',
			'Approved',
			'Moderated At',
			'Moderated By',
		];

		const rows = filteredRSVPs().map((rsvp) => [
			rsvp.guest_name,
			rsvp.email || '',
			rsvp.message.replace(/"/g, '""'),
			rsvp.attending || '',
			rsvp.visitor_count?.toString() || '',
			rsvp.created_at,
			rsvp.ip_address || '',
			rsvp.approved ? 'Yes' : 'No',
			rsvp.moderated_at || '',
			rsvp.moderated_by || '',
		]);

		const csvContent = [
			headers.join(','),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
		].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute('download', `rsvp-export-${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = 'hidden';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function getAttendingBadgeClass(attending: string | null): string {
		switch (attending) {
			case 'yes':
				return 'bg-green-100 text-green-800';
			case 'no':
				return 'bg-red-100 text-red-800';
			case 'maybe':
				return 'bg-yellow-100 text-yellow-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getAttendingLabel(attending: string | null): string {
		switch (attending) {
			case 'yes':
				return 'Yes';
			case 'no':
				return 'No';
			case 'maybe':
				return 'Maybe';
			default:
				return 'N/A';
		}
	}
</script>

<svelte:head>
	<title>RSVP Dashboard - Admin</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-wedding-cream to-white px-4 py-12">
	<div class="mx-auto max-w-7xl">
		<!-- Header -->
		<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="font-serif text-4xl font-light text-wedding-brown">RSVP Dashboard</h1>
				<p class="mt-2 text-wedding-text-muted">View and manage all RSVP responses</p>
			</div>
			<button
				type="button"
				onclick={exportToCSV}
				class="inline-flex items-center gap-2 rounded-lg bg-wedding-sage px-4 py-2 text-sm font-medium text-wedding-brown transition hover:bg-wedding-sage/80"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					/>
				</svg>
				Export CSV
			</button>
		</div>

		<!-- Statistics Cards -->
		<div class="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
			<div class="rounded-lg border border-wedding-beige bg-white p-6 shadow-sm">
				<div class="text-sm font-medium text-wedding-text-muted">Total RSVPs</div>
				<div class="mt-2 text-3xl font-semibold text-wedding-brown">{data.stats.total}</div>
			</div>
			<div class="rounded-lg border border-wedding-beige bg-white p-6 shadow-sm">
				<div class="text-sm font-medium text-wedding-text-muted">Attending</div>
				<div class="mt-2 text-3xl font-semibold text-green-600">{data.stats.yes}</div>
			</div>
			<div class="rounded-lg border border-wedding-beige bg-white p-6 shadow-sm">
				<div class="text-sm font-medium text-wedding-text-muted">Not Attending</div>
				<div class="mt-2 text-3xl font-semibold text-red-600">{data.stats.no}</div>
			</div>
			<div class="rounded-lg border border-wedding-beige bg-white p-6 shadow-sm">
				<div class="text-sm font-medium text-wedding-text-muted">Maybe</div>
				<div class="mt-2 text-3xl font-semibold text-yellow-600">{data.stats.maybe}</div>
			</div>
			<div class="rounded-lg border border-wedding-beige bg-white p-6 shadow-sm">
				<div class="text-sm font-medium text-wedding-text-muted">Total Visitors</div>
				<div class="mt-2 text-3xl font-semibold text-wedding-brown">{data.stats.totalVisitors}</div>
			</div>
			<div class="rounded-lg border border-wedding-beige bg-white p-6 shadow-sm">
				<div class="text-sm font-medium text-wedding-text-muted">Recent (7 days)</div>
				<div class="mt-2 text-3xl font-semibold text-wedding-brown">{data.stats.recent}</div>
			</div>
		</div>

		<!-- Search & Filter Bar -->
		<div class="mb-6 flex flex-col gap-4 sm:flex-row">
			<div class="relative flex-1">
				<svg
					class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-wedding-text-muted"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search by name, email, or message..."
					class="w-full rounded-lg border border-wedding-beige bg-white py-3 pl-10 pr-4 focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						aria-label="Clear search"
						class="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-wedding-text-muted hover:bg-wedding-cream"
					>
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				{/if}
			</div>
			<select
				bind:value={attendingFilter}
				class="rounded-lg border border-wedding-beige bg-white px-4 py-3 focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
			>
				<option value="all">All Status</option>
				<option value="yes">Attending</option>
				<option value="no">Not Attending</option>
				<option value="maybe">Maybe</option>
			</select>
			{#if searchQuery || attendingFilter !== 'all' || sortField}
				<button
					type="button"
					onclick={clearFilters}
					aria-label="Clear all filters"
					class="rounded-lg border border-wedding-beige bg-white px-4 py-3 text-wedding-brown transition hover:bg-wedding-cream"
				>
					Clear Filters
				</button>
			{/if}
		</div>

		<!-- Data Table -->
		{#if filteredRSVPs().length === 0}
			<div
				class="flex min-h-[400px] items-center justify-center rounded-xl border border-wedding-beige bg-white p-12"
			>
				<div class="text-center">
					<svg
						class="mx-auto h-16 w-16 text-wedding-text-muted"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
					<h3 class="mt-4 font-serif text-xl font-semibold text-wedding-text-primary">
						{searchQuery || attendingFilter !== 'all' ? 'No RSVPs found' : 'No RSVPs yet'}
					</h3>
					<p class="mt-2 text-wedding-text-muted">
						{searchQuery || attendingFilter !== 'all'
							? 'Try adjusting your search or filter criteria'
							: 'RSVP responses will appear here'}
					</p>
				</div>
			</div>
		{:else}
			<div class="overflow-x-auto rounded-xl border border-wedding-beige bg-white shadow-sm">
				<table class="w-full">
					<thead class="bg-wedding-cream">
						<tr>
							<th
								class="cursor-pointer px-6 py-4 text-left text-sm font-semibold text-wedding-brown transition hover:bg-wedding-beige"
								onclick={() => handleSort('guest_name')}
							>
								<div class="flex items-center gap-2">
									Guest Name
									{#if sortField === 'guest_name'}
										<svg
											class="h-4 w-4 {sortDirection === 'asc' ? '' : 'rotate-180'}"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 15l7-7 7 7"
											/>
										</svg>
									{/if}
								</div>
							</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-wedding-brown">Email</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-wedding-brown">Message</th>
							<th
								class="cursor-pointer px-6 py-4 text-left text-sm font-semibold text-wedding-brown transition hover:bg-wedding-beige"
								onclick={() => handleSort('attending')}
							>
								<div class="flex items-center gap-2">
									Status
									{#if sortField === 'attending'}
										<svg
											class="h-4 w-4 {sortDirection === 'asc' ? '' : 'rotate-180'}"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 15l7-7 7 7"
											/>
										</svg>
									{/if}
								</div>
							</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-wedding-brown">Visitors</th>
							<th
								class="cursor-pointer px-6 py-4 text-left text-sm font-semibold text-wedding-brown transition hover:bg-wedding-beige"
								onclick={() => handleSort('created_at')}
							>
								<div class="flex items-center gap-2">
									Created At
									{#if sortField === 'created_at'}
										<svg
											class="h-4 w-4 {sortDirection === 'asc' ? '' : 'rotate-180'}"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 15l7-7 7 7"
											/>
										</svg>
									{/if}
								</div>
							</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-wedding-brown"
								>IP Address</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-wedding-beige">
						{#each paginatedRSVPs() as rsvp (rsvp.id)}
							<tr class="transition hover:bg-wedding-cream/50">
								<td class="px-6 py-4 text-sm font-medium text-wedding-text-primary">
									{rsvp.guest_name}
								</td>
								<td class="px-6 py-4 text-sm text-wedding-text-secondary">{rsvp.email || '-'}</td>
								<td class="px-6 py-4 text-sm text-wedding-text-secondary">
									<span title={rsvp.message}>{truncateMessage(rsvp.message)}</span>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-medium {getAttendingBadgeClass(
											rsvp.attending
										)}"
									>
										{getAttendingLabel(rsvp.attending)}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-wedding-text-secondary">
									{rsvp.attending === 'yes' && rsvp.visitor_count ? rsvp.visitor_count : '-'}
								</td>
								<td class="px-6 py-4 text-sm text-wedding-text-secondary">
									{formatDate(rsvp.created_at)}
								</td>
								<td class="px-6 py-4 text-sm text-wedding-text-muted">{rsvp.ip_address || '-'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Pagination -->
			{#if totalPages() > 1}
				<div class="mt-6 flex items-center justify-between">
					<div class="text-sm text-wedding-text-muted">
						Showing {(currentPage - 1) * itemsPerPage + 1} to
						{Math.min(currentPage * itemsPerPage, filteredRSVPs().length)} of {filteredRSVPs()
							.length}{' '}
						RSVPs
					</div>
					<div class="flex gap-2">
						<button
							type="button"
							onclick={() => (currentPage = Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							class="rounded-lg border border-wedding-beige bg-white px-4 py-2 text-sm font-medium text-wedding-brown transition hover:bg-wedding-cream disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<span class="flex items-center px-4 py-2 text-sm text-wedding-text-secondary">
							Page {currentPage} of {totalPages()}
						</span>
						<button
							type="button"
							onclick={() => (currentPage = Math.min(totalPages(), currentPage + 1))}
							disabled={currentPage === totalPages()}
							class="rounded-lg border border-wedding-beige bg-white px-4 py-2 text-sm font-medium text-wedding-brown transition hover:bg-wedding-cream disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Next
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

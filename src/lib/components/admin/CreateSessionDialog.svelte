<script lang="ts">
	interface Props {
		isOpen: boolean;
		onClose: () => void;
		onCreate: (data: {
			title: string;
			description: string;
			prefix: string;
			is_active: boolean;
		}) => Promise<void>;
	}

	let { isOpen, onClose, onCreate }: Props = $props();
	let title = $state('');
	let description = $state('');
	let prefix = $state('wdng');
	let isActive = $state(true);
	let isCreating = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!title.trim()) {
			error = 'Title is required';
			return;
		}

		isCreating = true;
		try {
			await onCreate({
				title: title.trim(),
				description: description.trim(),
				prefix: prefix.trim() || 'wdng',
				is_active: isActive
			});
			resetForm();
			onClose();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create session';
		} finally {
			isCreating = false;
		}
	}

	function resetForm() {
		title = '';
		description = '';
		prefix = 'wdng';
		isActive = true;
		error = '';
	}

	function handleClose() {
		if (!isCreating) {
			resetForm();
			onClose();
		}
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center">
		<div class="absolute inset-0 bg-black/50" onclick={handleClose}></div>

		<div
			class="relative z-10 w-full max-w-md rounded-xl border border-wedding-beige bg-white p-6 shadow-2xl"
		>
			<div class="mb-6 flex items-center justify-between">
				<h2 class="font-serif text-2xl font-semibold text-wedding-text-primary">
					Create New Session
				</h2>
				<button
					type="button"
					onclick={handleClose}
					disabled={isCreating}
					class="rounded-lg p-1 text-wedding-text-muted transition hover:bg-wedding-cream disabled:opacity-50"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<form onsubmit={handleSubmit} class="space-y-4">
				<div>
					<label for="title" class="mb-1 block text-sm font-medium text-wedding-text-primary">
						Title <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="title"
						bind:value={title}
						required
						placeholder="e.g., Wedding Day - Nov 29, 2025"
						class="w-full rounded-lg border border-wedding-beige px-3 py-2 text-sm focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
					/>
				</div>

				<div>
					<label
						for="description"
						class="mb-1 block text-sm font-medium text-wedding-text-primary"
					>
						Description
					</label>
					<textarea
						id="description"
						bind:value={description}
						rows="3"
						placeholder="Share your moments from our special day!"
						class="w-full rounded-lg border border-wedding-beige px-3 py-2 text-sm focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
					></textarea>
				</div>

				<div>
					<label for="prefix" class="mb-1 block text-sm font-medium text-wedding-text-primary">
						Session ID Prefix
					</label>
					<input
						type="text"
						id="prefix"
						bind:value={prefix}
						placeholder="wdng"
						maxlength="10"
						class="w-full rounded-lg border border-wedding-beige px-3 py-2 text-sm font-mono focus:border-wedding-sage focus:outline-none focus:ring-2 focus:ring-wedding-sage/20"
					/>
					<p class="mt-1 text-xs text-wedding-text-muted">
						Will generate: {prefix || 'wdng'}-xxxxxxxx
					</p>
				</div>

				<div class="flex items-center gap-2">
					<input
						type="checkbox"
						id="isActive"
						bind:checked={isActive}
						class="h-4 w-4 rounded border-wedding-beige text-wedding-sage focus:ring-2 focus:ring-wedding-sage/20"
					/>
					<label for="isActive" class="text-sm font-medium text-wedding-text-primary">
						Active (allow uploads immediately)
					</label>
				</div>

				{#if error}
					<div
						class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
					>
						{error}
					</div>
				{/if}

				<div class="flex gap-3">
					<button
						type="button"
						onclick={handleClose}
						disabled={isCreating}
						class="flex-1 rounded-lg border border-wedding-beige bg-white px-4 py-2 text-sm font-medium text-wedding-text-primary transition hover:bg-wedding-cream disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isCreating}
						class="flex-1 rounded-lg bg-wedding-sage px-4 py-2 text-sm font-medium text-white transition hover:bg-wedding-sage/90 disabled:opacity-50"
					>
						{#if isCreating}
							<span class="flex items-center justify-center gap-2">
								<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									/>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								Creating...
							</span>
						{:else}
							Create Session
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

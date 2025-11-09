<script lang="ts">
	interface Photo {
		id: string | number;
		title: string;
		description?: string;
		uploader_name: string;
		upload_date: string;
		thumbnail: string;
		session_id?: string;
	}

	interface Props {
		photo: Photo;
		isSelected: boolean;
		onToggleSelect: (id: string | number) => void;
		onDelete: (id: string | number) => void;
	}

	let { photo, isSelected, onToggleSelect, onDelete }: Props = $props();
</script>

<div
	class="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md {isSelected
		? 'border-wedding-sage ring-2 ring-wedding-sage/20'
		: 'border-wedding-beige'}"
>
	<div class="absolute left-2 top-2 z-10">
		<label class="flex cursor-pointer items-center">
			<input
				type="checkbox"
				checked={isSelected}
				onchange={() => onToggleSelect(photo.id)}
				class="h-5 w-5 rounded border-wedding-beige text-wedding-sage focus:ring-2 focus:ring-wedding-sage/20"
			/>
		</label>
	</div>

	<div class="aspect-square overflow-hidden">
		<img
			src={photo.thumbnail}
			alt={photo.title}
			class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
		/>
	</div>

	<div class="p-3">
		<h3 class="line-clamp-1 text-sm font-semibold text-wedding-text-primary">
			{photo.title}
		</h3>
		{#if photo.description}
			<p class="mt-1 line-clamp-2 text-xs text-wedding-text-muted">
				{photo.description}
			</p>
		{/if}
		<div class="mt-2 flex items-center justify-between">
			<div class="text-xs text-wedding-text-muted">
				<p class="font-medium">{photo.uploader_name}</p>
				<p>{new Date(photo.upload_date).toLocaleDateString()}</p>
			</div>
			<button
				type="button"
				onclick={() => onDelete(photo.id)}
				class="rounded p-1.5 text-red-500 transition hover:bg-red-50"
				title="Delete photo"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
					/>
				</svg>
			</button>
		</div>
	</div>
</div>

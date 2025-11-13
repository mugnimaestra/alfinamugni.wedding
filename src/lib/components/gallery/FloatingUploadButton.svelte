<script lang="ts">
	import { Plus, Image } from 'lucide-svelte';

	interface Props {
		onclick: () => void;
	}

	let { onclick }: Props = $props();
</script>

<button
	type="button"
	onclick={onclick}
	class="fixed bottom-8 left-1/2 z-40 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-wedding-sage shadow-2xl backdrop-blur-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-wedding-sage focus:ring-offset-4"
	aria-label="Upload photos or videos"
>
	<Plus class="h-8 w-8 text-white" />

	<span
		class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-wedding-accent text-xs font-bold text-white"
	>
		<Image class="h-3 w-3 text-white" />
	</span>
</button>

<style>
	button {
		animation: pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse-subtle {
		0%,
		100% {
			box-shadow:
				0 0 0 0 rgba(93, 136, 187, 0.4),
				0 10px 15px -3px rgba(0, 0, 0, 0.1),
				0 4px 6px -2px rgba(0, 0, 0, 0.05);
		}
		50% {
			box-shadow:
				0 0 0 8px rgba(93, 136, 187, 0),
				0 10px 15px -3px rgba(0, 0, 0, 0.1),
				0 4px 6px -2px rgba(0, 0, 0, 0.05);
		}
	}

	@media (hover: hover) {
		button:hover {
			animation: none;
		}
	}
</style>

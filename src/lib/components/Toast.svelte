<script lang="ts">
	import { X } from 'lucide-svelte';

	interface Props {
		message: string;
		show: boolean;
		onDismiss: () => void;
		duration?: number;
	}

	let { message, show, onDismiss, duration = 4000 }: Props = $props();

	let timeoutId: ReturnType<typeof setTimeout> | null = $state(null);

	$effect(() => {
		if (show) {
			// Auto-dismiss after duration
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			timeoutId = setTimeout(() => {
				onDismiss();
			}, duration);
		}

		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});

	function handleClose() {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		onDismiss();
	}
</script>

{#if show}
	<div
		class="toast-container fixed bottom-8 right-8 z-[9997] max-w-sm animate-slideInRight"
		role="alert"
		aria-live="polite"
	>
		<div
			class="toast-content bg-gradient-to-br from-white to-green-50 rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.2)] p-4 flex items-start gap-x-3 border-l-4 border-green-500"
		>
			<div class="toast-message flex-1 text-sm text-wedding-navy font-medium">
				{message}
			</div>
		<button
			onclick={handleClose}
			class="toast-close flex-shrink-0 text-wedding-navy/60 hover:text-wedding-navy transition-colors duration-200"
			aria-label="Dismiss notification"
		>
				<X class="w-4 h-4" />
			</button>
		</div>
	</div>
{/if}

<style>
	@keyframes slideInRight {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.animate-slideInRight {
		animation: slideInRight 0.3s ease-out;
	}
</style>


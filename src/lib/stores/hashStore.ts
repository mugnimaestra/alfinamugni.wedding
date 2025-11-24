import { writable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Reactive store that tracks the current hash value from window.location.hash
 * Updates automatically when hash changes (including browser back/forward)
 */
function createHashStore() {
	const { subscribe, set } = writable<string>('');

	// Initialize with current hash if in browser
	if (browser) {
		set(window.location.hash);

		// Listen to hashchange events (back button, forward button, manual hash changes)
		const handleHashChange = () => {
			set(window.location.hash);
		};

		window.addEventListener('hashchange', handleHashChange);

		// Return unsubscribe function to clean up listener
		return {
			subscribe,
			// Cleanup function
			destroy: () => {
				if (browser) {
					window.removeEventListener('hashchange', handleHashChange);
				}
			}
		};
	}

	return {
		subscribe,
		destroy: () => {
			// No-op for SSR
		}
	};
}

export const hashStore = createHashStore();


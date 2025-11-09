import { writable } from 'svelte/store';

export interface AudioState {
	shouldPlay: boolean;
	isPlaying: boolean;
	showAutoplayBlockedToast: boolean;
}

function createAudioStore() {
	const { subscribe, set, update } = writable<AudioState>({
		shouldPlay: false,
		isPlaying: false,
		showAutoplayBlockedToast: false
	});

	return {
		subscribe,
		/**
		 * Trigger audio to start playing (called when invitation is opened)
		 */
		triggerPlay: () =>
			update((state) => ({
				...state,
				shouldPlay: true
			})),
		/**
		 * Update playing state (called by AudioPlayer)
		 */
		setPlaying: (isPlaying: boolean) =>
			update((state) => ({
				...state,
				isPlaying
			})),
		/**
		 * Show toast when autoplay is blocked
		 */
		showAutoplayBlockedToast: () =>
			update((state) => ({
				...state,
				showAutoplayBlockedToast: true
			})),
		/**
		 * Hide the autoplay blocked toast
		 */
		hideAutoplayBlockedToast: () =>
			update((state) => ({
				...state,
				showAutoplayBlockedToast: false
			})),
		/**
		 * Reset shouldPlay flag (called after autoplay succeeds)
		 */
		resetShouldPlay: () =>
			update((state) => ({
				...state,
				shouldPlay: false
			})),
		/**
		 * Reset the store
		 */
		reset: () =>
			set({
				shouldPlay: false,
				isPlaying: false,
				showAutoplayBlockedToast: false
			})
	};
}

export const audioStore = createAudioStore();

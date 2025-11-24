import { browser } from '$app/environment';
import { hashStore } from '$lib/stores/hashStore';

const HASH_PREFIX = '#media-';

/**
 * Extract media ID from hash string (e.g., "#media-123" -> 123)
 * Returns null if hash doesn't match the expected format
 */
export function parseMediaHash(hash: string): number | null {
	if (!hash || !hash.startsWith(HASH_PREFIX)) {
		return null;
	}

	const idStr = hash.slice(HASH_PREFIX.length);
	const id = parseInt(idStr, 10);

	// Check if parsing was successful and ID is valid
	if (isNaN(id) || id <= 0) {
		return null;
	}

	return id;
}

/**
 * Get current media ID from window hash
 * Returns null if no valid media hash exists
 */
export function getCurrentMediaId(): number | null {
	if (!browser) return null;
	return parseMediaHash(window.location.hash);
}

/**
 * Open media modal by setting hash and adding to history
 * This creates a history entry so back button will work
 */
export function openMediaModal(id: number): void {
	if (!browser) return;

	const hash = `${HASH_PREFIX}${id}`;
	window.location.assign(hash);
}

/**
 * Update media hash (for slide navigation)
 * @param id - Media ID to set
 * @param replace - If true, use replaceState (no history entry). If false, use assign (adds history entry)
 */
export function updateMediaHash(id: number, replace: boolean = true): void {
	if (!browser) return;

	const hash = `${HASH_PREFIX}${id}`;

	if (replace) {
		// Update hash without adding to history (for slide navigation)
		window.history.replaceState(null, '', hash);
		// Manually trigger hashchange since replaceState doesn't fire it
		window.dispatchEvent(new HashChangeEvent('hashchange'));
	} else {
		// Add to history (for initial open)
		window.location.assign(hash);
	}
}

/**
 * Close media modal by removing hash via history.back()
 * This provides natural back button behavior
 */
export function closeMediaModal(): void {
	if (!browser) return;

	// Check if we have a media hash
	const currentHash = window.location.hash;
	if (currentHash.startsWith(HASH_PREFIX)) {
		// Use history.back() to remove hash naturally
		window.history.back();
	}
}

/**
 * Remove hash silently (for invalid/deleted media)
 * Uses replaceState to remove hash without history entry
 */
export function removeMediaHash(): void {
	if (!browser) return;

	const currentHash = window.location.hash;
	if (currentHash.startsWith(HASH_PREFIX)) {
		window.history.replaceState(null, '', window.location.pathname + window.location.search);
		// Manually trigger hashchange
		window.dispatchEvent(new HashChangeEvent('hashchange'));
	}
}


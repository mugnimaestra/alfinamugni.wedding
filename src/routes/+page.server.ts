import type { PageServerLoad } from './$types';

/**
 * Decodes and sanitizes guest name from URL query parameter
 */
function decodeGuestName(rawValue: string | null): string | undefined {
	if (!rawValue) {
		return undefined;
	}

	// Decode URL-encoded characters (handles %20, %2B, etc.)
	let decoded = decodeURIComponent(rawValue);

	// Replace + with spaces (URLSearchParams already does this, but be explicit)
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

export const load: PageServerLoad = async ({ url }) => {
	const guestNameParam = url.searchParams.get('to');
	const guestName = decodeGuestName(guestNameParam);

	return {
		guestName
	};
};


/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB", "150 KB", "1.2 GB")
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 B';
	if (bytes < 1024) return `${bytes} B`;

	const kb = bytes / 1024;
	if (kb < 1024) return `${kb.toFixed(2)} KB`;

	const mb = kb / 1024;
	if (mb < 1024) return `${mb.toFixed(2)} MB`;

	const gb = mb / 1024;
	return `${gb.toFixed(2)} GB`;
}


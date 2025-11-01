import { nanoid } from 'nanoid';
import QRCode from 'qrcode';

/**
 * Generate a unique session ID with a prefix
 * Format: {prefix}-{nanoid(8)}
 * Examples:
 *   wdng-a7b3c4d5 (wedding)
 *   test-x1y2z3a4 (test)
 *   recv-e8f9g0h1 (reception)
 */
export function generateSessionId(prefix = 'wdng'): string {
  const id = nanoid(8);
  return `${prefix}-${id}`;
}

/**
 * Generate QR code data URL for a session
 * @param url Full URL to encode (e.g., https://alfinamugni.wedding/g/wdng-a7b3c4d5)
 * @returns Data URL for QR code image
 */
export async function generateQRCode(url: string): Promise<string> {
  return await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: {
      dark: '#4d3326', // wedding-brown
      light: '#faf7f5', // wedding-cream
    },
  });
}

/**
 * Validate session ID format
 * Must be: prefix-alphanumeric (e.g., wdng-a7b3c4d5)
 */
export function isValidSessionId(sessionId: string): boolean {
  const pattern = /^[a-z]{4}-[a-z0-9]{8}$/;
  return pattern.test(sessionId);
}

/**
 * Get session URL for a given session ID
 * @param sessionId Session ID (e.g., wdng-a7b3c4d5)
 * @param baseUrl Base URL (e.g., https://alfinamugni.wedding)
 * @returns Full session URL
 */
export function getSessionUrl(sessionId: string, baseUrl: string): string {
  return `${baseUrl}/g/${sessionId}`;
}

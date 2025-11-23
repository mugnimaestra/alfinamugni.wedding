export function getDeviceInfo(): string {
	if (typeof navigator === 'undefined') return 'Guest Device';

	const ua = navigator.userAgent;

	if (/iPhone/i.test(ua)) return 'iPhone';
	if (/iPad/i.test(ua)) return 'iPad';

	if (/Android/i.test(ua)) {
		if (/Samsung/i.test(ua)) return 'Samsung Phone';
		if (/Xiaomi|Redmi/i.test(ua)) return 'Xiaomi Phone';
		if (/OPPO/i.test(ua)) return 'OPPO Phone';
		if (/Vivo/i.test(ua)) return 'Vivo Phone';
		return 'Android Phone';
	}

	if (/Windows/i.test(ua)) return 'Windows PC';
	if (/Mac/i.test(ua)) return 'Mac';
	if (/Linux/i.test(ua)) return 'Linux PC';

	return 'Guest Device';
}

export function generateTitle(filename: string): string {
	return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
}

interface NetworkInformation extends EventTarget {
	effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
	downlink?: number;
	rtt?: number;
	saveData?: boolean;
	onchange?: (event: Event) => void;
}

interface NavigatorWithConnection extends Navigator {
	connection?: NetworkInformation;
}

export function getNetworkInfo(): string {
	if (typeof navigator === 'undefined') {
		return 'Unknown';
	}

	const nav = navigator as NavigatorWithConnection;
	if (!nav.connection) return 'Unknown';

	const connection = nav.connection;
	const effectiveType = connection.effectiveType || 'Unknown';
	const downlink = connection.downlink ? `${connection.downlink}Mbps` : '';

	return downlink ? `${effectiveType} (${downlink})` : effectiveType;
}

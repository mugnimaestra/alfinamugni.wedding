import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	}).format(date);
}

export function generateId(): string {
	return crypto.randomUUID();
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency,
	}).format(amount);
}

export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function truncate(str: string, length: number): string {
	if (str.length <= length) return str;
	return str.slice(0, length) + '...';
}

export function calculateDaysUntil(date: Date): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const targetDate = new Date(date);
	targetDate.setHours(0, 0, 0, 0);
	const diff = targetDate.getTime() - today.getTime();
	return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatCountdown(days: number): string {
	if (days < 0) return 'The wedding has passed!';
	if (days === 0) return 'Today is the day!';
	if (days === 1) return '1 day to go!';
	return `${days} days to go!`;
}

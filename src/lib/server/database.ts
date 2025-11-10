import { error } from '@sveltejs/kit';
import type { D1Database } from '@cloudflare/workers-types';
import type { Platform } from '@sveltejs/kit';

export interface Database {
	exec(sql: string): Promise<{ success: boolean }>;
	prepare(sql: string): D1PreparedStatement;
}

export interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	first<T = unknown>(column?: string): Promise<T | undefined>;
	all<T = unknown>(): Promise<{ results: T[] }>;
	run(): Promise<{ success: boolean }>;
}

/**
 * Creates a simple database wrapper for D1
 * Usage in routes/+server.ts:
 *
 * export async function POST({ platform }) {
 *   const db = platform?.env.DB;
 *   if (!db) throw error(500, 'Database not configured');
 *
 *   const user = await db.prepare(
 *     'INSERT INTO users (name, email) VALUES (?, ?)'
 *   ).bind('John', 'john@example.com').run();
 * }
 */

export interface DatabaseConfig {
	db: D1Database;
}

export function initializeDatabase(db: D1Database) {
	return {
		prepare: (sql: string) => db.prepare(sql),
		exec: (sql: string) => db.exec(sql),
	};
}

/**
 * Helper to run migrations
 */
export async function runMigrations(_db: D1Database): Promise<void> {
	try {
		// Migration queries would go here
		// This is a placeholder for actual migration execution
		console.log('Migrations would run here');
	} catch (error) {
		console.error('Migration error:', error);
		throw error;
	}
}

/**
 * Get database instance from platform
 * Validates that platform and database are configured
 * @param platform - SvelteKit platform object from RequestHandler
 * @returns D1Database instance
 * @throws Error if database is not configured
 */
export function getDatabase(platform: Platform | undefined): D1Database {
	if (!platform?.env.DB) {
		throw error(500, 'Database not configured');
	}
	return platform.env.DB;
}

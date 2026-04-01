/**
 * services/queryCache.ts
 *
 * Simple in-memory cache for Firestore query results.
 * Avoids re-fetching when the user rapidly switches dashboard filters.
 * Cache entries expire after CACHE_TTL_MS milliseconds.
 */

const CACHE_TTL_MS = 30_000; // 30 seconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

/** Get a cached value if it exists and hasn't expired. */
export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/** Store a value in the cache. */
export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/** Invalidate all cached entries (e.g. after logging a new activity). */
export function clearCache(): void {
  cache.clear();
}

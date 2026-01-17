/**
 * In-memory caching utility for Phase 1
 * MVP: Simple in-memory cache with TTL
 * Production: Replace with Redis or Upstash
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Get data from cache if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = (now - entry.timestamp) / 1000; // seconds

    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Clear specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const cache = new Cache();

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  QUOTE: parseInt(process.env.CACHE_TTL_QUOTE || '15', 10),
  FUNDAMENTALS: parseInt(process.env.CACHE_TTL_FUNDAMENTALS || '3600', 10),
  HISTORICAL: parseInt(process.env.CACHE_TTL_HISTORICAL || '86400', 10),
} as const;

/**
 * Wrapper function for cached API calls
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch data
  const data = await fn();
  cache.set(key, data, ttl);
  return data;
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize = 100 // Maximum number of entries

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    // Clean up expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let expired = 0
    let active = 0

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++
      } else {
        active++
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize,
    }
  }
}

export const cache = new MemoryCache()

// Cache wrapper for async functions
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttlMs: number = 5 * 60 * 1000,
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args)

    // Try to get from cache first
    const cached = cache.get<R>(key)
    if (cached !== null) {
      console.log(`[Cache] Hit for key: ${key}`)
      return cached
    }

    // Execute function and cache result
    console.log(`[Cache] Miss for key: ${key}`)
    try {
      const result = await fn(...args)
      cache.set(key, result, ttlMs)
      return result
    } catch (error) {
      console.error(`[Cache] Error for key ${key}:`, error)
      throw error
    }
  }
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear()
    console.log("[Cache] Cleared all cache entries")
    return
  }

  const regex = new RegExp(pattern)
  const keysToDelete: string[] = []

  // We need to access the private cache map, so we'll add a method to the class
  for (const [key] of (cache as any).cache.entries()) {
    if (regex.test(key)) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach((key) => cache.delete(key))
  console.log(`[Cache] Invalidated ${keysToDelete.length} entries matching pattern: ${pattern}`)
}

// Specific cache configurations
export const cacheConfigs = {
  projects: 2 * 60 * 1000, // 2 minutes
  projectSections: 5 * 60 * 1000, // 5 minutes
  userProfile: 10 * 60 * 1000, // 10 minutes
  fileValidation: 30 * 60 * 1000, // 30 minutes
}

export async function warmCache() {
  console.log("[Cache] Starting cache warming...")

  // This would be called on app startup to pre-populate critical cache entries
  // Implementation depends on specific use cases

  console.log("[Cache] Cache warming completed")
}

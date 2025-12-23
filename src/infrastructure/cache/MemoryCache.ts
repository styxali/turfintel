import { ICacheManager, CacheStats } from '../../domain/interfaces/ICacheManager';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class MemoryCache implements ICacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private hits = 0;
  private misses = 0;

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.data as T;
  }

  async set<T>(key: string, value: T, ttlMinutes: number): Promise<void> {
    const ttl = ttlMinutes * 60 * 1000;
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache.entries()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  async getStats(): Promise<CacheStats> {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

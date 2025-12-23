"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCache = void 0;
class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.hits = 0;
        this.misses = 0;
    }
    async get(key) {
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
        return entry.data;
    }
    async set(key, value, ttlMinutes) {
        const ttl = ttlMinutes * 60 * 1000;
        this.cache.set(key, {
            data: value,
            timestamp: Date.now(),
            ttl
        });
    }
    async delete(key) {
        this.cache.delete(key);
    }
    async clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    async invalidatePattern(pattern) {
        const keysToDelete = [];
        for (const [key] of this.cache.entries()) {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }
    async getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? this.hits / total : 0
        };
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
    }
}
exports.MemoryCache = MemoryCache;
//# sourceMappingURL=MemoryCache.js.map
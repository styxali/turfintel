export interface ICacheManager {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlMinutes: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
    getStats(): Promise<CacheStats>;
}
export interface CacheStats {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
}
//# sourceMappingURL=ICacheManager.d.ts.map
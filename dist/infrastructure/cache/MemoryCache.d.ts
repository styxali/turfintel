import { ICacheManager, CacheStats } from '../../domain/interfaces/ICacheManager';
export declare class MemoryCache implements ICacheManager {
    private cache;
    private hits;
    private misses;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlMinutes: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    invalidatePattern(pattern: string): Promise<void>;
    getStats(): Promise<CacheStats>;
    cleanup(): void;
}
//# sourceMappingURL=MemoryCache.d.ts.map
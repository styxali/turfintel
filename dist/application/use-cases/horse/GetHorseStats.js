"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHorseStatsUseCase = void 0;
class GetHorseStatsUseCase {
    constructor(equidiaService, cacheManager, horseRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.horseRepository = horseRepository;
    }
    async execute(horseSlug) {
        const cacheKey = `horse:stats:${horseSlug}`;
        // Try cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        // Try database second
        const hasStats = await this.horseRepository.hasStats(horseSlug);
        if (hasStats) {
            const dbHorse = await this.horseRepository.findBySlug(horseSlug);
            if (dbHorse?.stats) {
                const dbStats = dbHorse.stats;
                await this.cacheManager.set(cacheKey, dbStats, 45);
                return dbStats;
            }
        }
        // Fetch from API
        const stats = await this.equidiaService.getHorseStats(horseSlug);
        // Save to database (async, don't wait)
        this.horseRepository.saveStats(horseSlug, stats).catch(err => {
            console.error('[USE CASE] Failed to save horse stats:', err.message);
        });
        // Cache the result
        await this.cacheManager.set(cacheKey, stats, 45);
        return stats;
    }
}
exports.GetHorseStatsUseCase = GetHorseStatsUseCase;
//# sourceMappingURL=GetHorseStats.js.map
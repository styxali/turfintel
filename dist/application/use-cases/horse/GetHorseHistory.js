"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHorseHistoryUseCase = void 0;
class GetHorseHistoryUseCase {
    constructor(equidiaService, cacheManager, horseRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.horseRepository = horseRepository;
    }
    async execute(horseSlug, options) {
        const cacheKey = `horse:history:${horseSlug}:${JSON.stringify(options || {})}`;
        // Try cache first (45 minutes TTL)
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        // Try database second
        const hasHistory = await this.horseRepository.hasHistory(horseSlug);
        if (hasHistory) {
            const dbHorse = await this.horseRepository.findBySlug(horseSlug);
            if (dbHorse?.history) {
                const dbHistory = dbHorse.history;
                await this.cacheManager.set(cacheKey, dbHistory, 45);
                return dbHistory;
            }
        }
        // Fetch from API
        const history = await this.equidiaService.getHorseHistory(horseSlug, options);
        // Save to database (async, don't wait)
        this.horseRepository.saveHistory(horseSlug, history).catch(err => {
            console.error('[USE CASE] Failed to save horse history:', err.message);
        });
        // Cache the result
        await this.cacheManager.set(cacheKey, history, 45);
        return history;
    }
}
exports.GetHorseHistoryUseCase = GetHorseHistoryUseCase;
//# sourceMappingURL=GetHorseHistory.js.map
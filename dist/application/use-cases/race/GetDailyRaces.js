"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDailyRacesUseCase = void 0;
class GetDailyRacesUseCase {
    constructor(equidiaService, cacheManager) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
    }
    async execute(date) {
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
        }
        const cacheKey = `daily:races:${date}`;
        // Try cache first (15 minutes TTL for daily data)
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        // Fetch from API
        const dailyRaces = await this.equidiaService.getDailyReunions(date);
        // Cache the result
        await this.cacheManager.set(cacheKey, dailyRaces, 15);
        return dailyRaces;
    }
}
exports.GetDailyRacesUseCase = GetDailyRacesUseCase;
//# sourceMappingURL=GetDailyRaces.js.map
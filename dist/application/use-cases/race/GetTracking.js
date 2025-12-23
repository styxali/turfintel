"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTrackingUseCase = void 0;
class GetTrackingUseCase {
    constructor(equidiaService, cacheManager, raceRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.raceRepository = raceRepository;
    }
    async execute(params) {
        const cacheKey = `race:tracking:${params.toGuid()}`;
        const guid = params.toGuid();
        // Try cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        // Try database second
        const hasTracking = await this.raceRepository.hasTracking(guid);
        if (hasTracking) {
            const dbRace = await this.raceRepository.findByGuid(guid);
            if (dbRace?.tracking) {
                const dbTracking = dbRace.tracking;
                await this.cacheManager.set(cacheKey, dbTracking, 60);
                return dbTracking;
            }
        }
        // Fetch from API
        const tracking = await this.equidiaService.getTracking(params);
        // Save to database (async, don't wait)
        this.raceRepository.saveTracking(guid, tracking).catch(err => {
            console.error('[USE CASE] Failed to save tracking:', err.message);
        });
        // Cache longer (1 hour)
        await this.cacheManager.set(cacheKey, tracking, 60);
        return tracking;
    }
}
exports.GetTrackingUseCase = GetTrackingUseCase;
//# sourceMappingURL=GetTracking.js.map
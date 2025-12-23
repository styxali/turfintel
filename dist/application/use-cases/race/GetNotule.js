"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNotuleUseCase = void 0;
class GetNotuleUseCase {
    constructor(equidiaService, cacheManager, raceRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.raceRepository = raceRepository;
    }
    async execute(params) {
        const cacheKey = `race:notule:${params.toGuid()}`;
        const guid = params.toGuid();
        // Try cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        // Try database second
        const dbRace = await this.raceRepository.findByGuid(guid);
        if (dbRace?.notule) {
            const dbNotule = dbRace.notule;
            await this.cacheManager.set(cacheKey, dbNotule, 30);
            return dbNotule;
        }
        // Fetch from API
        const notule = await this.equidiaService.getNotule(params);
        // Save to database (async, don't wait)
        this.raceRepository.saveNotule(guid, notule).catch(err => {
            console.error('[USE CASE] Failed to save notule:', err.message);
        });
        // Cache the result
        await this.cacheManager.set(cacheKey, notule, 30);
        return notule;
    }
}
exports.GetNotuleUseCase = GetNotuleUseCase;
//# sourceMappingURL=GetNotule.js.map
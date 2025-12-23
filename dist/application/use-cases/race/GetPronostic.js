"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPronosticUseCase = void 0;
class GetPronosticUseCase {
    constructor(equidiaService, cacheManager, raceRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.raceRepository = raceRepository;
    }
    async execute(params) {
        const cacheKey = `race:pronostic:${params.toGuid()}`;
        const guid = params.toGuid();
        // Try cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        // Try database second
        const hasPronostic = await this.raceRepository.hasPronostic(guid);
        if (hasPronostic) {
            const dbRace = await this.raceRepository.findByGuid(guid);
            if (dbRace?.pronostic) {
                const dbPronostic = dbRace.pronostic;
                await this.cacheManager.set(cacheKey, dbPronostic, 30);
                return dbPronostic;
            }
        }
        // Fetch from API
        const pronostic = await this.equidiaService.getPronostic(params);
        // Save to database (async, don't wait)
        this.raceRepository.savePronostic(guid, pronostic).catch(err => {
            console.error('[USE CASE] Failed to save pronostic:', err.message);
        });
        // Cache the result
        await this.cacheManager.set(cacheKey, pronostic, 30);
        return pronostic;
    }
}
exports.GetPronosticUseCase = GetPronosticUseCase;
//# sourceMappingURL=GetPronostic.js.map
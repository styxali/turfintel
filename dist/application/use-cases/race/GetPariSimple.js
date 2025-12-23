"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPariSimpleUseCase = void 0;
class GetPariSimpleUseCase {
    constructor(equidiaService, cacheManager, raceRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.raceRepository = raceRepository;
    }
    async execute(params) {
        const cacheKey = `race:pari-simple:${params.toGuid()}`;
        const guid = params.toGuid();
        // Try cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        // Try database second
        const dbRace = await this.raceRepository.findByGuid(guid);
        if (dbRace?.pariSimple) {
            const dbPariSimple = dbRace.pariSimple;
            await this.cacheManager.set(cacheKey, dbPariSimple, 5);
            return dbPariSimple;
        }
        // Fetch from API
        const pariSimple = await this.equidiaService.getPariSimple(params);
        // Save to database (async, don't wait)
        this.raceRepository.savePariSimple(guid, pariSimple).catch(err => {
            console.error('[USE CASE] Failed to save pari simple:', err.message);
        });
        // Cache for 5 minutes (dynamic data)
        await this.cacheManager.set(cacheKey, pariSimple, 5);
        return pariSimple;
    }
}
exports.GetPariSimpleUseCase = GetPariSimpleUseCase;
//# sourceMappingURL=GetPariSimple.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReferencesUseCase = void 0;
class GetReferencesUseCase {
    constructor(equidiaService, cacheManager, raceRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.raceRepository = raceRepository;
    }
    async execute(params) {
        const cacheKey = `race:references:${params.toGuid()}`;
        const guid = params.toGuid();
        // Try cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        // Try database second
        const dbRace = await this.raceRepository.findByGuid(guid);
        if (dbRace?.references) {
            const dbReferences = dbRace.references;
            await this.cacheManager.set(cacheKey, dbReferences, 60);
            return dbReferences;
        }
        // Fetch from API
        const references = await this.equidiaService.getReferences(params);
        // Save to database (async, don't wait)
        this.raceRepository.saveReferences(guid, references).catch(err => {
            console.error('[USE CASE] Failed to save references:', err.message);
        });
        // Cache longer (1 hour)
        await this.cacheManager.set(cacheKey, references, 60);
        return references;
    }
}
exports.GetReferencesUseCase = GetReferencesUseCase;
//# sourceMappingURL=GetReferences.js.map
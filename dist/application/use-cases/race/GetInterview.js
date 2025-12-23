"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewUseCase = void 0;
class GetInterviewUseCase {
    constructor(equidiaService, cacheManager, raceRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.raceRepository = raceRepository;
    }
    async execute(params) {
        const cacheKey = `race:interview:${params.toGuid()}`;
        const guid = params.toGuid();
        // Try cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        // Try database second
        const dbRace = await this.raceRepository.findByGuid(guid);
        if (dbRace?.interviews) {
            const dbInterview = dbRace.interviews;
            await this.cacheManager.set(cacheKey, dbInterview, 30);
            return dbInterview;
        }
        // Fetch from API
        const interview = await this.equidiaService.getInterview(params);
        // Save to database (async, don't wait)
        this.raceRepository.saveInterviews(guid, interview).catch(err => {
            console.error('[USE CASE] Failed to save interview:', err.message);
        });
        // Cache the result
        await this.cacheManager.set(cacheKey, interview, 30);
        return interview;
    }
}
exports.GetInterviewUseCase = GetInterviewUseCase;
//# sourceMappingURL=GetInterview.js.map
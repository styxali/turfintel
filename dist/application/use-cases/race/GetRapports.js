"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRapportsUseCase = void 0;
class GetRapportsUseCase {
    constructor(equidiaService, cacheManager) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
    }
    async execute(params) {
        const cacheKey = `race:rapports:${params.toGuid()}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const rapports = await this.equidiaService.getRapports(params);
        await this.cacheManager.set(cacheKey, rapports, 60); // Cache longer (1 hour)
        return rapports;
    }
}
exports.GetRapportsUseCase = GetRapportsUseCase;
//# sourceMappingURL=GetRapports.js.map
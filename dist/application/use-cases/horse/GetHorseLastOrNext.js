"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetHorseLastOrNextUseCase = void 0;
class GetHorseLastOrNextUseCase {
    constructor(equidiaService, cacheManager) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
    }
    async execute(horseSlug) {
        const cacheKey = `horse:last-or-next:${horseSlug}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const lastOrNext = await this.equidiaService.getHorseLastOrNext(horseSlug);
        await this.cacheManager.set(cacheKey, lastOrNext, 30);
        return lastOrNext;
    }
}
exports.GetHorseLastOrNextUseCase = GetHorseLastOrNextUseCase;
//# sourceMappingURL=GetHorseLastOrNext.js.map
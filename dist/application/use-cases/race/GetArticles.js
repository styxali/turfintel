"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetArticlesUseCase = void 0;
class GetArticlesUseCase {
    constructor(equidiaService, cacheManager) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
    }
    async execute(params) {
        const cacheKey = `race:articles:${params.toGuid()}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const articles = await this.equidiaService.getArticles(params);
        await this.cacheManager.set(cacheKey, articles, 30);
        return articles;
    }
}
exports.GetArticlesUseCase = GetArticlesUseCase;
//# sourceMappingURL=GetArticles.js.map
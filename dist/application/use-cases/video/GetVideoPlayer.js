"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVideoPlayerUseCase = void 0;
class GetVideoPlayerUseCase {
    constructor(equidiaService, cacheManager) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
    }
    async execute(videoId) {
        const cacheKey = `video:player:${videoId}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const videoPlayer = await this.equidiaService.getVideoPlayer(videoId);
        await this.cacheManager.set(cacheKey, videoPlayer, 120); // Cache for 2 hours
        return videoPlayer;
    }
}
exports.GetVideoPlayerUseCase = GetVideoPlayerUseCase;
//# sourceMappingURL=GetVideoPlayer.js.map
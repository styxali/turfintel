"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoController = void 0;
class VideoController {
    constructor(getVideoPlayerUseCase) {
        this.getVideoPlayerUseCase = getVideoPlayerUseCase;
        this.getVideoPlayer = async (req, res, next) => {
            try {
                const { videoId } = req.params;
                const videoPlayer = await this.getVideoPlayerUseCase.execute(videoId);
                res.setHeader('X-Cache-Key', `video:player:${videoId}`);
                res.json(videoPlayer);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.VideoController = VideoController;
//# sourceMappingURL=VideoController.js.map
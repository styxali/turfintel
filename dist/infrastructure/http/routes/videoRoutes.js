"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVideoRoutes = createVideoRoutes;
const express_1 = require("express");
function createVideoRoutes(videoController) {
    const router = (0, express_1.Router)();
    // Get video player info
    router.get('/video-player/:videoId', videoController.getVideoPlayer);
    return router;
}
//# sourceMappingURL=videoRoutes.js.map
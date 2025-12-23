"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHorseRoutes = createHorseRoutes;
const express_1 = require("express");
function createHorseRoutes(horseController) {
    const router = (0, express_1.Router)();
    // Get horse history
    router.get('/horses/:horseSlug/history', horseController.getHorseHistory);
    // Get horse stats
    router.get('/horses/:horseSlug/stats', horseController.getHorseStats);
    // Get horse last or next race
    router.get('/horses/:horseSlug/last-or-next', horseController.getHorseLastOrNext);
    return router;
}
//# sourceMappingURL=horseRoutes.js.map
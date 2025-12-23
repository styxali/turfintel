"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIngestionRoutes = createIngestionRoutes;
// HTTP Routes: Ingestion Management
const express_1 = require("express");
function createIngestionRoutes(controller) {
    const router = (0, express_1.Router)();
    // Manual triggers
    router.post('/ingestion/run', (req, res) => controller.runFullIngestion(req, res));
    router.post('/ingestion/update', (req, res) => controller.updateRaces(req, res));
    router.post('/ingestion/date', (req, res) => controller.ingestDate(req, res));
    router.post('/ingestion/deep', (req, res) => controller.deepIngestRace(req, res));
    // Status
    router.get('/ingestion/status', (req, res) => controller.getStatus(req, res));
    return router;
}
//# sourceMappingURL=ingestionRoutes.js.map
// HTTP Routes: Ingestion Management
import { Router } from 'express';
import { IngestionController } from '../controllers/IngestionController';

export function createIngestionRoutes(controller: IngestionController): Router {
  const router = Router();

  // Manual triggers
  router.post('/ingestion/run', (req, res) => controller.runFullIngestion(req, res));
  router.post('/ingestion/update', (req, res) => controller.updateRaces(req, res));
  router.post('/ingestion/date', (req, res) => controller.ingestDate(req, res));
  router.post('/ingestion/deep', (req, res) => controller.deepIngestRace(req, res));

  // Status
  router.get('/ingestion/status', (req, res) => controller.getStatus(req, res));

  return router;
}

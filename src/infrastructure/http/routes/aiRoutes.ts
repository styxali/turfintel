import { Router } from 'express';
import { AIController } from '../controllers/AIController';

export function createAIRoutes(controller: AIController): Router {
  const router = Router();

  // GET /api/ai/race?date=2025-12-15&reunion=R1&course=C1
  router.get('/ai/race', controller.getRaceForAI);

  return router;
}

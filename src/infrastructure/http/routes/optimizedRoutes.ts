import { Router } from 'express';
import { OptimizedRaceController } from '../controllers/OptimizedRaceController';

export function createOptimizedRoutes(controller: OptimizedRaceController): Router {
  const router = Router();

  // Aggregated race endpoints
  router.get('/races/overview', (req, res, next) => 
    controller.getRaceOverview(req, res, next)
  );

  router.get('/races/simulation', (req, res, next) => 
    controller.getRaceSimulation(req, res, next)
  );

  // Batch horse endpoint
  router.post('/horses/batch', (req, res, next) => 
    controller.getBatchHorseData(req, res, next)
  );

  return router;
}

import { Router } from 'express';
import { HorseController } from '../controllers/HorseController';

export function createHorseRoutes(horseController: HorseController): Router {
  const router = Router();

  // Get horse history
  router.get('/horses/:horseSlug/history', horseController.getHorseHistory);

  // Get horse stats
  router.get('/horses/:horseSlug/stats', horseController.getHorseStats);

  // Get horse last or next race
  router.get('/horses/:horseSlug/last-or-next', horseController.getHorseLastOrNext);

  return router;
}

import { Router } from 'express';
import { RaceController } from '../controllers/RaceController';

export function createRaceRoutes(raceController: RaceController): Router {
  const router = Router();

  // Get race details with enrichment
  router.get('/course-details', raceController.getRaceDetails);

  // Get daily races
  router.get('/daily-reunions/:date', raceController.getDailyRaces);

  // Get pronostic
  router.get('/pronostic', raceController.getPronostic);

  // Get interview
  router.get('/interview', raceController.getInterview);

  // Get note
  router.get('/note', raceController.getNote);

  // Get rapports
  router.get('/rapports', raceController.getRapports);

  // Get references
  router.get('/references', raceController.getReferences);

  // Get articles
  router.get('/articles', raceController.getArticles);

  // Get pari simple (live odds)
  router.get('/pari-simple', raceController.getPariSimple);

  // Get notule
  router.get('/notule', raceController.getNotule);

  // Get tracking
  router.get('/tracking', raceController.getTracking);

  // Get precomputed chart data (OPTIMIZED)
  router.get('/race/chart-data', raceController.getChartData);

  return router;
}

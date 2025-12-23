import { Request, Response, NextFunction } from 'express';
import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { GetRaceOverviewUseCase } from '../../../application/use-cases/race/GetRaceOverview';
import { GetRaceSimulationUseCase } from '../../../application/use-cases/race/GetRaceSimulation';
import { GetBatchHorseDataUseCase } from '../../../application/use-cases/horse/GetBatchHorseData';

export class OptimizedRaceController {
  constructor(
    private getRaceOverviewUseCase: GetRaceOverviewUseCase,
    private getRaceSimulationUseCase: GetRaceSimulationUseCase,
    private getBatchHorseDataUseCase: GetBatchHorseDataUseCase
  ) {}

  /**
   * GET /api/races/overview
   * Aggregated endpoint: race + pronostic + notes
   * Reduces 3 calls (205KB) to 1 call (80KB)
   */
  async getRaceOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date, reunion, course } = req.query;

      if (!date || !reunion || !course) {
        res.status(400).json({
          error: 'Missing required parameters: date, reunion, course'
        });
        return;
      }

      const params = new RaceParams(
        date as string,
        reunion as string,
        course as string
      );

      const startTime = Date.now();
      const overview = await this.getRaceOverviewUseCase.execute(params);
      const duration = Date.now() - startTime;

      // Add performance headers
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('X-Data-Source', overview ? 'optimized' : 'unknown');

      res.json(overview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/races/simulation
   * Aggregated endpoint: race + tracking + notule + interviews
   * Reduces 4 calls (255KB) to 1 call (60KB)
   */
  async getRaceSimulation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date, reunion, course } = req.query;

      if (!date || !reunion || !course) {
        res.status(400).json({
          error: 'Missing required parameters: date, reunion, course'
        });
        return;
      }

      const params = new RaceParams(
        date as string,
        reunion as string,
        course as string
      );

      const startTime = Date.now();
      const simulation = await this.getRaceSimulationUseCase.execute(params);
      const duration = Date.now() - startTime;

      // Add performance headers
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('X-Data-Source', simulation ? 'optimized' : 'unknown');

      res.json(simulation);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/horses/batch
   * Batch endpoint for multiple horses
   * Reduces 48 calls (1.36MB) to 1 call (240KB)
   */
  async getBatchHorseData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slugs, includeStats, includeNextRace, maxRaces } = req.body;

      if (!slugs || !Array.isArray(slugs) || slugs.length === 0) {
        res.status(400).json({
          error: 'Missing or invalid slugs array'
        });
        return;
      }

      if (slugs.length > 20) {
        res.status(400).json({
          error: 'Maximum 20 horses per batch request'
        });
        return;
      }

      const startTime = Date.now();
      const batchData = await this.getBatchHorseDataUseCase.execute(slugs, {
        includeStats: includeStats !== false,
        includeNextRace: includeNextRace !== false,
        maxRaces: maxRaces || 5
      });
      const duration = Date.now() - startTime;

      // Add performance headers
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('X-Horses-Count', slugs.length.toString());
      res.setHeader('X-Data-Source', 'batch-optimized');

      res.json(batchData);
    } catch (error) {
      next(error);
    }
  }
}

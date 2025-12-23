// HTTP Controller: Ingestion Management
import { Request, Response } from 'express';
import { IIngestionService } from '../../../domain/interfaces/IIngestionService';
import { IngestionScheduler } from '../../scheduler/IngestionScheduler';

export class IngestionController {
  constructor(
    private ingestionService: IIngestionService,
    private scheduler: IngestionScheduler
  ) {}

  /**
   * POST /api/ingestion/run
   * Trigger full ingestion manually
   */
  async runFullIngestion(req: Request, res: Response) {
    try {
      const { daysAhead = 2 } = req.body;

      console.log(`[INGESTION API] Manual full ingestion requested (${daysAhead} days)`);

      const summary = await this.ingestionService.ingestUpcoming(daysAhead);

      res.json({
        success: true,
        message: 'Full ingestion completed',
        summary
      });
    } catch (error: any) {
      console.error('[INGESTION API] Full ingestion failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Full ingestion failed',
        error: error.message
      });
    }
  }

  /**
   * POST /api/ingestion/update
   * Update existing races
   */
  async updateRaces(req: Request, res: Response) {
    try {
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required'
        });
      }

      console.log(`[INGESTION API] Manual update requested for ${date}`);

      const result = await this.ingestionService.updateExistingRaces(date);

      res.json({
        success: true,
        message: 'Update completed',
        result
      });
    } catch (error: any) {
      console.error('[INGESTION API] Update failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Update failed',
        error: error.message
      });
    }
  }

  /**
   * POST /api/ingestion/date
   * Ingest specific date
   */
  async ingestDate(req: Request, res: Response) {
    try {
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required'
        });
      }

      console.log(`[INGESTION API] Manual ingestion requested for ${date}`);

      const result = await this.ingestionService.ingestDate(date);

      res.json({
        success: true,
        message: 'Date ingestion completed',
        result
      });
    } catch (error: any) {
      console.error('[INGESTION API] Date ingestion failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Date ingestion failed',
        error: error.message
      });
    }
  }

  /**
   * POST /api/ingestion/deep
   * Deep ingest a race with all reference races and horses
   */
  async deepIngestRace(req: Request, res: Response) {
    try {
      const { date, reunion, course } = req.body;

      if (!date || !reunion || !course) {
        return res.status(400).json({
          success: false,
          message: 'Date, reunion, and course are required'
        });
      }

      console.log(`[INGESTION API] Deep ingestion requested for ${date} ${reunion} ${course}`);

      const result = await this.ingestionService.deepIngestRace(date, reunion, course);

      res.json({
        success: true,
        message: 'Deep ingestion completed',
        result
      });
    } catch (error: any) {
      console.error('[INGESTION API] Deep ingestion failed:', error.message);
      res.status(500).json({
        success: false,
        message: 'Deep ingestion failed',
        error: error.message
      });
    }
  }

  /**
   * GET /api/ingestion/status
   * Get scheduler status
   */
  async getStatus(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        scheduler: {
          running: true,
          dailyIngestion: '2:00 AM',
          periodicUpdates: 'Every 6 hours'
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

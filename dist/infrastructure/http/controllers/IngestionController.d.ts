import { Request, Response } from 'express';
import { IIngestionService } from '../../../domain/interfaces/IIngestionService';
import { IngestionScheduler } from '../../scheduler/IngestionScheduler';
export declare class IngestionController {
    private ingestionService;
    private scheduler;
    constructor(ingestionService: IIngestionService, scheduler: IngestionScheduler);
    /**
     * POST /api/ingestion/run
     * Trigger full ingestion manually
     */
    runFullIngestion(req: Request, res: Response): Promise<void>;
    /**
     * POST /api/ingestion/update
     * Update existing races
     */
    updateRaces(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /api/ingestion/date
     * Ingest specific date
     */
    ingestDate(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * POST /api/ingestion/deep
     * Deep ingest a race with all reference races and horses
     */
    deepIngestRace(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * GET /api/ingestion/status
     * Get scheduler status
     */
    getStatus(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=IngestionController.d.ts.map
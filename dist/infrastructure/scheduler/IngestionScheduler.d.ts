import { IIngestionService } from '../../domain/interfaces/IIngestionService';
export declare class IngestionScheduler {
    private ingestionService;
    private intervals;
    private isRunning;
    constructor(ingestionService: IIngestionService);
    /**
     * Start the scheduler
     */
    start(): void;
    /**
     * Stop the scheduler
     */
    stop(): void;
    /**
     * Run full ingestion immediately (manual trigger)
     */
    runFullIngestion(): Promise<import("../../domain/interfaces/IIngestionService").IngestionSummary>;
    /**
     * Run update immediately (manual trigger)
     */
    runUpdate(): Promise<{
        today: import("../../domain/interfaces/IIngestionService").IngestionResult;
        tomorrow: import("../../domain/interfaces/IIngestionService").IngestionResult;
    }>;
    /**
     * Schedule daily full ingestion at 2 AM
     */
    private scheduleDailyIngestion;
    /**
     * Schedule periodic updates every 6 hours
     */
    private schedulePeriodicUpdates;
}
//# sourceMappingURL=IngestionScheduler.d.ts.map
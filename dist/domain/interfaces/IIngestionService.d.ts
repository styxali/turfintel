export interface IIngestionService {
    /**
     * Ingest all races for a specific date
     */
    ingestDate(date: string): Promise<IngestionResult>;
    /**
     * Ingest upcoming races (today + next N days)
     */
    ingestUpcoming(daysAhead: number): Promise<IngestionSummary>;
    /**
     * Update existing races (refresh dynamic data)
     */
    updateExistingRaces(date: string): Promise<IngestionResult>;
    /**
     * Ingest deep race
     */
    deepIngestRace(date: string, reunion: string, course: string): Promise<{
        mainRace: boolean;
        referenceRaces: number;
        horsesIngested: number;
    }>;
    /**
     * Mark finished races as stale
     */
    markFinishedRaces(): Promise<number>;
}
export interface IngestionResult {
    date: string;
    racesProcessed: number;
    racesSucceeded: number;
    racesFailed: number;
    duration: number;
    errors: string[];
}
export interface IngestionSummary {
    dates: string[];
    totalRaces: number;
    totalSucceeded: number;
    totalFailed: number;
    totalDuration: number;
    results: IngestionResult[];
}
//# sourceMappingURL=IIngestionService.d.ts.map
import { IEquidiaService } from '../../domain/interfaces/IEquidiaService';
import { IRaceRepository } from '../../domain/interfaces/IRaceRepository';
import { IIngestionService, IngestionResult, IngestionSummary } from '../../domain/interfaces/IIngestionService';
export declare class IngestionService implements IIngestionService {
    private equidiaService;
    private raceRepository;
    private ingestRaceUseCase;
    constructor(equidiaService: IEquidiaService, raceRepository: IRaceRepository);
    /**
     * Ingest all races for a specific date
     */
    ingestDate(date: string): Promise<IngestionResult>;
    /**
     * Ingest upcoming races (today + tomorrow only)
     */
    ingestUpcoming(daysAhead?: number): Promise<IngestionSummary>;
    /**
     * Update existing races (refresh dynamic data)
     */
    updateExistingRaces(date: string): Promise<IngestionResult>;
    /**
     * Deep ingest a specific race with all reference races and horses
     */
    deepIngestRace(date: string, reunion: string, course: string): Promise<{
        mainRace: boolean;
        referenceRaces: number;
        horsesIngested: number;
    }>;
    /**
     * Mark finished races as stale (races older than today)
     */
    markFinishedRaces(): Promise<number>;
    private delay;
}
//# sourceMappingURL=IngestionService.d.ts.map
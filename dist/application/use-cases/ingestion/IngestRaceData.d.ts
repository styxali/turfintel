import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
export declare class IngestRaceDataUseCase {
    private equidiaService;
    private raceRepository;
    constructor(equidiaService: IEquidiaService, raceRepository: IRaceRepository);
    /**
     * Ingest all data for a single race
     */
    execute(params: RaceParams): Promise<boolean>;
    /**
     * Update dynamic data for existing race (pari-simple, tracking)
     */
    updateDynamicData(params: RaceParams): Promise<boolean>;
}
//# sourceMappingURL=IngestRaceData.d.ts.map
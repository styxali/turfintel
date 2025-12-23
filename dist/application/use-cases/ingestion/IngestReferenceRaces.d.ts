import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import { IHorseRepository } from '../../../domain/interfaces/IHorseRepository';
export declare class IngestReferenceRacesUseCase {
    private equidiaService;
    private raceRepository;
    private horseRepository;
    constructor(equidiaService: IEquidiaService, raceRepository: IRaceRepository, horseRepository: IHorseRepository);
    /**
     * Deep ingest a race with all reference races and horse data
     */
    execute(params: RaceParams): Promise<{
        mainRace: boolean;
        referenceRaces: number;
        horsesIngested: number;
    }>;
    private delay;
}
//# sourceMappingURL=IngestReferenceRaces.d.ts.map
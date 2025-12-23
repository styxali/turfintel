import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';
export interface EnrichedRaceData extends Types.RaceDetailResponse {
    pronostic?: Types.PronosticResponse;
    interviews?: Types.InterviewResponse;
    notes?: Types.NoteResponse;
    tracking?: Types.TrackingResponse;
    notule?: Types.NotuleResponse;
    references?: Types.ReferencesResponse;
    pariSimple?: Types.PariSimpleResponse;
}
export declare class GetRaceDetailsUseCase {
    private equidiaService;
    private cacheManager;
    private raceRepository;
    constructor(equidiaService: IEquidiaService, cacheManager: ICacheManager, raceRepository: IRaceRepository);
    execute(params: RaceParams, enrich?: boolean): Promise<EnrichedRaceData>;
    private enrichRaceData;
}
//# sourceMappingURL=GetRaceDetails.d.ts.map
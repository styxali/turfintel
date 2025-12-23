import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';
export declare class GetPronosticUseCase {
    private equidiaService;
    private cacheManager;
    private raceRepository;
    constructor(equidiaService: IEquidiaService, cacheManager: ICacheManager, raceRepository: IRaceRepository);
    execute(params: RaceParams): Promise<Types.PronosticResponse>;
}
//# sourceMappingURL=GetPronostic.d.ts.map
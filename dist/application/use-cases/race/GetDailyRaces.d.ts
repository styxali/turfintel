import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import * as Types from '../../../shared/types/types';
export declare class GetDailyRacesUseCase {
    private equidiaService;
    private cacheManager;
    constructor(equidiaService: IEquidiaService, cacheManager: ICacheManager);
    execute(date: string): Promise<Types.DailyReunionResponse>;
}
//# sourceMappingURL=GetDailyRaces.d.ts.map
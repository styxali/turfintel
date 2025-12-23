import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import * as Types from '../../../shared/types/types';
export declare class GetHorseLastOrNextUseCase {
    private equidiaService;
    private cacheManager;
    constructor(equidiaService: IEquidiaService, cacheManager: ICacheManager);
    execute(horseSlug: string): Promise<Types.HorseLastOrNextResponse>;
}
//# sourceMappingURL=GetHorseLastOrNext.d.ts.map
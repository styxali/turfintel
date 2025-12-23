import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IHorseRepository } from '../../../domain/interfaces/IHorseRepository';
import * as Types from '../../../shared/types/types';
export declare class GetHorseHistoryUseCase {
    private equidiaService;
    private cacheManager;
    private horseRepository;
    constructor(equidiaService: IEquidiaService, cacheManager: ICacheManager, horseRepository: IHorseRepository);
    execute(horseSlug: string, options?: any): Promise<Types.HorseHistoryResponse>;
}
//# sourceMappingURL=GetHorseHistory.d.ts.map
import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import * as Types from '../../../shared/types/types';
export declare class GetArticlesUseCase {
    private equidiaService;
    private cacheManager;
    constructor(equidiaService: IEquidiaService, cacheManager: ICacheManager);
    execute(params: RaceParams): Promise<Types.ArticleResponse>;
}
//# sourceMappingURL=GetArticles.d.ts.map
import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import * as Types from '../../../shared/types/types';

export class GetArticlesUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager
  ) {}

  async execute(params: RaceParams): Promise<Types.ArticleResponse> {
    const cacheKey = `race:articles:${params.toGuid()}`;

    const cached = await this.cacheManager.get<Types.ArticleResponse>(cacheKey);
    if (cached) return cached;

    const articles = await this.equidiaService.getArticles(params);
    await this.cacheManager.set(cacheKey, articles, 30);

    return articles;
  }
}

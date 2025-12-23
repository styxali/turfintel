import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import * as Types from '../../../shared/types/types';

export class GetHorseLastOrNextUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager
  ) {}

  async execute(horseSlug: string): Promise<Types.HorseLastOrNextResponse> {
    const cacheKey = `horse:last-or-next:${horseSlug}`;

    const cached = await this.cacheManager.get<Types.HorseLastOrNextResponse>(cacheKey);
    if (cached) return cached;

    const lastOrNext = await this.equidiaService.getHorseLastOrNext(horseSlug);
    await this.cacheManager.set(cacheKey, lastOrNext, 30);

    return lastOrNext;
  }
}

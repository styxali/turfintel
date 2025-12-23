import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IHorseRepository } from '../../../domain/interfaces/IHorseRepository';
import * as Types from '../../../shared/types/types';

export class GetHorseHistoryUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private horseRepository: IHorseRepository
  ) {}

  async execute(horseSlug: string, options?: any): Promise<Types.HorseHistoryResponse> {
    const cacheKey = `horse:history:${horseSlug}:${JSON.stringify(options || {})}`;

    // Try cache first (45 minutes TTL)
    const cached = await this.cacheManager.get<Types.HorseHistoryResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Try database second
    const hasHistory = await this.horseRepository.hasHistory(horseSlug);
    if (hasHistory) {
      const dbHorse = await this.horseRepository.findBySlug(horseSlug);
      if (dbHorse?.history) {
        const dbHistory = dbHorse.history as Types.HorseHistoryResponse;
        await this.cacheManager.set(cacheKey, dbHistory, 45);
        return dbHistory;
      }
    }

    // Fetch from API
    const history = await this.equidiaService.getHorseHistory(horseSlug, options);

    // Save to database (async, don't wait)
    this.horseRepository.saveHistory(horseSlug, history).catch(err => {
      console.error('[USE CASE] Failed to save horse history:', err.message);
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, history, 45);

    return history;
  }
}

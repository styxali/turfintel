import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IHorseRepository } from '../../../domain/interfaces/IHorseRepository';
import * as Types from '../../../shared/types/types';

export class GetHorseStatsUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private horseRepository: IHorseRepository
  ) {}

  async execute(horseSlug: string): Promise<Types.HorseStatsResponse> {
    const cacheKey = `horse:stats:${horseSlug}`;

    // Try cache first
    const cached = await this.cacheManager.get<Types.HorseStatsResponse>(cacheKey);
    if (cached) return cached;

    // Try database second
    const hasStats = await this.horseRepository.hasStats(horseSlug);
    if (hasStats) {
      const dbHorse = await this.horseRepository.findBySlug(horseSlug);
      if (dbHorse?.stats) {
        const dbStats = dbHorse.stats as Types.HorseStatsResponse;
        await this.cacheManager.set(cacheKey, dbStats, 45);
        return dbStats;
      }
    }

    // Fetch from API
    const stats = await this.equidiaService.getHorseStats(horseSlug);

    // Save to database (async, don't wait)
    this.horseRepository.saveStats(horseSlug, stats).catch(err => {
      console.error('[USE CASE] Failed to save horse stats:', err.message);
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, stats, 45);

    return stats;
  }
}

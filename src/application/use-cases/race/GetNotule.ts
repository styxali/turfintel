import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';

export class GetNotuleUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(params: RaceParams): Promise<Types.NotuleResponse> {
    const cacheKey = `race:notule:${params.toGuid()}`;
    const guid = params.toGuid();

    // Try cache first
    const cached = await this.cacheManager.get<Types.NotuleResponse>(cacheKey);
    if (cached) return cached;

    // Try database second
    const dbRace = await this.raceRepository.findByGuid(guid);
    if (dbRace?.notule) {
      const dbNotule = dbRace.notule as Types.NotuleResponse;
      await this.cacheManager.set(cacheKey, dbNotule, 30);
      return dbNotule;
    }

    // Fetch from API
    const notule = await this.equidiaService.getNotule(params);

    // Save to database (async, don't wait)
    this.raceRepository.saveNotule(guid, notule).catch(err => {
      console.error('[USE CASE] Failed to save notule:', err.message);
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, notule, 30);

    return notule;
  }
}

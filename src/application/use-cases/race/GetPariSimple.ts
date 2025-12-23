import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';

export class GetPariSimpleUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(params: RaceParams): Promise<Types.PariSimpleResponse> {
    const cacheKey = `race:pari-simple:${params.toGuid()}`;
    const guid = params.toGuid();

    // Try cache first
    const cached = await this.cacheManager.get<Types.PariSimpleResponse>(cacheKey);
    if (cached) return cached;

    // Try database second
    const dbRace = await this.raceRepository.findByGuid(guid);
    if (dbRace?.pariSimple) {
      const dbPariSimple = dbRace.pariSimple as Types.PariSimpleResponse;
      await this.cacheManager.set(cacheKey, dbPariSimple, 5);
      return dbPariSimple;
    }

    // Fetch from API
    const pariSimple = await this.equidiaService.getPariSimple(params);

    // Save to database (async, don't wait)
    this.raceRepository.savePariSimple(guid, pariSimple).catch(err => {
      console.error('[USE CASE] Failed to save pari simple:', err.message);
    });

    // Cache for 5 minutes (dynamic data)
    await this.cacheManager.set(cacheKey, pariSimple, 5);

    return pariSimple;
  }
}

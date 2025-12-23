import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';

export class GetReferencesUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(params: RaceParams): Promise<Types.ReferencesResponse> {
    const cacheKey = `race:references:${params.toGuid()}`;
    const guid = params.toGuid();

    // Try cache first
    const cached = await this.cacheManager.get<Types.ReferencesResponse>(cacheKey);
    if (cached) return cached;

    // Try database second
    const dbRace = await this.raceRepository.findByGuid(guid);
    if (dbRace?.references) {
      const dbReferences = dbRace.references as Types.ReferencesResponse;
      await this.cacheManager.set(cacheKey, dbReferences, 60);
      return dbReferences;
    }

    // Fetch from API
    const references = await this.equidiaService.getReferences(params);

    // Save to database (async, don't wait)
    this.raceRepository.saveReferences(guid, references).catch(err => {
      console.error('[USE CASE] Failed to save references:', err.message);
    });

    // Cache longer (1 hour)
    await this.cacheManager.set(cacheKey, references, 60);

    return references;
  }
}

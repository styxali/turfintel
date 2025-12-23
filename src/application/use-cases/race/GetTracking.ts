import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';

export class GetTrackingUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(params: RaceParams): Promise<Types.TrackingResponse> {
    const cacheKey = `race:tracking:${params.toGuid()}`;
    const guid = params.toGuid();

    // Try cache first
    const cached = await this.cacheManager.get<Types.TrackingResponse>(cacheKey);
    if (cached) return cached;

    // Try database second
    const hasTracking = await this.raceRepository.hasTracking(guid);
    if (hasTracking) {
      const dbRace = await this.raceRepository.findByGuid(guid);
      if (dbRace?.tracking) {
        const dbTracking = dbRace.tracking as Types.TrackingResponse;
        await this.cacheManager.set(cacheKey, dbTracking, 60);
        return dbTracking;
      }
    }

    // Fetch from API
    const tracking = await this.equidiaService.getTracking(params);

    // Save to database (async, don't wait)
    this.raceRepository.saveTracking(guid, tracking).catch(err => {
      console.error('[USE CASE] Failed to save tracking:', err.message);
    });

    // Cache longer (1 hour)
    await this.cacheManager.set(cacheKey, tracking, 60);

    return tracking;
  }
}

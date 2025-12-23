import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';

export class GetInterviewUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(params: RaceParams): Promise<Types.InterviewResponse> {
    const cacheKey = `race:interview:${params.toGuid()}`;
    const guid = params.toGuid();

    // Try cache first
    const cached = await this.cacheManager.get<Types.InterviewResponse>(cacheKey);
    if (cached) return cached;

    // Try database second
    const dbRace = await this.raceRepository.findByGuid(guid);
    if (dbRace?.interviews) {
      const dbInterview = dbRace.interviews as Types.InterviewResponse;
      await this.cacheManager.set(cacheKey, dbInterview, 30);
      return dbInterview;
    }

    // Fetch from API
    const interview = await this.equidiaService.getInterview(params);

    // Save to database (async, don't wait)
    this.raceRepository.saveInterviews(guid, interview).catch(err => {
      console.error('[USE CASE] Failed to save interview:', err.message);
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, interview, 30);

    return interview;
  }
}

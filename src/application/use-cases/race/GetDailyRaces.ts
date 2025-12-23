import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import { RaceParams } from '../../../domain/value-objects/RaceParams';
import * as Types from '../../../shared/types/types';

export class GetDailyRacesUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(date: string): Promise<Types.DailyReunionResponse> {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
    }

    const cacheKey = `daily:races:${date}`;

    // Try cache first (15 minutes TTL for daily data)
    const cached = await this.cacheManager.get<Types.DailyReunionResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const dailyRaces = await this.equidiaService.getDailyReunions(date);

    // Create race records in database for FR + Flat races (async, don't wait)
    this.createRaceRecords(date, dailyRaces).catch(err => {
      console.error('[USE CASE] Failed to create race records:', err.message);
    });

    // Cache the result
    await this.cacheManager.set(cacheKey, dailyRaces, 15);

    return dailyRaces;
  }

  private async createRaceRecords(date: string, dailyRaces: Types.DailyReunionResponse): Promise<void> {
    let created = 0;
    let skipped = 0;

    for (const reunion of dailyRaces) {
      // Only French reunions
      if (reunion.pays_site_reunion !== 'FRA') {
        continue;
      }

      for (const course of reunion.courses_by_day) {
        // Only Flat races
        if (course.discipline !== 'Plat') {
          skipped++;
          continue;
        }

        try {
          const params = new RaceParams(
            date,
            `R${reunion.num_reunion}`,
            `C${String(course.num_course_pmu).padStart(2, '0')}`
          );

          // Check if race already exists
          const existing = await this.raceRepository.findByParams(params);
          if (existing) {
            skipped++;
            continue;
          }

          // Fetch and save race details (this will create horses too)
          const raceDetails = await this.equidiaService.getCourseDetails(params);
          await this.raceRepository.saveRaceDetails(raceDetails);
          created++;

          console.log(`[DAILY RACES] Created race: ${params.toGuid()}`);
        } catch (error: any) {
          console.error(`[DAILY RACES] Failed to create race ${reunion.num_reunion}/${course.num_course_pmu}:`, error.message);
        }
      }
    }

    console.log(`[DAILY RACES] Created ${created} races, skipped ${skipped} for date: ${date}`);
  }
}

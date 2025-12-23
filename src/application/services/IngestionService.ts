// Application Service: Data Ingestion Orchestration
import { DateTime } from 'luxon';
import { RaceParams } from '../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../domain/interfaces/IEquidiaService';
import { IRaceRepository } from '../../domain/interfaces/IRaceRepository';
import {
  IIngestionService,
  IngestionResult,
  IngestionSummary
} from '../../domain/interfaces/IIngestionService';
import { IngestRaceDataUseCase } from '../use-cases/ingestion/IngestRaceData';

export class IngestionService implements IIngestionService {
  private ingestRaceUseCase: IngestRaceDataUseCase;

  constructor(
    private equidiaService: IEquidiaService,
    private raceRepository: IRaceRepository
  ) {
    this.ingestRaceUseCase = new IngestRaceDataUseCase(equidiaService, raceRepository);
  }

  /**
   * Ingest all races for a specific date
   */
  async ingestDate(date: string): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      date,
      racesProcessed: 0,
      racesSucceeded: 0,
      racesFailed: 0,
      duration: 0,
      errors: []
    };

    try {
      console.log(`[INGESTION] Starting ingestion for date: ${date}`);

      // Fetch daily reunions
      const dailyData = await this.equidiaService.getDailyReunions(date);

      if (!dailyData || dailyData.length === 0) {
        console.log(`[INGESTION] No reunions found for date: ${date}`);
        result.duration = Date.now() - startTime;
        return result;
      }

      // Extract all races (filter for French Plat only)
      const races: { reunion: string; course: string }[] = [];
      for (const reunion of dailyData) {
        // Only process French Plat (flat racing) reunions
        if (reunion.specialite_reunion !== 'Plat') {
          continue;
        }

        // Only French races (FRA)
        if (reunion.pays_site_reunion !== 'FRA') {
          continue;
        }

        for (const course of reunion.courses_by_day) {
          // Double-check discipline is Plat
          if (course.discipline === 'Plat') {
            races.push({
              reunion: `R${reunion.num_reunion}`,
              course: `C${String(course.num_course_pmu).padStart(2, '0')}`
            });
          }
        }
      }

      console.log(`[INGESTION] Found ${races.length} races for ${date}`);

      // Process races with concurrency limit (5 at a time)
      const CONCURRENCY = 1;
      for (let i = 0; i < races.length; i += CONCURRENCY) {
        const batch = races.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.allSettled(
          batch.map(async (race) => {
            const params = new RaceParams(date, race.reunion, race.course);
            return this.ingestRaceUseCase.execute(params);
          })
        );

        // Count results
        for (const batchResult of batchResults) {
          result.racesProcessed++;
          if (batchResult.status === 'fulfilled' && batchResult.value) {
            result.racesSucceeded++;
          } else {
            result.racesFailed++;
            const error =
              batchResult.status === 'rejected'
                ? batchResult.reason?.message || 'Unknown error'
                : 'Ingestion returned false';
            result.errors.push(error);
          }
        }

        // Small delay between batches to avoid overwhelming API
        if (i + CONCURRENCY < races.length) {
          await this.delay(2000); // 2 second delay
        }
      }

      result.duration = Date.now() - startTime;
      console.log(
        `[INGESTION] Completed ${date}: ${result.racesSucceeded}/${result.racesProcessed} succeeded in ${result.duration}ms`
      );

      return result;
    } catch (error: any) {
      result.duration = Date.now() - startTime;
      result.errors.push(`Fatal error: ${error.message}`);
      console.error(`[INGESTION] Fatal error for date ${date}:`, error.message);
      return result;
    }
  }

  /**
   * Ingest upcoming races (today + tomorrow only)
   */
  async ingestUpcoming(daysAhead: number = 1): Promise<IngestionSummary> {
    const startTime = Date.now();
    const summary: IngestionSummary = {
      dates: [],
      totalRaces: 0,
      totalSucceeded: 0,
      totalFailed: 0,
      totalDuration: 0,
      results: []
    };

    // Limit to max 1 day ahead (today + tomorrow)
    const maxDays = Math.min(daysAhead, 1);
    console.log(`[INGESTION] Starting ingestion for today + tomorrow (${maxDays + 1} days)`);

    // Generate dates (today + tomorrow only)
    const dates: string[] = [];
    for (let i = 0; i <= maxDays; i++) {
      const date = DateTime.now().plus({ days: i }).toFormat('yyyy-MM-dd');
      dates.push(date);
    }

    summary.dates = dates;

    // Process each date sequentially
    for (const date of dates) {
      const result = await this.ingestDate(date);
      summary.results.push(result);
      summary.totalRaces += result.racesProcessed;
      summary.totalSucceeded += result.racesSucceeded;
      summary.totalFailed += result.racesFailed;

      // Delay between dates
      await this.delay(3000); // 3 second delay
    }

    summary.totalDuration = Date.now() - startTime;

    console.log(`[INGESTION] Completed upcoming ingestion:`);
    console.log(`  - Dates: ${summary.dates.join(', ')}`);
    console.log(`  - Total races: ${summary.totalRaces}`);
    console.log(`  - Succeeded: ${summary.totalSucceeded}`);
    console.log(`  - Failed: ${summary.totalFailed}`);
    console.log(`  - Duration: ${summary.totalDuration}ms`);

    return summary;
  }

  /**
   * Update existing races (refresh dynamic data)
   */
  async updateExistingRaces(date: string): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      date,
      racesProcessed: 0,
      racesSucceeded: 0,
      racesFailed: 0,
      duration: 0,
      errors: []
    };

    try {
      console.log(`[INGESTION] Updating races for date: ${date}`);

      // Get races from database
      const dbRaces = await this.raceRepository.findUpcoming(date);

      if (dbRaces.length === 0) {
        console.log(`[INGESTION] No races found in DB for date: ${date}`);
        result.duration = Date.now() - startTime;
        return result;
      }

      console.log(`[INGESTION] Updating ${dbRaces.length} races for ${date}`);

      // Update races with concurrency limit
      const CONCURRENCY = 5;
      for (let i = 0; i < dbRaces.length; i += CONCURRENCY) {
        const batch = dbRaces.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.allSettled(
          batch.map(async (race) => {
            const params = new RaceParams(race.date, race.reunion, race.course);
            return this.ingestRaceUseCase.updateDynamicData(params);
          })
        );

        // Count results
        for (const batchResult of batchResults) {
          result.racesProcessed++;
          if (batchResult.status === 'fulfilled' && batchResult.value) {
            result.racesSucceeded++;
          } else {
            result.racesFailed++;
            const error =
              batchResult.status === 'rejected'
                ? batchResult.reason?.message || 'Unknown error'
                : 'Update returned false';
            result.errors.push(error);
          }
        }

        if (i + CONCURRENCY < dbRaces.length) {
          await this.delay(1000); // 1 second delay
        }
      }

      result.duration = Date.now() - startTime;
      console.log(
        `[INGESTION] Updated ${date}: ${result.racesSucceeded}/${result.racesProcessed} succeeded in ${result.duration}ms`
      );

      return result;
    } catch (error: any) {
      result.duration = Date.now() - startTime;
      result.errors.push(`Fatal error: ${error.message}`);
      console.error(`[INGESTION] Fatal error updating ${date}:`, error.message);
      return result;
    }
  }

  /**
   * Deep ingest a specific race with all reference races and horses
   */
  async deepIngestRace(date: string, reunion: string | number, course: string | number): Promise<{
    mainRace: boolean;
    referenceRaces: number;
    horsesIngested: number;
  }> {
    // Format reunion and course to R1, C1 format
    const reunionStr = String(reunion);
    const courseStr = String(course);
    const formattedReunion = reunionStr.startsWith('R') ? reunionStr : `R${reunionStr}`;
    const formattedCourse = courseStr.startsWith('C') ? courseStr : `C${courseStr}`;
    
    console.log(`[INGESTION] Starting deep ingestion for ${date} ${formattedReunion} ${formattedCourse}`);
    
    const { IngestReferenceRacesUseCase } = await import('../use-cases/ingestion/IngestReferenceRaces');
    const { PrismaHorseRepository } = await import('../../infrastructure/database/repositories/PrismaHorseRepository');
    const { getPrismaClient } = await import('../../infrastructure/database/prisma');
    
    const prisma = getPrismaClient();
    const horseRepository = new PrismaHorseRepository(prisma);
    const deepIngestUseCase = new IngestReferenceRacesUseCase(
      this.equidiaService,
      this.raceRepository,
      horseRepository
    );

    const params = new RaceParams(date, formattedReunion, formattedCourse);
    return await deepIngestUseCase.execute(params);
  }

  /**
   * Mark finished races as stale (races older than today)
   */
  async markFinishedRaces(): Promise<number> {
    console.log('[INGESTION] Marking finished races as stale');
    // TODO: Implement when we add 'isStale' or 'status' field to schema
    // For now, just log
    console.log('[INGESTION] Stale marking not yet implemented in schema');
    return 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

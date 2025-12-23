// Ingestion Worker - Background process for 4-day window ingestion
import { DateTime } from 'luxon';
import { getPrismaClient } from '../infrastructure/database/prisma';
import { EquidiaService } from '../infrastructure/external-apis/equidia/EquidiaService';
import { PrismaRaceRepository } from '../infrastructure/database/repositories/PrismaRaceRepository';
import { PrismaHorseRepository } from '../infrastructure/database/repositories/PrismaHorseRepository';
import { IngestionService } from '../application/services/IngestionService';
import { VectorStoreIngestionService } from '../application/services/VectorStoreIngestionService';
import { IngestRaceDataUseCase } from '../application/use-cases/ingestion/IngestRaceData';
import { RaceParams } from '../domain/value-objects/RaceParams';

export class IngestionWorker {
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;
  
  private prisma = getPrismaClient();
  private equidiaService = new EquidiaService();
  private raceRepository = new PrismaRaceRepository(this.prisma);
  private horseRepository = new PrismaHorseRepository(this.prisma);
  private ingestionService = new IngestionService(this.equidiaService, this.raceRepository);
  private vectorService = new VectorStoreIngestionService(this.prisma);
  private ingestRaceUseCase = new IngestRaceDataUseCase(this.equidiaService, this.raceRepository);

  async start(intervalHours: number = 6) {
    if (this.isRunning) {
      console.log('[WORKER] Already running');
      return;
    }

    this.isRunning = true;
    console.log(`[WORKER] Starting ingestion worker (runs every ${intervalHours}h)`);

    // Run immediately
    await this.runCycle();

    // Schedule recurring runs
    this.intervalId = setInterval(async () => {
      await this.runCycle();
    }, intervalHours * 60 * 60 * 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log('[WORKER] Stopped');
  }

  private async runCycle() {
    console.log('[WORKER] ========================================');
    console.log('[WORKER] Starting ingestion cycle');
    console.log('[WORKER] ========================================');
    const startTime = Date.now();

    try {
      // 1. Ingest 4-day window (yesterday + today + 2 days ahead)
      await this.ingestFourDayWindow();

      // 2. Create vector stores for new races
      await this.createVectorStores();

      // 3. Cleanup old vector stores
      await this.cleanupOldVectorStores();

      const duration = Date.now() - startTime;
      console.log('[WORKER] ========================================');
      console.log(`[WORKER] Cycle complete in ${duration}ms`);
      console.log('[WORKER] ========================================');
    } catch (error: any) {
      console.error('[WORKER] Cycle failed:', error.message);
    }
  }

  private async ingestFourDayWindow() {
    console.log('[WORKER] Step 1: Ingest 4-day window');
    
    const dates = this.getFourDayWindow();
    console.log(`[WORKER] Dates: ${dates.join(', ')}`);

    for (const date of dates) {
      console.log(`[WORKER] Processing date: ${date}`);
      
      // Check dailyReunion for races with partants
      await this.checkAndIngestRacesWithPartants(date);
      
      // Small delay between dates
      await this.delay(2000);
    }
  }

  private getFourDayWindow(): string[] {
    const dates: string[] = [];
    const today = DateTime.now();
    
    // Yesterday
    dates.push(today.minus({ days: 1 }).toFormat('yyyy-MM-dd'));
    
    // Today
    dates.push(today.toFormat('yyyy-MM-dd'));
    
    // Tomorrow
    dates.push(today.plus({ days: 1 }).toFormat('yyyy-MM-dd'));
    
    // Day after tomorrow
    dates.push(today.plus({ days: 2 }).toFormat('yyyy-MM-dd'));
    
    return dates;
  }

  private async checkAndIngestRacesWithPartants(date: string) {
    try {
      // Fetch daily reunions
      const reunions = await this.equidiaService.getDailyReunions(date);
      
      if (!reunions || reunions.length === 0) {
        console.log(`[WORKER] No reunions for ${date}`);
        return;
      }

      let racesFound = 0;
      let racesIngested = 0;

      // Check each reunion
      for (const reunion of reunions) {
        // Only French Plat races
        if (reunion.specialite_reunion !== 'Plat' || reunion.pays_site_reunion !== 'FRA') {
          continue;
        }

        // Check each race
        for (const course of reunion.courses_by_day) {
          if (course.discipline !== 'Plat') continue;

          racesFound++;
          
          const reunionCode = `R${reunion.num_reunion}`;
          const courseCode = `C${String(course.num_course_pmu).padStart(2, '0')}`;
          const guid = `${date.replace(/-/g, '')}_${reunionCode}_${courseCode}`;

          // Check if race exists in DB
          const existsInDb = await this.raceRepository.findByGuid(guid);
          if (existsInDb) {
            console.log(`[WORKER] Race ${guid} already in DB, skipping`);
            continue;
          }

          // Fetch race details to check partants
          try {
            const params = new RaceParams(date, reunionCode, courseCode);
            const raceDetails = await this.equidiaService.getCourseDetails(params);

            // Check if partants array is not empty
            if (!raceDetails.partants || raceDetails.partants.length === 0) {
              console.log(`[WORKER] Race ${guid} has no partants, skipping`);
              continue;
            }

            console.log(`[WORKER] Race ${guid} has ${raceDetails.partants.length} partants, ingesting...`);

            // Deep ingest this race
            await this.deepIngestSingleRace(params, raceDetails);
            racesIngested++;

            // Rate limit
            await this.delay(1000);
          } catch (error: any) {
            console.error(`[WORKER] Failed to ingest ${guid}:`, error.message);
          }
        }
      }

      console.log(`[WORKER] ${date}: Found ${racesFound} races, ingested ${racesIngested} new races`);
    } catch (error: any) {
      console.error(`[WORKER] Failed to check ${date}:`, error.message);
    }
  }

  private async deepIngestSingleRace(params: RaceParams, raceDetails: any) {
    const guid = `${params.date.replace(/-/g, '')}_${params.reunion}_${params.course}`;
    console.log(`[WORKER] Deep ingesting race: ${guid}`);

    try {
      // 1. Ingest main race
      await this.ingestRaceUseCase.execute(params);
      console.log(`[WORKER] ✓ Main race ingested`);

      // 2. Fetch and ingest horse histories
      let horsesIngested = 0;
      for (const partant of raceDetails.partants) {
        try {
          const horseUuid = partant.cheval.uuid;
          
          // Check if history already exists
          const existingHorse = await this.horseRepository.findByUuid(horseUuid);
          if (existingHorse && existingHorse.historyJson) {
            console.log(`[WORKER] Horse ${horseUuid} history already exists, skipping`);
            continue;
          }

          // Fetch history
          const horseSlug = partant.cheval.slug;
          const history = await this.equidiaService.getHorseHistory(horseSlug);
          
          if (history?.results && history.results.length > 0) {
            // Save history as JSON
            await this.horseRepository.saveHistory(horseSlug, history);
            
            // Ingest each history race (if not exists)
            for (const historyRace of history.results) {
              if (!historyRace.reunion?.date_reunion || !historyRace.reunion?.num_reunion || !historyRace.num_course_pmu) {
                continue;
              }
              
              const dateNoDashes = historyRace.reunion.date_reunion.replace(/-/g, '');
              const historyGuid = `${dateNoDashes}_R${historyRace.reunion.num_reunion}_C${historyRace.num_course_pmu}`;
              const exists = await this.raceRepository.findByGuid(historyGuid);
              
              if (!exists) {
                // Parse history race params
                const histDate = historyRace.reunion.date_reunion;
                const histReunion = `R${historyRace.reunion.num_reunion}`;
                const histCourse = `C${historyRace.num_course_pmu}`;
                const histParams = new RaceParams(histDate, histReunion, histCourse);
                
                try {
                  await this.ingestRaceUseCase.execute(histParams);
                } catch (err: any) {
                  // Ignore errors for history races
                  console.log(`[WORKER] Could not ingest history race ${historyGuid}: ${err.message}`);
                }
              }
            }
            
            horsesIngested++;
          }

          // Rate limit
          await this.delay(500);
        } catch (error: any) {
          console.error(`[WORKER] Failed to ingest horse ${partant.cheval.nom_cheval}:`, error.message);
        }
      }

      console.log(`[WORKER] ✓ Ingested ${horsesIngested} horse histories`);
    } catch (error: any) {
      console.error(`[WORKER] Deep ingest failed for ${guid}:`, error.message);
      throw error;
    }
  }

  private async createVectorStores() {
    console.log('[WORKER] Step 2: Create vector stores for new races');

    try {
      // Find races without vector stores (races with data but no vector DB)
      const races = await this.prisma.race.findMany({
        where: {
          OR: [
            { raceDetailsJson: { not: null } },
            { pronosticJson: { not: null } },
            { notesJson: { not: null } },
          ],
        },
        select: { guid: true },
        take: 50, // Limit to avoid overwhelming
      });

      console.log(`[WORKER] Found ${races.length} races to check for vector stores`);

      let created = 0;
      for (const race of races) {
        try {
          // Check if vector store exists
          const vectorStore = await this.vectorService.getVectorStoreForRace(race.guid);
          const count = await vectorStore.getDocumentCount();
          
          if (count === 0) {
            console.log(`[WORKER] Creating vector store for ${race.guid}`);
            await this.vectorService.ingestRace(race.guid);
            created++;
          }

          // Rate limit
          await this.delay(500);
        } catch (error: any) {
          console.error(`[WORKER] Failed to create vector store for ${race.guid}:`, error.message);
        }
      }

      console.log(`[WORKER] Created ${created} vector stores`);
    } catch (error: any) {
      console.error('[WORKER] Vector store creation failed:', error.message);
    }
  }

  private async cleanupOldVectorStores() {
    console.log('[WORKER] Step 3: Cleanup old vector stores');

    try {
      const cleaned = await this.vectorService.cleanupOldRaces();
      console.log(`[WORKER] Cleaned up ${cleaned} old vector stores`);
    } catch (error: any) {
      console.error('[WORKER] Cleanup failed:', error.message);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Run worker if executed directly
if (require.main === module) {
  const worker = new IngestionWorker();
  
  // Start worker (runs every 6 hours)
  worker.start(6).catch((error) => {
    console.error('[WORKER] Failed to start:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('[WORKER] Received SIGINT, shutting down...');
    worker.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('[WORKER] Received SIGTERM, shutting down...');
    worker.stop();
    process.exit(0);
  });
}

export default IngestionWorker;

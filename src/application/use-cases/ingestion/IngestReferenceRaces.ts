// Use Case: Deep Ingest Reference Races with Historical Data
import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import { IHorseRepository } from '../../../domain/interfaces/IHorseRepository';
import * as Types from '../../../shared/types/types';

export class IngestReferenceRacesUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private raceRepository: IRaceRepository,
    private horseRepository: IHorseRepository
  ) {}

  /**
   * Deep ingest a race with all data, horses, and their history races
   */
  async execute(params: RaceParams): Promise<{
    mainRace: boolean;
    referenceRaces: number;
    horsesIngested: number;
  }> {
    const guid = params.toGuid();
    console.log(`[DEEP INGESTION] Starting deep ingestion for race: ${guid}`);

    const result = {
      mainRace: false,
      referenceRaces: 0,
      horsesIngested: 0,
    };

    try {
      // 1. Fetch main race details
      const raceDetails = await this.equidiaService.getCourseDetails(params);
      await this.raceRepository.saveRaceDetails(raceDetails);
      result.mainRace = true;
      console.log(`[DEEP INGESTION] ✓ Saved main race: ${guid}`);

      // 2. Fetch all race data (tracking, interview, rapport, note, notule, pronostic)
      const [pronostic, interviews, notes, tracking, notule, references, pariSimple, rapports] =
        await Promise.allSettled([
          this.equidiaService.getPronostic(params),
          this.equidiaService.getInterview(params),
          this.equidiaService.getNote(params),
          raceDetails.tracked ? this.equidiaService.getTracking(params) : Promise.resolve(null),
          this.equidiaService.getNotule(params),
          this.equidiaService.getReferences(params),
          this.equidiaService.getPariSimple(params),
          this.equidiaService.getRapports(params)
        ]);

      // Save all race data (skip empty/failed responses)
      const savePromises: Promise<void>[] = [];
      if (pronostic.status === 'fulfilled' && pronostic.value && Object.keys(pronostic.value).length > 0) {
        savePromises.push(this.raceRepository.savePronostic(guid, pronostic.value));
      }
      if (interviews.status === 'fulfilled' && interviews.value && Object.keys(interviews.value).length > 0) {
        savePromises.push(this.raceRepository.saveInterviews(guid, interviews.value));
      }
      if (notes.status === 'fulfilled' && notes.value && Array.isArray(notes.value) && notes.value.length > 0) {
        savePromises.push(this.raceRepository.saveNotes(guid, notes.value));
      }
      if (tracking.status === 'fulfilled' && tracking.value && Array.isArray(tracking.value) && tracking.value.length > 0) {
        savePromises.push(this.raceRepository.saveTracking(guid, tracking.value));
      }
      if (notule.status === 'fulfilled' && notule.value && Object.keys(notule.value).length > 0) {
        savePromises.push(this.raceRepository.saveNotule(guid, notule.value));
      }
      if (references.status === 'fulfilled' && references.value && Object.keys(references.value).length > 0) {
        savePromises.push(this.raceRepository.saveReferences(guid, references.value));
      }
      if (pariSimple.status === 'fulfilled' && pariSimple.value && Array.isArray(pariSimple.value) && pariSimple.value.length > 0) {
        savePromises.push(this.raceRepository.savePariSimple(guid, pariSimple.value));
      }
      if (rapports.status === 'fulfilled' && rapports.value && Array.isArray(rapports.value) && rapports.value.length > 0) {
        savePromises.push(this.raceRepository.saveRapports(guid, rapports.value));
      }
      await Promise.all(savePromises);
      console.log(`[DEEP INGESTION] ✓ Saved all race data for: ${guid}`);

      // 3. Ingest all horses from the race with their history
      const historyRaceGuids = new Set<string>();
      
      for (const partant of raceDetails.partants) {
        try {
          const horseSlug = partant.cheval.slug;
          
          // Save basic horse info
          await this.horseRepository.saveHorse({
            uuid: partant.cheval.uuid,
            slug: horseSlug,
            nomCheval: partant.cheval.nom_cheval,
            sexeCheval: partant.cheval.sexe_cheval,
            ageCheval: partant.cheval.age_cheval,
            musique: partant.cheval.musique || '',
            gainsCarriere: partant.cheval.gains_carriere || 0,
          });

          // Fetch and save horse history
          const history = await this.equidiaService.getHorseHistory(horseSlug);
          await this.horseRepository.saveHistory(horseSlug, history);

          // Fetch and save horse stats
          const stats = await this.equidiaService.getHorseStats(horseSlug);
          await this.horseRepository.saveStats(horseSlug, stats);

          // Collect all race info from history (has num_reunion and num_course_pmu)
          if (history.results && Array.isArray(history.results)) {
            for (const historyRace of history.results) {
              if (historyRace.reunion?.date_reunion && historyRace.reunion?.num_reunion && historyRace.num_course_pmu) {
                // Format: 20251125_R1_C1 (no dashes in date)
                const dateNoDashes = historyRace.reunion.date_reunion.replace(/-/g, '');
                const raceKey = `${dateNoDashes}_R${historyRace.reunion.num_reunion}_C${historyRace.num_course_pmu}`;
                historyRaceGuids.add(raceKey);
              }
            }
          }

          result.horsesIngested++;
          console.log(`[DEEP INGESTION] ✓ Ingested horse: ${horseSlug} (${history.results?.length || 0} history races)`);
        } catch (error: any) {
          console.error(`[DEEP INGESTION] Failed to ingest horse:`, error.message);
        }
      }

      // 4. Fetch all history races with their data
      console.log(`[DEEP INGESTION] Found ${historyRaceGuids.size} unique history races to ingest`);
      
      for (const historyGuid of historyRaceGuids) {
        try {
          // Skip if already ingested (main race)
          if (historyGuid === guid) continue;

          // Parse history race GUID (format: 20251125_R1_C3)
          const guidParts = historyGuid.split('_');
          if (guidParts.length !== 3) continue;

          // Convert date from 20251125 to 2025-11-25
          const dateStr = guidParts[0];
          const histDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
          const histReunion = guidParts[1]; // R1
          const histCourse = guidParts[2]; // C3

          const histParams = new RaceParams(histDate, histReunion, histCourse);

          // Fetch history race details
          const histRaceDetails = await this.equidiaService.getCourseDetails(histParams);
          await this.raceRepository.saveRaceDetails(histRaceDetails);

          // Fetch all data for history race (skip empty/failed responses)
          const [histTracking, histNotule, histRapports] = await Promise.allSettled([
            histRaceDetails.tracked ? this.equidiaService.getTracking(histParams) : Promise.resolve(null),
            this.equidiaService.getNotule(histParams),
            this.equidiaService.getRapports(histParams)
          ]);

          const histSavePromises: Promise<void>[] = [];
          if (histTracking.status === 'fulfilled' && histTracking.value && Array.isArray(histTracking.value) && histTracking.value.length > 0) {
            histSavePromises.push(this.raceRepository.saveTracking(historyGuid, histTracking.value));
          }
          if (histNotule.status === 'fulfilled' && histNotule.value && Object.keys(histNotule.value).length > 0) {
            histSavePromises.push(this.raceRepository.saveNotule(historyGuid, histNotule.value));
          }
          if (histRapports.status === 'fulfilled' && histRapports.value && Array.isArray(histRapports.value) && histRapports.value.length > 0) {
            histSavePromises.push(this.raceRepository.saveRapports(historyGuid, histRapports.value));
          }
          await Promise.all(histSavePromises);

          result.referenceRaces++;
          console.log(`[DEEP INGESTION] ✓ Ingested history race: ${historyGuid}`);

          // Small delay to avoid overwhelming API
          await this.delay(2000);
        } catch (error: any) {
          console.error(`[DEEP INGESTION] Failed to ingest history race ${historyGuid}:`, error.message);
        }
      }

      console.log(`[DEEP INGESTION] ✓ Completed deep ingestion for ${guid}`);
      console.log(`  - Main race: ${result.mainRace ? 'Yes' : 'No'}`);
      console.log(`  - History races: ${result.referenceRaces}`);
      console.log(`  - Horses: ${result.horsesIngested}`);

      return result;
    } catch (error: any) {
      console.error(`[DEEP INGESTION] ✗ Failed deep ingestion for ${guid}:`, error.message);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

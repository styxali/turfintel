import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IHorseRepository } from '../../../domain/interfaces/IHorseRepository';
import * as Types from '../../../shared/types/types';

// Minimal horse data response
export interface MinimalHorseData {
  recentRaces: Array<{
    date: string;
    course: string;
    distance: number;
    rank: string;
    position?: number;
    gap: string;
    jockey: string;
    trainer?: string;
    weight: number;
    rating: number;
    condition: string;
    raceName?: string;
    comment?: string;
  }>;
  stats?: {
    totalRaces: number;
    wins: number;
    places: number;
    earnings: number;
    winRate: number;
    placeRate: number;
  };
  nextRace?: {
    date: string;
    course: string;
    distance: number;
  };
  chevalCalculated?: string;
  trainerCalculated?: string;
  monteCalculated?: string;
}

export interface BatchHorseDataResponse {
  [slug: string]: MinimalHorseData;
}

export class GetBatchHorseDataUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private horseRepository: IHorseRepository
  ) {}

  async execute(
    slugs: string[],
    options: {
      includeStats?: boolean;
      includeNextRace?: boolean;
      maxRaces?: number;
    } = {}
  ): Promise<BatchHorseDataResponse> {
    const {
      includeStats = true,
      includeNextRace = true,
      maxRaces = 5
    } = options;

    const cacheKey = `horses:batch:${slugs.sort().join(',')}:${maxRaces}`;

    // Try cache first (30 minutes)
    const cached = await this.cacheManager.get<BatchHorseDataResponse>(cacheKey);
    if (cached) {
      console.log(`[BATCH HORSES] Cache hit for ${slugs.length} horses`);
      return cached;
    }

    console.log(`[BATCH HORSES] Processing ${slugs.length} horses`);

    // Process horses in batches of 5 to avoid overwhelming the API
    const BATCH_SIZE = 5;
    const result: BatchHorseDataResponse = {};

    for (let i = 0; i < slugs.length; i += BATCH_SIZE) {
      const batch = slugs.slice(i, i + BATCH_SIZE);
      
      const batchResults = await Promise.allSettled(
        batch.map(slug => this.fetchHorseData(slug, maxRaces, includeStats, includeNextRace))
      );

      batchResults.forEach((promiseResult, index) => {
        const slug = batch[index];
        if (promiseResult.status === 'fulfilled') {
          result[slug] = promiseResult.value;
        } else {
          console.error(`[BATCH HORSES] Failed to fetch ${slug}:`, promiseResult.reason);
          result[slug] = {
            recentRaces: [],
            stats: undefined,
            nextRace: undefined
          };
        }
      });
    }

    // Cache the result
    await this.cacheManager.set(cacheKey, result, 30);

    return result;
  }

  private async fetchHorseData(
    slug: string,
    maxRaces: number,
    includeStats: boolean,
    includeNextRace: boolean
  ): Promise<MinimalHorseData> {
    // Check database first
    const dbHorse = await this.horseRepository.findBySlug(slug);
    
    // If we have fresh data in DB, use it
    if (dbHorse && this.isDataFresh(dbHorse)) {
      return this.buildFromDatabase(dbHorse, maxRaces, includeStats, includeNextRace);
    }

    // Fetch from API
    const promises: [
      Promise<Types.HorseHistoryResponse>,
      Promise<Types.HorseStatsResponse> | Promise<undefined>,
      Promise<Types.HorseLastOrNextResponse> | Promise<undefined>
    ] = [
      this.equidiaService.getHorseHistory(slug, { range: [0, maxRaces - 1] }),
      includeStats ? this.equidiaService.getHorseStats(slug) : Promise.resolve(undefined),
      this.equidiaService.getHorseLastOrNext(slug) // Always fetch to get form data
    ];

    const [history, stats, lastOrNext] = await Promise.allSettled(promises);

    // Extract form data from lastOrNext response
    let formData: { chevalCalculated?: string; trainerCalculated?: string; monteCalculated?: string } = {};
    if (lastOrNext.status === 'fulfilled' && lastOrNext.value) {
      const musiques = lastOrNext.value.musiques;
      if (musiques) {
        formData = {
          chevalCalculated: musiques.cheval_calculated,
          trainerCalculated: musiques.trainer_calculated,
          monteCalculated: musiques.monte_calculated,
        };
      }
    }

    // Save to database (async, don't wait)
    if (history.status === 'fulfilled') {
      // Get basic horse info from history
      const firstRace = history.value.results[0];
      if (firstRace) {
        this.horseRepository.saveHorse({
          uuid: `uuid-${slug}`,
          slug: slug,
          nomCheval: slug,
          sexeCheval: 'M',
          ageCheval: 0,
          musique: firstRace.selected_partant_info?.musique || '',
          gainsCarriere: 0,
          ...formData,
        }).catch(err => {
          console.error(`[BATCH HORSES] Failed to save horse ${slug}:`, err.message);
        });
      }

      this.horseRepository.saveHistory(slug, history.value).catch(err => {
        console.error(`[BATCH HORSES] Failed to save history for ${slug}:`, err.message);
      });
    }

    if (stats.status === 'fulfilled' && stats.value) {
      this.horseRepository.saveStats(slug, stats.value).catch(err => {
        console.error(`[BATCH HORSES] Failed to save stats for ${slug}:`, err.message);
      });
    }

    // Build minimal response
    const historyData = history.status === 'fulfilled' ? history.value : { results: [] };
    const statsData = stats.status === 'fulfilled' ? stats.value : undefined;
    const nextRaceData = lastOrNext.status === 'fulfilled' ? lastOrNext.value : undefined;

    return {
      recentRaces: this.extractRecentRaces(historyData, maxRaces),
      stats: statsData ? this.extractStats(statsData) : undefined,
      nextRace: includeNextRace && nextRaceData ? this.extractNextRace(nextRaceData) : undefined,
      ...formData,
    };
  }

  private isDataFresh(horse: any): boolean {
    // If no history data, not fresh
    if (!horse.history) return false;
    if (!horse.updatedAt) return false;
    
    const now = new Date();
    const updatedAt = new Date(horse.updatedAt);
    const dataAge = now.getTime() - updatedAt.getTime();
    
    // Data should be < 24 hours old
    return dataAge < 24 * 60 * 60 * 1000;
  }

  private buildFromDatabase(
    dbHorse: any,
    maxRaces: number,
    includeStats: boolean,
    includeNextRace: boolean
  ): MinimalHorseData {
    const history = dbHorse.history as Types.HorseHistoryResponse | undefined;
    const stats = dbHorse.stats as Types.HorseStatsResponse | undefined;

    return {
      recentRaces: history ? this.extractRecentRaces(history, maxRaces) : [],
      stats: includeStats && stats ? this.extractStats(stats) : undefined,
      nextRace: includeNextRace ? undefined : undefined, // TODO: Extract from DB if available
      chevalCalculated: dbHorse.chevalCalculated,
      trainerCalculated: dbHorse.trainerCalculated,
      monteCalculated: dbHorse.monteCalculated,
    };
  }

  private extractRecentRaces(history: Types.HorseHistoryResponse | undefined, maxRaces: number): MinimalHorseData['recentRaces'] {
    if (!history || !history.results || history.results.length === 0) {
      return [];
    }

    return history.results.slice(0, maxRaces).map(race => {
      const rankStr = race.selected_partant_info?.texte_place_arrivee || (race as any).num_place_arrivee || '';
      const position = parseInt(rankStr);
      
      return {
        date: (race as any).date_reunion || race.reunion?.date_reunion || '',
        course: race.reunion?.lib_reunion || race.libcourt_prix_course || '',
        distance: race.distance || 0,
        rank: rankStr,
        position: isNaN(position) ? undefined : position,
        gap: race.selected_partant_info?.temps_part || '',
        jockey: race.selected_partant_info?.nom_monte || '',
        trainer: '', // Trainer not in selected_partant_info
        weight: race.selected_partant_info?.pds_calc_hand_partant || 0,
        rating: race.selected_partant_info?.valeur || 0,
        condition: race.etat_terrain || '',
        raceName: race.libcourt_prix_course,
        comment: race.selected_partant_info?.notule_partant_text
      };
    });
  }

  private extractStats(stats: Types.HorseStatsResponse): MinimalHorseData['stats'] {
    const carriere = stats.carriere?.all;
    if (!carriere) return undefined;

    const totalRaces = carriere.nbCourse || 0;
    const wins = carriere.nbVictoire || 0;
    const places = carriere.nbPlace || 0;

    return {
      totalRaces,
      wins,
      places,
      earnings: (carriere as any).gains || 0,
      winRate: totalRaces > 0 ? Math.round((wins / totalRaces) * 100 * 10) / 10 : 0,
      placeRate: totalRaces > 0 ? Math.round((places / totalRaces) * 100 * 10) / 10 : 0
    };
  }

  private extractNextRace(lastOrNext: Types.HorseLastOrNextResponse): MinimalHorseData['nextRace'] {
    // TODO: Extract next race info from response
    return undefined;
  }
}

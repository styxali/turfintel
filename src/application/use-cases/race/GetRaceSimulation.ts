import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';

// Minimal simulation response (60KB vs 255KB)
export interface RaceSimulationResponse {
  race: {
    guid: string;
    name: string;
    distance: number;
    ground: string;
    hippodrome: string;
    date: string;
    conditions?: string;
  };
  runners: Array<{
    number: number;
    name: string;
    slug: string;
    jockey: string;
    trainer: string;
    silks: string;
    music: string;
    age: number;
    sex: string;
    gains: number;
    rating: number;
    draw?: number;
    finishGap?: string;
  }>;
  tracking: Array<{
    number: number;
    rank: string;
    vmax: number;
    time: string;
    sectional600: string;
    sectional200: string;
    sectional100: string;
    distanceTraveled: number;
    midPosition: number;
    gapToWinner: number;
  }>;
  analysis: Array<{
    number: number;
    commentary: string;
    impressionActive: boolean;
  }>;
  interviews: Array<{
    number: number;
    person: string;
    note?: number;
    text: string;
  }>;
}

export class GetRaceSimulationUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(params: RaceParams): Promise<RaceSimulationResponse> {
    const cacheKey = `race:simulation:${params.toGuid()}`;
    const guid = params.toGuid();

    // Try cache first (30 minutes for simulation data)
    const cached = await this.cacheManager.get<RaceSimulationResponse>(cacheKey);
    if (cached) {
      console.log(`[SIMULATION] Cache hit for ${guid}`);
      return cached;
    }

    // Try database second
    const dbRace = await this.raceRepository.findByGuid(guid);
    if (dbRace && this.hasSimulationData(dbRace)) {
      console.log(`[SIMULATION] Database hit for ${guid}`);
      const simulation = await this.buildSimulationFromDatabase(dbRace);
      if (simulation) {
        await this.cacheManager.set(cacheKey, simulation, 30);
        return simulation;
      }
    }

    // Fetch from API only if needed
    console.log(`[SIMULATION] Fetching from API for ${guid}`);
    const simulation = await this.fetchAndBuildSimulation(params);

    // Cache the result
    await this.cacheManager.set(cacheKey, simulation, 30);

    return simulation;
  }

  private hasSimulationData(race: any): boolean {
    return !!(race.raceDetails && race.tracking && (race.notule || race.interviews));
  }

  private async buildSimulationFromDatabase(dbRace: any): Promise<RaceSimulationResponse | null> {
    try {
      const raceDetails = dbRace.raceDetails as Types.RaceDetailResponse;
      const tracking = dbRace.tracking as Types.TrackingResponse;
      const notule = dbRace.notule as Types.NotuleResponse | undefined;
      const interviews = dbRace.interviews as Types.InterviewResponse | undefined;

      if (!raceDetails || !tracking) return null;

      return {
        race: {
          guid: dbRace.guid,
          name: raceDetails.libcourt_prix_course,
          distance: raceDetails.distance,
          ground: raceDetails.etat_terrain,
          hippodrome: raceDetails.reunion.hippodrome.name,
          date: raceDetails.reunion.date_reunion,
          conditions: raceDetails.conditions_txt_course
        },
        runners: raceDetails.partants.map(p => ({
          number: p.num_partant,
          name: p.cheval.nom_cheval,
          slug: p.cheval.slug,
          jockey: p.monte?.nom_monte || '',
          trainer: p.entraineur?.nom_entraineur || p.cheval.entraineur?.nom_entraineur || '',
          silks: p.silks_path,
          music: p.cheval.musique,
          age: p.cheval.age_cheval || p.age_cheval || 0,
          sex: p.cheval.sexe_cheval || p.sexe_cheval || '',
          gains: p.cheval.gains_carriere,
          rating: p.cheval.valeur || p.valeur || 0,
          draw: p.place_corde_partant ? parseInt(p.place_corde_partant) : undefined,
          finishGap: p.temps_part
        })),
        tracking: Array.isArray(tracking) ? tracking.map(t => ({
          number: t.num_partant,
          rank: t.num_place_arrivee,
          vmax: t.interne_tracking_gps?.vmax || 0,
          time: t.interne_tracking_gps?.temps_officiel || '',
          sectional600: t.interne_tracking_gps?.derniers_600m || '',
          sectional200: t.interne_tracking_gps?.derniers_200m || '',
          sectional100: t.interne_tracking_gps?.derniers_100m || '',
          distanceTraveled: t.interne_tracking_gps?.distance_parcouru || 0,
          midPosition: t.interne_tracking_gps?.pos_mi_course || 0,
          gapToWinner: t.interne_tracking_gps?.parcouru_vs_1er || 0
        })) : [],
        analysis: notule?.notule_partants ? notule.notule_partants.map(n => ({
          number: n.partant.num_partant,
          commentary: n.texte,
          impressionActive: n.impression_active
        })) : [],
        interviews: interviews?.interview_partants ? interviews.interview_partants.map(i => ({
          number: i.partant.num_partant,
          person: i.personne,
          note: i.note,
          text: i.texte
        })) : []
      };
    } catch (error) {
      console.error('[SIMULATION] Error building from database:', error);
      return null;
    }
  }

  private async fetchAndBuildSimulation(params: RaceParams): Promise<RaceSimulationResponse> {
    // Fetch only what we need in parallel
    const [raceDetails, tracking, notule, interviews] = await Promise.allSettled([
      this.equidiaService.getCourseDetails(params),
      this.equidiaService.getTracking(params),
      this.equidiaService.getNotule(params),
      this.equidiaService.getInterview(params)
    ]);

    if (raceDetails.status !== 'fulfilled') {
      throw new Error('Failed to fetch race details');
    }

    const details = raceDetails.value;
    const guid = params.toGuid();

    // Save to database (async, don't wait)
    this.raceRepository.saveRaceDetails(details).catch(err => {
      console.error('[SIMULATION] Failed to save race details:', err.message);
    });

    if (tracking.status === 'fulfilled' && tracking.value) {
      this.raceRepository.saveTracking(guid, tracking.value).catch(err => {
        console.error('[SIMULATION] Failed to save tracking:', err.message);
      });
    }

    if (notule.status === 'fulfilled' && notule.value) {
      this.raceRepository.saveNotule(guid, notule.value).catch(err => {
        console.error('[SIMULATION] Failed to save notule:', err.message);
      });
    }

    if (interviews.status === 'fulfilled' && interviews.value) {
      this.raceRepository.saveInterviews(guid, interviews.value).catch(err => {
        console.error('[SIMULATION] Failed to save interviews:', err.message);
      });
    }

    // Build minimal response
    const trackingData = tracking.status === 'fulfilled' && tracking.value ? tracking.value : [];
    const notuleData = notule.status === 'fulfilled' && notule.value ? notule.value : undefined;
    const interviewsData = interviews.status === 'fulfilled' && interviews.value ? interviews.value : undefined;

    return {
      race: {
        guid,
        name: details.libcourt_prix_course,
        distance: details.distance,
        ground: details.etat_terrain,
        hippodrome: details.reunion.hippodrome.name,
        date: details.reunion.date_reunion,
        conditions: details.conditions_txt_course
      },
      runners: details.partants.map(p => ({
        number: p.num_partant,
        name: p.cheval.nom_cheval,
        slug: p.cheval.slug,
        jockey: p.monte?.nom_monte || '',
        trainer: p.entraineur?.nom_entraineur || p.cheval.entraineur?.nom_entraineur || '',
        silks: p.silks_path,
        music: p.cheval.musique,
        age: p.cheval.age_cheval || p.age_cheval || 0,
        sex: p.cheval.sexe_cheval || p.sexe_cheval || '',
        gains: p.cheval.gains_carriere,
        rating: p.cheval.valeur || p.valeur || 0,
        draw: p.place_corde_partant ? parseInt(p.place_corde_partant) : undefined,
        finishGap: p.temps_part
      })),
      tracking: Array.isArray(trackingData) ? trackingData.map(t => ({
        number: t.num_partant,
        rank: t.num_place_arrivee,
        vmax: t.interne_tracking_gps?.vmax || 0,
        time: t.interne_tracking_gps?.temps_officiel || '',
        sectional600: t.interne_tracking_gps?.derniers_600m || '',
        sectional200: t.interne_tracking_gps?.derniers_200m || '',
        sectional100: t.interne_tracking_gps?.derniers_100m || '',
        distanceTraveled: t.interne_tracking_gps?.distance_parcouru || 0,
        midPosition: t.interne_tracking_gps?.pos_mi_course || 0,
        gapToWinner: t.interne_tracking_gps?.parcouru_vs_1er || 0
      })) : [],
      analysis: notuleData?.notule_partants ? notuleData.notule_partants.map(n => ({
        number: n.partant.num_partant,
        commentary: n.texte,
        impressionActive: n.impression_active
      })) : [],
      interviews: interviewsData?.interview_partants ? interviewsData.interview_partants.map(i => ({
        number: i.partant.num_partant,
        person: i.personne,
        note: i.note,
        text: i.texte
      })) : []
    };
  }
}

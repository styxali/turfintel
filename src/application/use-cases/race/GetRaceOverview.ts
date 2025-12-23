import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';

// Minimal race overview response (80KB vs 205KB)
export interface RaceOverviewResponse {
  race: {
    guid: string;
    name: string;
    distance: number;
    discipline: string;
    ground: string;
    time: string;
    number: number;
    hippodrome: string;
    date: string;
    prize?: string;
    category?: string;
    tracked: boolean;
  };
  runners: Array<{
    number: number;
    horse: {
      name: string;
      slug: string;
      uuid: string;
      music: string;
      gains: number;
      rating: number;
      age: number;
      sex: string;
    };
    jockey: string;
    trainer: string;
    silks: string;
    draw?: number;
    weight: number;
  }>;
  pronostic?: {
    bases: number[];
    chances: number[];
    outsiders: number[];
    dismissed: number[];
    analyst: {
      name: string;
      photo?: string;
    };
    difficulty: number;
    summary?: string;
  };
  notes: Array<{
    number: number;
    rating: number;
    form: number;
    aptitude: number;
    conditions: number;
    tandem: number;
    terrain: number;
  }>;
}

export class GetRaceOverviewUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(params: RaceParams): Promise<RaceOverviewResponse> {
    const cacheKey = `race:overview:${params.toGuid()}`;
    const guid = params.toGuid();

    // Try cache first (15 minutes for overview)
    const cached = await this.cacheManager.get<RaceOverviewResponse>(cacheKey);
    if (cached) {
      console.log(`[OVERVIEW] Cache hit for ${guid}`);
      return cached;
    }

    // Try database second
    const dbRace = await this.raceRepository.findByGuid(guid);
    if (dbRace && this.isDataFresh(dbRace)) {
      console.log(`[OVERVIEW] Database hit for ${guid}`);
      const overview = await this.buildOverviewFromDatabase(dbRace);
      if (overview) {
        await this.cacheManager.set(cacheKey, overview, 15);
        return overview;
      }
    }

    // Fetch from API only if needed
    console.log(`[OVERVIEW] Fetching from API for ${guid}`);
    const overview = await this.fetchAndBuildOverview(params);

    // Cache the result
    await this.cacheManager.set(cacheKey, overview, 15);

    return overview;
  }

  private isDataFresh(race: any): boolean {
    const now = new Date();
    const raceTime = new Date(race.heureDepartCourse);
    const updatedAt = new Date(race.updatedAt);

    // If race is finished, data is always fresh
    if (raceTime < now) {
      return true;
    }

    // If race is upcoming, data should be < 1 hour old
    const dataAge = now.getTime() - updatedAt.getTime();
    return dataAge < 60 * 60 * 1000; // 1 hour
  }

  private async buildOverviewFromDatabase(dbRace: any): Promise<RaceOverviewResponse | null> {
    try {
      const raceDetails = dbRace.raceDetails as Types.RaceDetailResponse;
      const pronostic = dbRace.pronostic as Types.PronosticResponse | undefined;
      const notes = dbRace.notes as Types.NoteResponse | undefined;

      if (!raceDetails) return null;

      return {
        race: {
          guid: dbRace.guid,
          name: raceDetails.libcourt_prix_course,
          distance: raceDetails.distance,
          discipline: raceDetails.discipline,
          ground: raceDetails.etat_terrain,
          time: raceDetails.heure_depart_course,
          number: raceDetails.num_course_pmu,
          hippodrome: raceDetails.reunion.hippodrome.name,
          date: raceDetails.reunion.date_reunion,
          prize: raceDetails.montant_total_allocation,
          category: raceDetails.categ_course,
          tracked: raceDetails.tracked || false
        },
        runners: raceDetails.partants.map(p => ({
          number: p.num_partant,
          horse: {
            name: p.cheval.nom_cheval,
            slug: p.cheval.slug,
            uuid: p.cheval.uuid,
            music: p.cheval.musique,
            gains: p.cheval.gains_carriere,
            rating: p.cheval.valeur || p.valeur || 0,
            age: p.cheval.age_cheval || p.age_cheval || 0,
            sex: p.cheval.sexe_cheval || p.sexe_cheval || ''
          },
          jockey: p.monte?.nom_monte || '',
          trainer: p.entraineur?.nom_entraineur || p.cheval.entraineur?.nom_entraineur || '',
          silks: p.silks_path,
          draw: p.place_corde_partant ? parseInt(p.place_corde_partant) : undefined,
          weight: p.pds_calc_hand_partant || p.pds_cond_monte_partant || 0
        })),
        pronostic: pronostic ? {
          bases: pronostic.bases || [],
          chances: pronostic.belles_chances || [],
          outsiders: pronostic.outsiders || [],
          dismissed: pronostic.delaisses || [],
          analyst: {
            name: `${pronostic.creator.firstname} ${pronostic.creator.lastname}`,
            photo: pronostic.creator.photo_url
          },
          difficulty: pronostic.difficulty,
          summary: pronostic.chapeau
        } : undefined,
        notes: (notes || []).map(n => ({
          number: n.num_partant,
          rating: n.interne_note_partant?.note_equidia || 0,
          form: n.interne_note_partant?.forme_cheval || 0,
          aptitude: n.interne_note_partant?.aptitudes || 0,
          conditions: n.interne_note_partant?.conditions || 0,
          tandem: n.interne_note_partant?.tandem || 0,
          terrain: n.interne_note_partant?.apt_terrain || 0
        }))
      };
    } catch (error) {
      console.error('[OVERVIEW] Error building from database:', error);
      return null;
    }
  }

  private async fetchAndBuildOverview(params: RaceParams): Promise<RaceOverviewResponse> {
    // Fetch only what we need in parallel
    const [raceDetails, pronostic, notes] = await Promise.allSettled([
      this.equidiaService.getCourseDetails(params),
      this.equidiaService.getPronostic(params),
      this.equidiaService.getNote(params)
    ]);

    if (raceDetails.status !== 'fulfilled') {
      throw new Error('Failed to fetch race details');
    }

    const details = raceDetails.value;
    const guid = params.toGuid();

    // Save to database (async, don't wait)
    this.raceRepository.saveRaceDetails(details).catch(err => {
      console.error('[OVERVIEW] Failed to save race details:', err.message);
    });

    if (pronostic.status === 'fulfilled' && pronostic.value) {
      this.raceRepository.savePronostic(guid, pronostic.value).catch(err => {
        console.error('[OVERVIEW] Failed to save pronostic:', err.message);
      });
    }

    if (notes.status === 'fulfilled' && notes.value) {
      this.raceRepository.saveNotes(guid, notes.value).catch(err => {
        console.error('[OVERVIEW] Failed to save notes:', err.message);
      });
    }

    // Build minimal response
    return {
      race: {
        guid,
        name: details.libcourt_prix_course,
        distance: details.distance,
        discipline: details.discipline,
        ground: details.etat_terrain,
        time: details.heure_depart_course,
        number: details.num_course_pmu,
        hippodrome: details.reunion.hippodrome.name,
        date: details.reunion.date_reunion,
        prize: details.montant_total_allocation,
        category: details.categ_course,
        tracked: details.tracked || false
      },
      runners: details.partants.map(p => ({
        number: p.num_partant,
        horse: {
          name: p.cheval.nom_cheval,
          slug: p.cheval.slug,
          uuid: p.cheval.uuid,
          music: p.cheval.musique,
          gains: p.cheval.gains_carriere,
          rating: p.cheval.valeur || p.valeur || 0,
          age: p.cheval.age_cheval || p.age_cheval || 0,
          sex: p.cheval.sexe_cheval || p.sexe_cheval || ''
        },
        jockey: p.monte?.nom_monte || '',
        trainer: p.entraineur?.nom_entraineur || p.cheval.entraineur?.nom_entraineur || '',
        silks: p.silks_path,
        draw: p.place_corde_partant ? parseInt(p.place_corde_partant) : undefined,
        weight: p.pds_calc_hand_partant || p.pds_cond_monte_partant || 0
      })),
      pronostic: pronostic.status === 'fulfilled' && pronostic.value ? {
        bases: pronostic.value.bases || [],
        chances: pronostic.value.belles_chances || [],
        outsiders: pronostic.value.outsiders || [],
        dismissed: pronostic.value.delaisses || [],
        analyst: {
          name: `${pronostic.value.creator.firstname} ${pronostic.value.creator.lastname}`,
          photo: pronostic.value.creator.photo_url
        },
        difficulty: pronostic.value.difficulty,
        summary: pronostic.value.chapeau
      } : undefined,
      notes: notes.status === 'fulfilled' && notes.value ? notes.value.map(n => ({
        number: n.num_partant,
        rating: n.interne_note_partant?.note_equidia || 0,
        form: n.interne_note_partant?.forme_cheval || 0,
        aptitude: n.interne_note_partant?.aptitudes || 0,
        conditions: n.interne_note_partant?.conditions || 0,
        tandem: n.interne_note_partant?.tandem || 0,
        terrain: n.interne_note_partant?.apt_terrain || 0
      })) : []
    };
  }
}

import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';

// Complete race data for AI/LLM processing
export interface RaceForAIResponse {
  race: {
    guid: string;
    name: string;
    date: string;
    time: string;
    hippodrome: string;
    discipline: string;
    distance: number;
    ground: string;
    prize: string;
    category: string;
    conditions: string;
  };
  runners: Array<{
    number: number;
    name: string;
    slug: string;
    age: number;
    sex: string;
    music: string;
    gains: number;
    rating: number;
    jockey: string;
    trainer: string;
    weight: number;
    draw?: number;
    recentForm: Array<{
      date: string;
      course: string;
      distance: number;
      rank: string;
      jockey: string;
      comment?: string;
    }>;
    stats: {
      totalRaces: number;
      wins: number;
      places: number;
      winRate: number;
    };
  }>;
  expertAnalysis?: {
    bases: number[];
    chances: number[];
    outsiders: number[];
    dismissed: number[];
    analyst: string;
    difficulty: number;
    summary?: string;
  };
  notes: Array<{
    number: number;
    rating: number;
    form: number;
    aptitude: number;
  }>;
  context: {
    referenceRaces: Array<{
      date: string;
      name: string;
      commonRunners: number;
    }>;
  };
}

export class GetRaceForAIUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(params: RaceParams): Promise<RaceForAIResponse> {
    const guid = params.toGuid();
    const cacheKey = `race:ai:${guid}`;

    // Try cache (30 min)
    const cached = await this.cacheManager.get<RaceForAIResponse>(cacheKey);
    if (cached) return cached;

    // Fetch all data in parallel
    const [raceDetails, pronostic, notes, references] = await Promise.allSettled([
      this.equidiaService.getCourseDetails(params),
      this.equidiaService.getPronostic(params),
      this.equidiaService.getNote(params),
      this.equidiaService.getReferences(params)
    ]);

    if (raceDetails.status !== 'fulfilled') {
      throw new Error('Failed to fetch race details');
    }

    const details = raceDetails.value;

    // Fetch horse data for all runners (limited to 5 races each)
    const horsePromises = details.partants.map(async (p) => {
      try {
        const [history, stats] = await Promise.allSettled([
          this.equidiaService.getHorseHistory(p.cheval.slug, { range: [0, 4] }),
          this.equidiaService.getHorseStats(p.cheval.slug)
        ]);

        return {
          slug: p.cheval.slug,
          history: history.status === 'fulfilled' ? history.value : null,
          stats: stats.status === 'fulfilled' ? stats.value : null
        };
      } catch {
        return { slug: p.cheval.slug, history: null, stats: null };
      }
    });

    const horseData = await Promise.all(horsePromises);

    // Build response
    const response: RaceForAIResponse = {
      race: {
        guid,
        name: details.libcourt_prix_course,
        date: details.reunion.date_reunion,
        time: details.heure_depart_course,
        hippodrome: details.reunion.hippodrome.name,
        discipline: details.discipline,
        distance: details.distance,
        ground: details.etat_terrain,
        prize: details.montant_total_allocation || '',
        category: details.categ_course,
        conditions: details.conditions_txt_course || ''
      },
      runners: details.partants.map(p => {
        const hData = horseData.find(h => h.slug === p.cheval.slug);
        const history = hData?.history?.results || [];
        const stats = hData?.stats?.carriere?.all;

        return {
          number: p.num_partant,
          name: p.cheval.nom_cheval,
          slug: p.cheval.slug,
          age: p.cheval.age_cheval || p.age_cheval || 0,
          sex: p.cheval.sexe_cheval || p.sexe_cheval || '',
          music: p.cheval.musique || '',
          gains: p.cheval.gains_carriere || 0,
          rating: p.cheval.valeur || p.valeur || 0,
          jockey: p.monte?.nom_monte || '',
          trainer: p.entraineur?.nom_entraineur || '',
          weight: p.pds_calc_hand_partant || 0,
          draw: p.place_corde_partant ? parseInt(p.place_corde_partant) : undefined,
          recentForm: history.slice(0, 5).map((r: any) => ({
            date: r.date_reunion || r.reunion?.date_reunion || '',
            course: r.reunion?.lib_reunion || '',
            distance: r.distance || 0,
            rank: r.selected_partant_info?.texte_place_arrivee || '',
            jockey: r.selected_partant_info?.nom_monte || '',
            comment: r.selected_partant_info?.notule_partant_text || ''
          })),
          stats: {
            totalRaces: stats?.nbCourse || 0,
            wins: stats?.nbVictoire || 0,
            places: stats?.nbPlace || 0,
            winRate: stats?.nbCourse ? Math.round((stats.nbVictoire / stats.nbCourse) * 100) : 0
          }
        };
      }),
      expertAnalysis: pronostic.status === 'fulfilled' && pronostic.value ? {
        bases: pronostic.value.bases || [],
        chances: pronostic.value.belles_chances || [],
        outsiders: pronostic.value.outsiders || [],
        dismissed: pronostic.value.delaisses || [],
        analyst: `${pronostic.value.creator.firstname} ${pronostic.value.creator.lastname}`,
        difficulty: pronostic.value.difficulty,
        summary: pronostic.value.chapeau
      } : undefined,
      notes: notes.status === 'fulfilled' && notes.value ? notes.value.map(n => ({
        number: n.num_partant,
        rating: n.interne_note_partant?.note_equidia || 0,
        form: n.interne_note_partant?.forme_cheval || 0,
        aptitude: n.interne_note_partant?.aptitudes || 0
      })) : [],
      context: {
        referenceRaces: references.status === 'fulfilled' && references.value?.results?.most_common
          ? references.value.results.most_common.slice(0, 3).map((r: any) => ({
              date: r.date_reunion,
              name: r.libcourt_prix_course,
              commonRunners: r.common_runners_count || 0
            }))
          : []
      }
    };

    // Cache for 30 minutes
    await this.cacheManager.set(cacheKey, response, 30);

    return response;
  }
}

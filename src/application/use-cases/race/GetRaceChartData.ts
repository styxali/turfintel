// Use Case: Get Precomputed Chart Data for Race
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import { IHorseRepository } from '../../../domain/interfaces/IHorseRepository';

interface ChartDataResponse {
  raceOverview: {
    guid: string;
    name: string;
    hippodrome: string;
    date: string;
    time: string;
    distance: number;
    terrain: string;
    discipline: string;
    category: string;
    allocation: string;
    numPartants: number;
  };
  runners: RunnerChartData[];

  // Precomputed chart data (ALL charts)
  charts: {
    winRate: any[];
    distance: any[];
    jockey: any[];
    trainer: any[];
    ground: any[];
    consistency: any[];
    momentum: any[];
    peak: any[];
    coursePerf: any[];
    recency: any[];
    seasonal: any[];
    drawBias: any[];
    equipment: any[];
    pedigree: any[];
    pace: any[];
    headToHead: any[];
    speedFigures: any[];
    tripNotes: any[];
    timeOfDay: any[];
    trackBias: any[];
    combos: any[];
    weight: any[];
    earnings: any[];
    profile: any[];
    odds: any[];
    ratings: any[];
    valueBet: any[];
    class: any[];
    volume: any[];
    weightEvo: any[];
    classProg: any[];
    oddsAccuracy: any[];
    marketConf: any[];
    speed: any[];
    jockeyForm: any[];
    trainerForm: any[];
    tandemForm: any[];
    // FUTURE ENHANCEMENT CHARTS - Tier 1
    moneyFlow: any[];
    marketSentiment: any[];
    fitnessCurve: any[];
    weightImpact: any[];
    fieldComposition: any;
    expertConsensus: any[];
  };

  // Form chart data with full history for tooltips
  formData: any[];
}

interface RunnerChartData {
  numPartant: number;
  horseName: string;
  horseSlug: string;
  age: number;
  sex: string;
  jockey: string;
  trainer: string;
  weight: number;
  gate: string;
  odds?: number;
  rating?: number;

  // Precomputed form data
  music: string;
  positions: number[]; // Last 10 positions

  // Precomputed stats
  careerStats: {
    wins: number;
    places: number;
    races: number;
    winRate: number;
    placeRate: number;
    earnings: number;
  };

  // Precomputed history (last 5 races only)
  recentHistory: Array<{
    date: string;
    track: string;
    distance: number;
    position: number;
    terrain: string;
    discipline: string;
  }>;

  // Precomputed discipline-specific stats
  disciplineStats?: {
    wins: number;
    races: number;
    winRate: number;
    avgPosition: number;
  };

  // Precomputed distance stats
  distanceStats?: {
    short: number;
    medium: number;
    long: number;
  };

  // Precomputed ground stats
  groundStats?: {
    bon: number;
    souple: number;
    lourd: number;
  };

  // ENRICHMENT DATA - Full history for client-side use
  history?: any[]; // Full history array (last 10 races)
  stats?: any; // Horse stats object
  lastOrNext?: any; // Last/next race info
  chevalCalculated?: string; // Horse form music
  trainerCalculated?: string; // Trainer form music
  monteCalculated?: string; // Jockey form music
}

export class GetRaceChartDataUseCase {
  constructor(
    private raceRepository: IRaceRepository,
    private horseRepository: IHorseRepository
  ) { }

  async execute(raceGuid: string): Promise<ChartDataResponse> {
    // Get race with partants
    const race = await this.raceRepository.findByGuidWithPartants(raceGuid);
    if (!race) {
      throw new Error(`Race ${raceGuid} not found`);
    }

    // Parse notes and odds if available
    const notes = race.notesJson ? JSON.parse(race.notesJson) : null;
    const odds = race.pariSimpleJson ? JSON.parse(race.pariSimpleJson) : null;

    // Build race overview
    const raceOverview = {
      guid: race.guid,
      name: race.libcourtPrixCourse,
      hippodrome: race.reunion.hippodrome.name,
      date: race.reunion.dateReunion,
      time: race.heureDepartCourse,
      distance: race.distance,
      terrain: race.etatTerrain,
      discipline: race.discipline,
      category: race.categCourse,
      allocation: race.montantTotalAllocation || 'N/A',
      numPartants: race.partants.length
    };

    // Process each runner
    const runners: RunnerChartData[] = [];
    let totalAge = 0;
    let totalWeight = 0;
    let totalEarnings = 0;
    let totalRaces = 0;
    const disciplinesSet = new Set<string>();

    for (const partant of race.partants) {
      const horse = partant.horse;

      // Parse music to positions
      const positions = this.parseMusic(horse.musique, 10);

      // Get history
      const history = horse.historyJson ? JSON.parse(horse.historyJson) : null;
      const historyRaces = history?.results || [];

      // Debug: Log history structure for first horse
      if (partant.numPartant === 1) {
        console.log('[HISTORY] Horse:', horse.nomCheval);
        console.log('[HISTORY] historyJson exists:', !!horse.historyJson);
        console.log('[HISTORY] history object:', history);
        console.log('[HISTORY] historyRaces length:', historyRaces.length);
        if (historyRaces.length > 0) {
          console.log('[HISTORY] First race:', historyRaces[0]);
        }
      }

      // Compute career stats
      const careerStats = this.computeCareerStats(historyRaces);

      // Get recent history (last 5 races)
      const recentHistory = historyRaces.slice(0, 5).map((r: any) => ({
        date: r.reunion?.date_reunion || 'N/A',
        track: r.reunion?.hippodrome?.name || 'N/A',
        distance: r.distance || 0,
        position: parseInt(r.selected_partant_info?.num_place_arrivee || r.selected_partant_info?.place || '0'),
        terrain: r.etat_terrain || 'N/A',
        discipline: r.discipline || 'Plat'
      }));

      // Compute discipline-specific stats
      const disciplineStats = this.computeDisciplineStats(historyRaces, race.discipline);

      // Compute distance stats
      const distanceStats = this.computeDistanceStats(historyRaces, race.discipline);

      // Compute ground stats
      const groundStats = this.computeGroundStats(historyRaces);

      // Get odds and rating
      const runnerOdds = odds?.find((o: any) => o.num_partant === partant.numPartant);
      const runnerNote = notes?.find((n: any) => n.num_partant === partant.numPartant);

      // Parse full history for enrichment
      const fullHistory = historyRaces.slice(0, 10); // Last 10 races

      // Compute calculated music strings (for jockey/trainer form charts)
      const chevalCalculated = horse.musique; // Horse's own music
      
      // Try to use database fields first, fallback to computation
      const trainerCalculated = horse.trainerCalculated || 
                                this.computeTrainerMusic(historyRaces, partant.trainer.nomEntraineur);
      const monteCalculated = horse.monteCalculated || 
                             this.computeJockeyMusic(historyRaces, partant.jockey.nomMonte);
      
      // Debug logging for first horse
      if (partant.numPartant === 1) {
        console.log('[MUSIC] Horse:', horse.nomCheval);
        console.log('[MUSIC] chevalCalculated:', chevalCalculated);
        console.log('[MUSIC] trainerCalculated (DB):', horse.trainerCalculated);
        console.log('[MUSIC] trainerCalculated (computed):', trainerCalculated);
        console.log('[MUSIC] monteCalculated (DB):', horse.monteCalculated);
        console.log('[MUSIC] monteCalculated (computed):', monteCalculated);
      }

      runners.push({
        numPartant: partant.numPartant,
        horseName: horse.nomCheval,
        horseSlug: horse.slug,
        age: horse.ageCheval,
        sex: horse.sexeCheval,
        jockey: partant.jockey.nomMonte,
        trainer: partant.trainer.nomEntraineur,
        weight: partant.pdsCalcHandPartant,
        gate: partant.placeCordepartant,
        odds: runnerOdds?.rapp_evol,
        rating: runnerNote?.interne_note_partant?.note_equidia,
        music: horse.musique,
        positions,
        careerStats,
        recentHistory,
        disciplineStats,
        distanceStats,
        groundStats,
        // ENRICHMENT DATA
        history: fullHistory,
        stats: horse.statsJson ? JSON.parse(horse.statsJson) : null,
        lastOrNext: null, // Not needed for charts
        chevalCalculated,
        trainerCalculated,
        monteCalculated
      });

      // Aggregate stats
      totalAge += horse.ageCheval;
      totalWeight += partant.pdsCalcHandPartant;
      totalEarnings += horse.gainsCarriere;
      totalRaces += careerStats.races;
      disciplinesSet.add(race.discipline);
    }

    const aggregatedStats = {
      avgAge: Math.round((totalAge / runners.length) * 10) / 10,
      avgWeight: Math.round((totalWeight / runners.length) * 10) / 10,
      avgEarnings: Math.round(totalEarnings / runners.length),
      totalRaces,
      disciplines: Array.from(disciplinesSet)
    };

    // Precompute all chart data
    const charts = {
      winRate: this.computeWinRateChart(runners, race.discipline),
      distance: this.computeDistanceChart(runners, race.discipline),
      jockey: this.computeJockeyChart(runners, race.discipline),
      trainer: this.computeTrainerChart(runners, race.discipline),
      ground: this.computeGroundChart(runners, race.discipline),
      consistency: this.computeConsistencyChart(runners),
      momentum: this.computeMomentumChart(runners),
      peak: this.computePeakChart(runners),
      coursePerf: this.computeCoursePerfChart(runners, race.reunion.hippodrome.name, race.discipline),
      recency: this.computeRecencyChart(runners, race.discipline),
      seasonal: this.computeSeasonalChart(runners, race.discipline),
      drawBias: this.computeDrawBiasChart(runners, race.discipline),
      equipment: this.computeEquipmentChart(runners, race.discipline),
      pedigree: this.computePedigreeChart(runners, race.discipline),
      pace: this.computePaceChart(runners),
      headToHead: this.computeHeadToHeadChart(runners, notes),
      speedFigures: this.computeSpeedFiguresChart(runners),
      tripNotes: this.computeTripNotesChart(runners),
      timeOfDay: this.computeTimeOfDayChart(runners, race.discipline),
      trackBias: this.computeTrackBiasChart(runners, race.reunion.hippodrome.name, race.discipline),
      combos: this.computeCombosChart(runners, race.discipline),
      // Additional charts from existing data
      weight: this.computeWeightChart(runners),
      earnings: this.computeEarningsChart(runners),
      profile: this.computeProfileChart(runners),
      odds: this.computeOddsChart(runners),
      ratings: this.computeRatingsChart(runners),
      valueBet: this.computeValueBetChart(runners),
      class: this.computeClassChart(runners),
      // Final batch
      volume: this.computeVolumeChart(runners, odds),
      weightEvo: this.computeWeightEvoChart(runners),
      classProg: this.computeClassProgChart(runners),
      oddsAccuracy: this.computeOddsAccuracyChart(runners),
      marketConf: this.computeMarketConfChart(runners, odds),
      speed: this.computeSpeedChart(runners),
      // Form charts from historical data
      jockeyForm: this.computeJockeyFormChart(runners),
      trainerForm: this.computeTrainerFormChart(runners),
      tandemForm: this.computeTandemFormChart(runners),
      // FUTURE ENHANCEMENT CHARTS - Tier 1
      moneyFlow: this.computeMoneyFlowChart(runners, odds),
      marketSentiment: this.computeMarketSentimentChart(runners, odds, notes),
      fitnessCurve: this.computeFitnessCurveChart(runners),
      weightImpact: this.computeWeightImpactChart(runners),
      fieldComposition: this.computeFieldCompositionChart(runners),
      expertConsensus: this.computeExpertConsensusChart(runners),
      // TIER 2 CHARTS
      sectionalTimes: this.computeSectionalTimesChart(runners),
      strikeRateByTrack: this.computeStrikeRateByTrackChart(runners, race.reunion.hippodrome.name),
      tripHandicapping: this.computeTripHandicappingChart(runners),
      raceShape: this.computeRaceShapeChart(runners),
      stableConfidence: this.computeStableConfidenceChart(runners, odds),
      // Additional Tier 2
      formCycle: this.computeFormCycleChart(runners),
      classDropRise: this.computeClassDropRiseChart(runners, race.distance),
      speedRating: this.computeSpeedRatingChart(runners),
      // Batch 3 - 7 new charts
      layoffImpact: this.computeLayoffImpactChart(runners),
      ageAnalysis: this.computeAgeAnalysisChart(runners, race.discipline),
      distanceChange: this.computeDistanceChangeChart(runners, race.distance),
      winnerProfile: this.computeWinnerProfileChart(runners),
      valueIndex: this.computeValueIndexChart(runners, odds),
      competitionLevel: this.computeCompetitionLevelChart(runners),
      finishingKick: this.computeFinishingKickChart(runners),
      // Batch 4 - FINAL 6 charts
      barrierTrial: this.computeBarrierTrialChart(runners),
      pacePressure: this.computePacePressureChart(runners),
      hotStreak: this.computeHotStreakChart(runners),
      trackConditionSpec: this.computeTrackConditionSpecChart(runners, race.etatTerrain),
      distanceSpecialist: this.computeDistanceSpecialistChart(runners, race.distance, race.discipline),
      bounceCandidate: this.computeBounceCandidateChart(runners)
    };

    return {
      raceOverview,
      runners,
      charts,
      formData: this.computeFormData(runners, race.partants)
    };
  }

  private parseMusic(music: string, limit: number = 10, filterDiscipline?: string): number[] {
    if (!music) return [];

    const racePattern = /([DTJAdtja])?(\d+)([PAMCHSpamchs])/g;
    const matches = [...music.matchAll(racePattern)];
    
    const results = matches.map(match => {
      const prefix = match[1]?.toUpperCase();
      const position = parseInt(match[2]);
      const discipline = match[3].toLowerCase();
      
      const dnf = ['D', 'T', 'J', 'A'].includes(prefix || '');
      
      return {
        position: dnf ? 10 : Math.min(position, 10),
        discipline,
        dnf
      };
    });

    const filtered = filterDiscipline 
      ? results.filter(r => r.discipline === filterDiscipline.toLowerCase())
      : results;

    return filtered.slice(0, limit).map(r => r.position);
  }

  private computeCareerStats(historyRaces: any[]) {
    if (!historyRaces || historyRaces.length === 0) {
      return { wins: 0, places: 0, races: 0, winRate: 0, placeRate: 0, earnings: 0 };
    }

    let wins = 0;
    let places = 0;
    let earnings = 0;

    // Debug: Log first race structure
    if (historyRaces.length > 0) {
      console.log('[CAREER STATS] First race keys:', Object.keys(historyRaces[0]));
      console.log('[CAREER STATS] selected_partant_info:', historyRaces[0].selected_partant_info);
    }

    for (const race of historyRaces) {
      // Position is in selected_partant_info
      const partantInfo = race.selected_partant_info;
      const position = partantInfo ? parseInt(partantInfo.num_place_arrivee || partantInfo.place || '0') : 0;
      if (position === 1) wins++;
      if (position >= 1 && position <= 3) places++;
      earnings += partantInfo?.gains || 0;
    }

    const races = historyRaces.length;
    const winRate = races > 0 ? Math.round((wins / races) * 100) : 0;
    const placeRate = races > 0 ? Math.round((places / races) * 100) : 0;

    return { wins, places, races, winRate, placeRate, earnings };
  }

  private computeDisciplineStats(historyRaces: any[], currentDiscipline: string) {
    const disciplineRaces = historyRaces.filter(r => r.discipline === currentDiscipline);

    if (disciplineRaces.length === 0) return undefined;

    let wins = 0;
    let totalPosition = 0;

    for (const race of disciplineRaces) {
      const position = parseInt(race.selected_partant_info?.num_place_arrivee || race.selected_partant_info?.place || '0');
      if (position === 1) wins++;
      if (position > 0) totalPosition += position;
    }

    const races = disciplineRaces.length;
    const winRate = races > 0 ? Math.round((wins / races) * 100) : 0;
    const avgPosition = races > 0 ? Math.round((totalPosition / races) * 10) / 10 : 0;

    return { wins, races, winRate, avgPosition };
  }

  private computeDistanceStats(historyRaces: any[], discipline: string) {
    const ranges = this.getDistanceRanges(discipline);

    const shortRaces = historyRaces.filter(r => r.distance < ranges.short);
    const mediumRaces = historyRaces.filter(r => r.distance >= ranges.short && r.distance < ranges.long);
    const longRaces = historyRaces.filter(r => r.distance >= ranges.long);

    const calcWinRate = (races: any[]) => {
      if (races.length === 0) return 0;
      const wins = races.filter(r => parseInt(r.selected_partant_info?.num_place_arrivee || r.selected_partant_info?.place || '0') === 1).length;
      return Math.round((wins / races.length) * 100);
    };

    return {
      short: calcWinRate(shortRaces),
      medium: calcWinRate(mediumRaces),
      long: calcWinRate(longRaces)
    };
  }

  private getDistanceRanges(discipline: string) {
    if (discipline === 'Plat') return { short: 1400, long: 2400 };
    if (discipline === 'Trot') return { short: 2000, long: 3000 };
    return { short: 3000, long: 4500 }; // Obstacle
  }

  private computeGroundStats(historyRaces: any[]) {
    const bonRaces = historyRaces.filter(r => (r.etat_terrain || '').toUpperCase().includes('BON'));
    const soupleRaces = historyRaces.filter(r => (r.etat_terrain || '').toUpperCase().includes('SOUPLE'));
    const lourdRaces = historyRaces.filter(r => (r.etat_terrain || '').toUpperCase().includes('LOURD'));

    const calcWinRate = (races: any[]) => {
      if (races.length === 0) return 0;
      const wins = races.filter(r => parseInt(r.selected_partant_info?.num_place_arrivee || r.selected_partant_info?.place || '0') === 1).length;
      return Math.round((wins / races.length) * 100);
    };

    return {
      bon: calcWinRate(bonRaces),
      souple: calcWinRate(soupleRaces),
      lourd: calcWinRate(lourdRaces)
    };
  }


  // ==========================================
  // CHART COMPUTATION METHODS
  // ==========================================

  private computeWinRateChart(runners: RunnerChartData[], discipline: string) {
    return runners
      .filter(r => r.careerStats.races > 0)
      .map(r => ({
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        winRate: r.careerStats.winRate,
        placeRate: r.careerStats.placeRate,
        totalRaces: r.careerStats.races
      }))
      .sort((a, b) => b.winRate - a.winRate);
  }

  private computeDistanceChart(runners: RunnerChartData[], discipline: string) {
    return runners
      .filter(r => r.distanceStats)
      .map(r => ({
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        short: r.distanceStats!.short,
        medium: r.distanceStats!.medium,
        long: r.distanceStats!.long
      }));
  }

  private computeJockeyChart(runners: RunnerChartData[], discipline: string) {
    const jockeyStats = new Map<string, { wins: number; places: number; total: number; horses: string[] }>();

    runners.forEach(r => {
      if (!jockeyStats.has(r.jockey)) {
        jockeyStats.set(r.jockey, { wins: 0, places: 0, total: 0, horses: [] });
      }
      const stats = jockeyStats.get(r.jockey)!;
      stats.horses.push(`#${r.numPartant}`);
      stats.wins += r.careerStats.wins;
      stats.places += r.careerStats.places;
      stats.total += r.careerStats.races;
    });

    return Array.from(jockeyStats.entries())
      .map(([name, stats]) => ({
        name: name.split(' ').slice(-1)[0],
        fullName: name,
        winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100 * 10) / 10 : 0,
        placeRate: stats.total > 0 ? Math.round((stats.places / stats.total) * 100 * 10) / 10 : 0,
        totalRaces: stats.total,
        horses: stats.horses.join(', ')
      }))
      .filter(j => j.totalRaces > 0)
      .sort((a, b) => b.winRate - a.winRate);
  }

  private computeTrainerChart(runners: RunnerChartData[], discipline: string) {
    const trainerStats = new Map<string, { wins: number; places: number; total: number; horses: string[] }>();

    runners.forEach(r => {
      if (!trainerStats.has(r.trainer)) {
        trainerStats.set(r.trainer, { wins: 0, places: 0, total: 0, horses: [] });
      }
      const stats = trainerStats.get(r.trainer)!;
      stats.horses.push(`#${r.numPartant}`);
      stats.wins += r.careerStats.wins;
      stats.places += r.careerStats.places;
      stats.total += r.careerStats.races;
    });

    return Array.from(trainerStats.entries())
      .map(([name, stats]) => ({
        name: name.split(' ').slice(-1)[0],
        fullName: name,
        winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100 * 10) / 10 : 0,
        placeRate: stats.total > 0 ? Math.round((stats.places / stats.total) * 100 * 10) / 10 : 0,
        totalRaces: stats.total,
        horses: stats.horses.join(', ')
      }))
      .filter(t => t.totalRaces > 0)
      .sort((a, b) => b.winRate - a.winRate);
  }

  private computeGroundChart(runners: RunnerChartData[], discipline: string) {
    return runners
      .filter(r => r.groundStats)
      .map(r => ({
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        bon: r.groundStats!.bon,
        souple: r.groundStats!.souple,
        lourd: r.groundStats!.lourd
      }));
  }

  private computeConsistencyChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.positions.length >= 3)
      .map(r => {
        const positions = r.positions;
        const avg = positions.reduce((a, b) => a + b, 0) / positions.length;
        const variance = positions.reduce((sum, pos) => sum + Math.pow(pos - avg, 2), 0) / positions.length;
        const stdDev = Math.sqrt(variance);
        const consistency = Math.max(0, 100 - (stdDev * 20));

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          consistency: Math.round(consistency),
          avgPosition: Math.round(avg * 10) / 10,
          stdDev: Math.round(stdDev * 10) / 10
        };
      })
      .sort((a, b) => b.consistency - a.consistency);
  }

  private computeMomentumChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.positions.length >= 4)
      .map(r => {
        const positions = r.positions;
        const recent = positions.slice(0, 3);
        const previous = positions.slice(3, 6);

        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
        const momentum = Math.round(-(recentAvg - previousAvg) * 20);

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          momentum,
          recentAvg: Math.round(recentAvg * 10) / 10,
          previousAvg: Math.round(previousAvg * 10) / 10,
          trend: momentum > 10 ? 'Improving' : momentum < -10 ? 'Declining' : 'Stable'
        };
      })
      .sort((a, b) => b.momentum - a.momentum);
  }

  private computePeakChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.positions.length >= 5)
      .map(r => {
        const recentPositions = r.positions.slice(0, 5);
        const allPositions = r.positions;

        const recentWins = recentPositions.filter(p => p === 1).length;
        const recentWinRate = (recentWins / recentPositions.length) * 100;

        const careerWins = allPositions.filter(p => p === 1).length;
        const careerWinRate = (careerWins / allPositions.length) * 100;

        const peak = recentWinRate - careerWinRate;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          recent: Math.round(recentWinRate),
          career: Math.round(careerWinRate),
          peak: Math.round(peak),
          status: peak > 10 ? 'Peak Form' : peak < -10 ? 'Below Par' : 'Normal'
        };
      })
      .sort((a, b) => b.peak - a.peak);
  }

  private computeCoursePerfChart(runners: RunnerChartData[], currentTrack: string, discipline: string) {
    return runners
      .filter(r => r.recentHistory.some(h => h.track === currentTrack))
      .map(r => {
        const trackRaces = r.recentHistory.filter(h => h.track === currentTrack);
        const wins = trackRaces.filter(h => h.position === 1).length;
        const places = trackRaces.filter(h => h.position <= 3).length;
        const avgPos = trackRaces.reduce((sum, h) => sum + h.position, 0) / trackRaces.length;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          winRate: Math.round((wins / trackRaces.length) * 100),
          placeRate: Math.round((places / trackRaces.length) * 100),
          avgPosition: Math.round(avgPos * 10) / 10,
          races: trackRaces.length,
          track: currentTrack
        };
      })
      .sort((a, b) => b.winRate - a.winRate);
  }

  private computeRecencyChart(runners: RunnerChartData[], discipline: string) {
    return runners
      .filter(r => r.recentHistory.length >= 2)
      .map(r => {
        const history = r.recentHistory;
        const raceData: any[] = [];

        for (let i = 0; i < history.length - 1; i++) {
          const current = new Date(history[i].date);
          const previous = new Date(history[i + 1].date);
          const daysSince = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

          if (daysSince > 0 && daysSince < 365) {
            raceData.push({ days: daysSince, won: history[i].position === 1 });
          }
        }

        if (raceData.length === 0) return null;

        const fresh = raceData.filter(r => r.days <= 14);
        const normal = raceData.filter(r => r.days > 14 && r.days <= 42);
        const rusty = raceData.filter(r => r.days > 42);

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          fresh: fresh.length > 0 ? Math.round((fresh.filter(r => r.won).length / fresh.length) * 100) : 0,
          normal: normal.length > 0 ? Math.round((normal.filter(r => r.won).length / normal.length) * 100) : 0,
          rusty: rusty.length > 0 ? Math.round((rusty.filter(r => r.won).length / rusty.length) * 100) : 0
        };
      })
      .filter(r => r !== null);
  }

  private computeSeasonalChart(runners: RunnerChartData[], discipline: string) {
    return runners
      .filter(r => r.recentHistory.length >= 4)
      .map(r => {
        const seasons = { spring: [] as number[], summer: [] as number[], autumn: [] as number[], winter: [] as number[] };

        r.recentHistory.forEach(h => {
          const month = new Date(h.date).getMonth() + 1;
          if (month >= 3 && month <= 5) seasons.spring.push(h.position);
          else if (month >= 6 && month <= 8) seasons.summer.push(h.position);
          else if (month >= 9 && month <= 11) seasons.autumn.push(h.position);
          else seasons.winter.push(h.position);
        });

        const calcWinRate = (positions: number[]) => {
          if (positions.length === 0) return 0;
          return Math.round((positions.filter(p => p === 1).length / positions.length) * 100);
        };

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          spring: calcWinRate(seasons.spring),
          summer: calcWinRate(seasons.summer),
          autumn: calcWinRate(seasons.autumn),
          winter: calcWinRate(seasons.winter)
        };
      });
  }

  private computeDrawBiasChart(runners: RunnerChartData[], discipline: string) {
    return runners.map(r => ({
      name: `#${r.numPartant}`,
      fullName: r.horseName,
      currentGate: parseInt(r.gate) || 0,
      inside: 0, // Historical gate data not available
      middle: 0,
      outside: 0
    }));
  }

  private computeEquipmentChart(runners: RunnerChartData[], discipline: string) {
    return []; // Requires detailed equipment history
  }

  private computePedigreeChart(runners: RunnerChartData[], discipline: string) {
    return runners
      .filter(r => r.disciplineStats)
      .map(r => ({
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        aptitude: r.disciplineStats!.winRate,
        races: r.disciplineStats!.races
      }));
  }

  private computePaceChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.positions.length >= 3)
      .map(r => {
        const positions = r.positions;
        const early = positions.slice(0, 3);
        const late = positions.slice(-3);

        const earlySpeed = Math.round((early.reduce((a, b) => a + (11 - b), 0) / early.length) * 10);
        const finishSpeed = Math.round((late.reduce((a, b) => a + (11 - b), 0) / late.length) * 10);

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          earlySpeed,
          finishSpeed,
          style: earlySpeed > finishSpeed + 10 ? 'Front-runner' : finishSpeed > earlySpeed + 10 ? 'Closer' : 'Balanced'
        };
      });
  }

  private computeHeadToHeadChart(runners: RunnerChartData[], notes: any) {
    return runners
      .filter(r => r.odds)
      .sort((a, b) => (a.odds || 999) - (b.odds || 999))
      .slice(0, 4)
      .map(r => ({
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        odds: r.odds || 0,
        rating: r.rating || 0,
        winRate: r.careerStats.winRate,
        earnings: Math.round(r.careerStats.earnings / 1000)
      }));
  }

  private computeSpeedFiguresChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.positions.length >= 3)
      .map(r => {
        const speedFigures = r.positions.map(pos => Math.max(0, Math.round(100 - (pos / 10 * 100))));
        const avgSpeed = speedFigures.reduce((a, b) => a + b, 0) / speedFigures.length;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          avg: Math.round(avgSpeed),
          best: Math.max(...speedFigures),
          last: speedFigures[0]
        };
      })
      .sort((a, b) => b.avg - a.avg);
  }

  private computeTripNotesChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.positions.length >= 3)
      .map(r => {
        const positions = r.positions;
        const early = positions.slice(0, 3);
        const late = positions.slice(-3);

        const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
        const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          early: Math.round(earlyAvg * 10) / 10,
          late: Math.round(lateAvg * 10) / 10,
          style: earlyAvg < 4 ? 'Front-Runner' : lateAvg < earlyAvg - 2 ? 'Closer' : 'Balanced'
        };
      });
  }

  private computeTimeOfDayChart(runners: RunnerChartData[], discipline: string) {
    return []; // Requires race time data
  }

  private computeTrackBiasChart(runners: RunnerChartData[], currentTrack: string, discipline: string) {
    return runners
      .filter(r => r.recentHistory.some(h => h.track === currentTrack))
      .map(r => {
        const trackRaces = r.recentHistory.filter(h => h.track === currentTrack);
        const avgPos = trackRaces.reduce((sum, h) => sum + h.position, 0) / trackRaces.length;
        const wins = trackRaces.filter(h => h.position === 1).length;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          avgPosition: Math.round(avgPos * 10) / 10,
          winRate: Math.round((wins / trackRaces.length) * 100),
          races: trackRaces.length,
          track: currentTrack
        };
      })
      .sort((a, b) => a.avgPosition - b.avgPosition);
  }

  private computeCombosChart(runners: RunnerChartData[], discipline: string) {
    const comboStats = new Map<string, { wins: number; places: number; total: number; horses: string[] }>();

    runners.forEach(r => {
      const trainerName = r.trainer.split(' ').slice(-1)[0];
      const jockeyName = r.jockey.split(' ').slice(-1)[0];
      const comboKey = `${trainerName}/${jockeyName}`;

      if (!comboStats.has(comboKey)) {
        comboStats.set(comboKey, { wins: 0, places: 0, total: 0, horses: [] });
      }

      const stats = comboStats.get(comboKey)!;
      stats.horses.push(`#${r.numPartant}`);
      stats.wins += r.careerStats.wins;
      stats.places += r.careerStats.places;
      stats.total += r.careerStats.races;
    });

    return Array.from(comboStats.entries())
      .map(([name, stats]) => ({
        name,
        fullName: name,
        winRate: stats.total > 0 ? Math.round((stats.wins / stats.total) * 100 * 10) / 10 : 0,
        placeRate: stats.total > 0 ? Math.round((stats.places / stats.total) * 100 * 10) / 10 : 0,
        totalRaces: stats.total,
        horses: stats.horses.join(', ')
      }))
      .filter(c => c.totalRaces > 0)
      .sort((a, b) => b.winRate - a.winRate);
  }


  // ==========================================
  // ADDITIONAL CHART METHODS
  // ==========================================

  private computeWeightChart(runners: RunnerChartData[]) {
    return runners.map(r => ({
      name: `#${r.numPartant}`,
      fullName: r.horseName,
      weight: r.weight,
      handicap: r.weight - 55 // Assuming 55kg as base
    }));
  }

  private computeEarningsChart(runners: RunnerChartData[]) {
    return runners.map(r => ({
      name: `#${r.numPartant}`,
      fullName: r.horseName,
      earningsK: Math.round(r.careerStats.earnings / 1000)
    })).sort((a, b) => b.earningsK - a.earningsK);
  }

  private computeProfileChart(runners: RunnerChartData[]) {
    return runners.map(r => ({
      name: `#${r.numPartant}`,
      fullName: r.horseName,
      age: r.age,
      races: r.careerStats.races
    }));
  }

  private computeOddsChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.odds)
      .map(r => ({
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        odds: r.odds || 0
      }))
      .sort((a, b) => a.odds - b.odds);
  }

  private computeRatingsChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.rating)
      .map(r => ({
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        rating: r.rating || 0
      }))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  private computeValueBetChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.odds && r.careerStats.winRate > 0)
      .map(r => {
        const impliedProb = 100 / (r.odds || 1);
        const actualProb = r.careerStats.winRate;
        const value = Math.max(0, Math.round((actualProb - impliedProb) * 10));

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          value,
          odds: r.odds,
          winRate: actualProb
        };
      })
      .sort((a, b) => b.value - a.value);
  }

  private computeClassChart(runners: RunnerChartData[]) {
    // Simplified class distribution based on earnings
    return runners.map(r => {
      const earnings = r.careerStats.earnings;
      const group = earnings > 100000 ? 5 : 0;
      const listed = earnings > 50000 && earnings <= 100000 ? 3 : 0;
      const handicap = earnings > 20000 && earnings <= 50000 ? 5 : 0;
      const claiming = earnings > 5000 && earnings <= 20000 ? 3 : 0;
      const other = earnings <= 5000 ? r.careerStats.races : 0;

      return {
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        group,
        listed,
        handicap,
        claiming,
        other
      };
    });
  }



  private computeVolumeChart(runners: RunnerChartData[], odds: any) {
    if (!odds) return [];

    return runners
      .map(r => {
        const runnerOdds = odds.find((o: any) => o.num_partant === r.numPartant);
        const volume = runnerOdds?.montant_enjeu_total ? parseFloat(runnerOdds.montant_enjeu_total) / 1000 : 0;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          volumeK: Math.round(volume)
        };
      })
      .filter(r => r.volumeK > 0)
      .sort((a, b) => b.volumeK - a.volumeK);
  }

  private computeWeightEvoChart(runners: RunnerChartData[]) {
    // Weight evolution requires historical weight data which we don't have
    // Return empty for now - would need to track weight changes over time
    return [];
  }

  private computeClassProgChart(runners: RunnerChartData[]) {
    // Class progression requires historical race class data
    // Simplified version based on earnings progression
    return runners
      .filter(r => r.recentHistory.length >= 3)
      .map(r => {
        const classLevels = r.recentHistory.map((h, idx) => ({
          race: idx + 1,
          level: h.distance > 2000 ? 3 : h.distance > 1600 ? 2 : 1
        }));

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          data: classLevels
        };
      });
  }

  private computeOddsAccuracyChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.odds && r.careerStats.winRate > 0)
      .map(r => {
        const impliedProb = 100 / (r.odds || 1);
        const actualProb = r.careerStats.winRate;

        const outperform = actualProb > impliedProb ? Math.round(actualProb - impliedProb) : 0;
        const expected = Math.abs(actualProb - impliedProb) < 5 ? Math.round(actualProb) : 0;
        const underperform = actualProb < impliedProb ? Math.round(impliedProb - actualProb) : 0;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          outperform,
          expected,
          underperform,
          impliedProb: Math.round(impliedProb),
          actualProb: Math.round(actualProb)
        };
      })
      .sort((a, b) => b.outperform - a.outperform);
  }

  private computeMarketConfChart(runners: RunnerChartData[], odds: any) {
    if (!odds) return [];

    return runners
      .filter(r => r.odds)
      .map(r => {
        const runnerOdds = odds.find((o: any) => o.num_partant === r.numPartant);
        const volume = runnerOdds?.montant_enjeu_total ? parseFloat(runnerOdds.montant_enjeu_total) : 0;
        const totalVolume = odds.reduce((sum: number, o: any) => sum + parseFloat(o.montant_enjeu_total || 0), 0);

        const confidence = totalVolume > 0 ? Math.round((volume / totalVolume) * 100) : 0;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          confidence,
          odds: r.odds
        };
      })
      .sort((a, b) => b.confidence - a.confidence);
  }

  private computeSpeedChart(runners: RunnerChartData[]) {
    // Speed ratings based on position performance
    return runners
      .filter(r => r.positions.length >= 3)
      .map(r => {
        const avgPosition = r.positions.reduce((a, b) => a + b, 0) / r.positions.length;
        const speedRating = Math.max(0, Math.round(100 - (avgPosition * 8)));

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          speed: speedRating,
          avgPosition: Math.round(avgPosition * 10) / 10
        };
      })
      .sort((a, b) => b.speed - a.speed);
  }



  private computeJockeyFormChart(runners: RunnerChartData[]) {
    // Build line chart data with race numbers as x-axis
    const maxRaces = 10;
    const data: any[] = [];
    
    for (let i = 0; i < maxRaces; i++) {
      const point: any = { race: i + 1 };
      
      runners.forEach(r => {
        if (r.monteCalculated && r.monteCalculated.length > 0) {
          const positions = this.parseMusic(r.monteCalculated || '', 10);
          point[r.horseName] = positions[i] || null;
        }
      });
      
      data.push(point);
    }
    
    return data;
  }

  private computeTrainerFormChart(runners: RunnerChartData[]) {
    // Build line chart data with race numbers as x-axis
    const maxRaces = 10;
    const data: any[] = [];
    
    for (let i = 0; i < maxRaces; i++) {
      const point: any = { race: i + 1 };
      
      runners.forEach(r => {
        if (r.trainerCalculated && r.trainerCalculated.length > 0) {
          const positions = this.parseMusic(r.trainerCalculated || '', 10);
          point[r.horseName] = positions[i] || null;
        }
      });
      
      data.push(point);
    }
    
    return data;
  }


  private computeTandemFormChart(runners: RunnerChartData[]) {
    // Build line chart data with race numbers as x-axis
    const maxRaces = 10;
    const data: any[] = [];
    
    for (let i = 0; i < maxRaces; i++) {
      const point: any = { race: i + 1 };
      
      runners.forEach(r => {
        if (r.positions.length > 0) {
          point[r.horseName] = r.positions[i] || null;
        }
      });
      
      data.push(point);
    }
    
    return data;
  }

  private computeFormData(runners: RunnerChartData[], partants: any[]) {
    // Build form chart data with full history for tooltips
    const maxRaces = 10;
    const data: any[] = [];

    for (let i = 0; i < maxRaces; i++) {
      const point: any = { race: i + 1 };

      runners.forEach(r => {
        const partant = partants.find(p => p.numPartant === r.numPartant);
        if (!partant) return;

        const horse = partant.horse;
        const history = horse.historyJson ? JSON.parse(horse.historyJson) : null;
        const historyRaces = history?.results || [];

        if (historyRaces[i]) {
          const race = historyRaces[i];
          const position = parseInt(race.selected_partant_info?.num_place_arrivee || race.selected_partant_info?.place || '0');

          point[r.horseName] = position > 0 ? position : null;

          // Add metadata for tooltip
          point[`${r.horseName}_meta`] = {
            position,
            date: race.reunion?.date_reunion || 'N/A',
            course: race.reunion?.hippodrome?.name || 'N/A',
            raceName: race.libcourt_prix_course || 'N/A',
            distance: race.distance || 0,
            condition: race.etat_terrain || 'N/A',
            discipline: race.discipline || 'Plat',
            jockey: race.selected_partant_info?.nom_monte || 'N/A',
            weight: race.selected_partant_info?.pds_calc_hand_partant || 0,
            temps: race.selected_partant_info?.temps_part || race.temps_officiel || 'N/A',
            comment: race.selected_partant_info?.notule_partant_text || '',
            vmax: race.vmax,
            derniers600m: race.derniers_600m,
            derniers200m: race.derniers_200m
          };
        } else {
          point[r.horseName] = null;
        }
      });

      data.push(point);
    }

    return data;
  }

  private computeTrainerMusic(historyRaces: any[], trainerName: string): string {
    const music: string[] = [];
    
    for (let i = 0; i < Math.min(10, historyRaces.length); i++) {
      const race = historyRaces[i];
      const partantInfo = race.selected_partant_info;
      const position = parseInt(partantInfo?.num_place_arrivee || partantInfo?.place || '0');
      const discipline = race.discipline || 'P';
      const disciplineCode = discipline === 'Plat' ? 'p' : discipline === 'Trot' ? 't' : discipline === 'Obstacle' ? 'h' : 'p';
      
      if (position > 0) {
        music.push(`${position}${disciplineCode}`);
      }
    }
    
    return music.join('');
  }

  private computeJockeyMusic(historyRaces: any[], jockeyName: string): string {
    const music: string[] = [];
    
    for (let i = 0; i < Math.min(10, historyRaces.length); i++) {
      const race = historyRaces[i];
      const partantInfo = race.selected_partant_info;
      const position = parseInt(partantInfo?.num_place_arrivee || partantInfo?.place || '0');
      const discipline = race.discipline || 'P';
      const disciplineCode = discipline === 'Plat' ? 'p' : discipline === 'Trot' ? 't' : discipline === 'Obstacle' ? 'h' : 'p';
      
      if (position > 0) {
        music.push(`${position}${disciplineCode}`);
      }
    }
    
    return music.join('');
  }

  // ==========================================
  // FUTURE ENHANCEMENT CHARTS - TIER 1
  // ==========================================

  private computeMoneyFlowChart(runners: RunnerChartData[], odds: any) {
    if (!odds || odds.length === 0) return [];

    // Simplified version - use current volume and odds trend
    return runners
      .filter(r => r.odds)
      .map(r => {
        const runnerOdds = odds.find((o: any) => o.num_partant === r.numPartant);
        if (!runnerOdds) return null;

        const volume = runnerOdds.montant_enjeu_total ? parseFloat(runnerOdds.montant_enjeu_total) : 0;
        const oddsChange = runnerOdds.tendance_signe === '-' ? -5 : runnerOdds.tendance_signe === '+' ? 5 : 0;
        const volumeChange = volume > 0 ? 10 : 0; // Placeholder

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          volumeChange: Math.round(volumeChange),
          oddsChange: oddsChange,
          currentVolume: Math.round(volume / 1000),
          trend: oddsChange < 0 ? 'Smart Money' : oddsChange > 0 ? 'Public Fade' : 'Stable'
        };
      })
      .filter(r => r !== null)
      .sort((a, b) => (b.currentVolume || 0) - (a.currentVolume || 0));
  }

  private computeMarketSentimentChart(runners: RunnerChartData[], odds: any, notes: any) {
    // Need both odds and ratings
    if (!odds || !notes) return [];
    
    return runners
      .filter(r => r.odds && r.rating)
      .map(r => {
        const impliedProb = 100 / (r.odds || 1);
        const expertRating = (r.rating || 0) * 5; // Convert 0-20 to 0-100
        const sentiment = expertRating - impliedProb;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          crowdConfidence: Math.round(impliedProb),
          expertRating: Math.round(expertRating),
          sentiment: Math.round(sentiment),
          category: sentiment > 15 ? 'Undervalued' : sentiment < -15 ? 'Overvalued' : 'Fair Value'
        };
      })
      .sort((a, b) => b.sentiment - a.sentiment);
  }

  private computeFitnessCurveChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.recentHistory.length >= 3)
      .map(r => {
        const fitnessScores: number[] = [];
        
        for (let i = 0; i < r.recentHistory.length - 1; i++) {
          const current = new Date(r.recentHistory[i].date);
          const previous = new Date(r.recentHistory[i + 1].date);
          const daysSince = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
          const position = r.recentHistory[i].position;

          // Fitness score: optimal at 14-28 days, decreases with position
          let fitnessScore = 100;
          if (daysSince < 7) fitnessScore -= 30; // Too fresh
          else if (daysSince > 42) fitnessScore -= 40; // Too rusty
          else if (daysSince >= 14 && daysSince <= 28) fitnessScore += 20; // Optimal

          fitnessScore -= (position - 1) * 5; // Penalty for poor position
          fitnessScores.push(Math.max(0, Math.min(100, fitnessScore)));
        }

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          currentFitness: fitnessScores[0] || 50,
          peakFitness: Math.max(...fitnessScores),
          avgFitness: Math.round(fitnessScores.reduce((a, b) => a + b, 0) / fitnessScores.length),
          trend: fitnessScores[0] > fitnessScores[1] ? 'Improving' : 'Declining'
        };
      })
      .sort((a, b) => b.currentFitness - a.currentFitness);
  }

  private computeWeightImpactChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.recentHistory.length >= 3)
      .map(r => {
        // Weight data not available in recentHistory, use current weight as baseline
        // This is a simplified version - full implementation would need historical weight data
        const currentWeight = r.weight;
        const avgWeight = currentWeight; // Placeholder
        
        // Calculate based on position variance (proxy for weight impact)
        const positions = r.recentHistory.map(h => h.position).filter(p => p > 0);
        if (positions.length < 3) return null;

        const avgPosition = positions.reduce((sum, p) => sum + p, 0) / positions.length;
        const variance = positions.reduce((sum, p) => sum + Math.pow(p - avgPosition, 2), 0) / positions.length;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          currentWeight: currentWeight,
          avgWeight: Math.round(avgWeight * 10) / 10,
          lightAvgPos: Math.round(avgPosition * 10) / 10,
          normalAvgPos: Math.round(avgPosition * 10) / 10,
          heavyAvgPos: Math.round(avgPosition * 10) / 10,
          penalty: 0 // Placeholder - would need historical weight data
        };
      })
      .filter(r => r !== null)
      .sort((a, b) => a.currentWeight - b.currentWeight);
  }

  private computeFieldCompositionChart(runners: RunnerChartData[]) {
    const styles = {
      frontRunners: 0,
      closers: 0,
      balanced: 0
    };

    const runnerStyles = runners
      .filter(r => r.positions.length >= 3)
      .map(r => {
        const early = r.positions.slice(0, 3);
        const late = r.positions.slice(-3);
        const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
        const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;

        let style: string;
        if (earlyAvg < 4) {
          style = 'Front-Runner';
          styles.frontRunners++;
        } else if (lateAvg < earlyAvg - 2) {
          style = 'Closer';
          styles.closers++;
        } else {
          style = 'Balanced';
          styles.balanced++;
        }

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          style,
          earlyAvg: Math.round(earlyAvg * 10) / 10,
          lateAvg: Math.round(lateAvg * 10) / 10
        };
      });

    // Calculate pace pressure and tactical advantage
    const pacePressure = styles.frontRunners > 3 ? 'High' : styles.frontRunners < 2 ? 'Low' : 'Moderate';
    const tacticalAdvantage = styles.frontRunners > 3 ? 'Closers' : styles.closers > styles.frontRunners ? 'Front-Runners' : 'Balanced';

    return {
      distribution: styles,
      pacePressure,
      tacticalAdvantage,
      runners: runnerStyles
    };
  }

  private computeExpertConsensusChart(runners: RunnerChartData[]) {
    // Simplified version - in production, would aggregate multiple pronostic sources
    return runners
      .filter(r => r.rating && r.rating > 0) // Only include horses with ratings
      .map(r => {
        const consensusScore = r.rating || 0;
        const isTopPick = consensusScore >= 15;
        const isContrarian = consensusScore < 10 && r.odds && r.odds < 8;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          consensusScore: Math.round(consensusScore),
          rating: r.rating,
          odds: r.odds || 0,
          isTopPick,
          isContrarian,
          category: isTopPick ? 'Consensus Pick' : isContrarian ? 'Contrarian Play' : 'Mixed Opinion'
        };
      })
      .sort((a, b) => b.consensusScore - a.consensusScore);
  }


  // ==========================================
  // TIER 2 CHARTS - High Value, Medium Complexity
  // ==========================================

  private computeSectionalTimesChart(runners: RunnerChartData[]) {
    return runners
      .filter(r => r.recentHistory.length >= 2)
      .map(r => {
        const racesWithData = r.recentHistory.filter(h => h.distance > 0);
        if (racesWithData.length === 0) return null;

        const avgDistance = racesWithData.reduce((sum, h) => sum + h.distance, 0) / racesWithData.length;
        const speed = avgDistance > 0 ? Math.round((avgDistance / 60) * 10) / 10 : 0;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          avgSpeed: speed,
          topSpeed: speed + 2,
          races: racesWithData.length
        };
      })
      .filter(r => r !== null)
      .sort((a, b) => b.avgSpeed - a.avgSpeed);
  }

  private computeStrikeRateByTrackChart(runners: RunnerChartData[], currentTrack: string) {
    const jockeyStats = new Map<string, { wins: number; races: number; horses: string[] }>();
    const trainerStats = new Map<string, { wins: number; races: number; horses: string[] }>();

    runners.forEach(r => {
      const trackRaces = r.recentHistory.filter(h => h.track === currentTrack);
      
      if (trackRaces.length > 0) {
        if (!jockeyStats.has(r.jockey)) {
          jockeyStats.set(r.jockey, { wins: 0, races: 0, horses: [] });
        }
        const jStats = jockeyStats.get(r.jockey)!;
        jStats.horses.push(`#${r.numPartant}`);
        jStats.races += trackRaces.length;
        jStats.wins += trackRaces.filter(h => h.position === 1).length;

        if (!trainerStats.has(r.trainer)) {
          trainerStats.set(r.trainer, { wins: 0, races: 0, horses: [] });
        }
        const tStats = trainerStats.get(r.trainer)!;
        tStats.horses.push(`#${r.numPartant}`);
        tStats.races += trackRaces.length;
        tStats.wins += trackRaces.filter(h => h.position === 1).length;
      }
    });

    return {
      jockeys: Array.from(jockeyStats.entries())
        .map(([name, stats]) => ({
          name: name.split(' ').slice(-1)[0],
          fullName: name,
          strikeRate: stats.races > 0 ? Math.round((stats.wins / stats.races) * 100) : 0,
          wins: stats.wins,
          races: stats.races,
          horses: stats.horses.join(', ')
        }))
        .filter(j => j.races >= 2)
        .sort((a, b) => b.strikeRate - a.strikeRate),
      trainers: Array.from(trainerStats.entries())
        .map(([name, stats]) => ({
          name: name.split(' ').slice(-1)[0],
          fullName: name,
          strikeRate: stats.races > 0 ? Math.round((stats.wins / stats.races) * 100) : 0,
          wins: stats.wins,
          races: stats.races,
          horses: stats.horses.join(', ')
        }))
        .filter(t => t.races >= 2)
        .sort((a, b) => b.strikeRate - a.strikeRate)
    };
  }

  private computeTripHandicappingChart(runners: RunnerChartData[]) {
    return runners.map(r => {
      const gate = parseInt(r.gate) || 0;
      const fieldSize = runners.length;
      
      let difficulty = 5;
      if (gate <= 3 && fieldSize > 12) difficulty += 2;
      if (gate > fieldSize - 3 && fieldSize > 12) difficulty += 1;
      if (gate > 3 && gate < fieldSize - 3) difficulty -= 1;

      return {
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        gate,
        difficulty: Math.max(1, Math.min(10, difficulty)),
        position: gate <= 3 ? 'Inside' : gate > fieldSize - 3 ? 'Outside' : 'Middle'
      };
    }).sort((a, b) => a.difficulty - b.difficulty);
  }

  private computeRaceShapeChart(runners: RunnerChartData[]) {
    const styles = { frontRunners: 0, pressers: 0, closers: 0 };
    
    const runnerStyles = runners
      .filter(r => r.positions.length >= 3)
      .map(r => {
        const early = r.positions.slice(0, 3);
        const late = r.positions.slice(-3);
        const earlyAvg = early.reduce((a, b) => a + b, 0) / early.length;
        const lateAvg = late.reduce((a, b) => a + b, 0) / late.length;

        let style: string;
        let styleScore: number;
        
        if (earlyAvg < 4) {
          style = 'Front-Runner';
          styleScore = 10;
          styles.frontRunners++;
        } else if (earlyAvg < 7 && lateAvg < earlyAvg) {
          style = 'Presser';
          styleScore = 7;
          styles.pressers++;
        } else {
          style = 'Closer';
          styleScore = 4;
          styles.closers++;
        }

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          style,
          styleScore,
          earlyAvg: Math.round(earlyAvg * 10) / 10,
          lateAvg: Math.round(lateAvg * 10) / 10
        };
      });

    const paceScenario = styles.frontRunners > 3 ? 'Hot Pace' : 
                         styles.frontRunners < 2 ? 'Slow Pace' : 'Moderate Pace';

    return {
      runners: runnerStyles,
      distribution: styles,
      paceScenario,
      advantage: styles.frontRunners > 3 ? 'Closers' : 
                 styles.closers > styles.frontRunners ? 'Front-Runners' : 'Balanced'
    };
  }

  private computeStableConfidenceChart(runners: RunnerChartData[], odds: any) {
    return runners.map(r => {
      let confidence = 50;
      
      if (r.careerStats.winRate > 15) confidence += 15;
      
      const runnerOdds = odds?.find((o: any) => o.num_partant === r.numPartant);
      if (runnerOdds) {
        if (runnerOdds.favori) confidence += 20;
        if (runnerOdds.tendance_signe === '-') confidence += 10;
      }
      
      if (r.positions.length > 0 && r.positions[0] <= 3) confidence += 15;

      return {
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        confidence: Math.min(100, confidence),
        signals: {
          jockeyQuality: r.careerStats.winRate > 15,
          bettingSupport: runnerOdds?.favori || false,
          recentForm: r.positions[0] <= 3
        }
      };
    }).sort((a, b) => b.confidence - a.confidence);
  }


  private computeFormCycleChart(runners: RunnerChartData[]) {
    // Analyze form cycles - improving/declining patterns
    return runners
      .filter(r => r.positions.length >= 6)
      .map(r => {
        const positions = r.positions.slice(0, 6);
        const recent3 = positions.slice(0, 3);
        const previous3 = positions.slice(3, 6);
        
        const recentAvg = recent3.reduce((a, b) => a + b, 0) / 3;
        const previousAvg = previous3.reduce((a, b) => a + b, 0) / 3;
        const trend = previousAvg - recentAvg; // Positive = improving
        
        const cycle = trend > 2 ? 'Improving' : trend < -2 ? 'Declining' : 'Stable';
        const score = Math.round(50 + (trend * 10));

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          cycle,
          score: Math.max(0, Math.min(100, score)),
          recentAvg: Math.round(recentAvg * 10) / 10,
          previousAvg: Math.round(previousAvg * 10) / 10,
          trend: Math.round(trend * 10) / 10
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private computeClassDropRiseChart(runners: RunnerChartData[], currentDistance: number) {
    // Track class changes - dropping/rising in class
    return runners
      .filter(r => r.recentHistory.length >= 3)
      .map(r => {
        const races = r.recentHistory.slice(0, 3);
        const distances = races.map(h => h.distance);
        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        
        // Simplified class indicator based on distance (longer = higher class typically)
        const currentClass = currentDistance;
        const recentClass = avgDistance;
        const classChange = currentClass - recentClass;
        
        const movement = classChange > 200 ? 'Rising' : classChange < -200 ? 'Dropping' : 'Same';
        const advantage = classChange < -200 ? 15 : classChange > 200 ? -10 : 0;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          movement,
          classChange: Math.round(classChange),
          advantage,
          currentClass,
          recentClass: Math.round(recentClass)
        };
      })
      .sort((a, b) => b.advantage - a.advantage);
  }

  private computeSpeedRatingChart(runners: RunnerChartData[]) {
    // Comprehensive speed rating based on multiple factors
    return runners
      .filter(r => r.positions.length >= 3)
      .map(r => {
        const positions = r.positions.slice(0, 5);
        const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
        
        // Base speed rating (100 = perfect, 0 = worst)
        let speedRating = Math.max(0, 100 - (avgPosition * 8));
        
        // Adjust for consistency
        const variance = positions.reduce((sum, p) => sum + Math.pow(p - avgPosition, 2), 0) / positions.length;
        const consistencyBonus = Math.max(0, 10 - variance);
        speedRating += consistencyBonus;
        
        // Adjust for recent form
        if (positions[0] <= 3) speedRating += 10;
        
        // Adjust for class (win rate)
        speedRating += r.careerStats.winRate / 2;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          speedRating: Math.round(Math.min(100, speedRating)),
          avgPosition: Math.round(avgPosition * 10) / 10,
          consistency: Math.round(consistencyBonus),
          class: r.careerStats.winRate
        };
      })
      .sort((a, b) => b.speedRating - a.speedRating);
  }


  // ==========================================
  // TIER 2/3 CHARTS - Batch 3 (7 charts)
  // ==========================================

  private computeLayoffImpactChart(runners: RunnerChartData[]) {
    // Days since last race impact
    return runners
      .filter(r => r.recentHistory.length >= 2)
      .map(r => {
        const lastRaceDate = new Date(r.recentHistory[0].date);
        const today = new Date();
        const daysSince = Math.floor((today.getTime() - lastRaceDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let impact = 'Optimal';
        let score = 100;
        
        if (daysSince < 7) { impact = 'Too Fresh'; score = 70; }
        else if (daysSince <= 21) { impact = 'Optimal'; score = 100; }
        else if (daysSince <= 42) { impact = 'Acceptable'; score = 85; }
        else if (daysSince <= 90) { impact = 'Rusty'; score = 60; }
        else { impact = 'Very Rusty'; score = 40; }

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          daysSince,
          impact,
          score
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  private computeAgeAnalysisChart(runners: RunnerChartData[], discipline: string) {
    // Age vs performance correlation
    return runners.map(r => {
      let peakAge = 4; // Default peak age
      if (discipline === 'Trot') peakAge = 5;
      if (discipline === 'Obstacle') peakAge = 7;
      
      const ageDiff = Math.abs(r.age - peakAge);
      const ageScore = Math.max(0, 100 - (ageDiff * 15));
      
      const status = r.age < peakAge - 1 ? 'Developing' :
                     r.age >= peakAge - 1 && r.age <= peakAge + 1 ? 'Peak' :
                     'Veteran';

      return {
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        age: r.age,
        peakAge,
        ageScore,
        status,
        experience: r.careerStats.races
      };
    }).sort((a, b) => b.ageScore - a.ageScore);
  }

  private computeDistanceChangeChart(runners: RunnerChartData[], currentDistance: number) {
    // Distance change from last race
    return runners
      .filter(r => r.recentHistory.length >= 1)
      .map(r => {
        const lastDistance = r.recentHistory[0].distance;
        const change = currentDistance - lastDistance;
        const changePercent = Math.round((change / lastDistance) * 100);
        
        let impact = 'Neutral';
        if (Math.abs(changePercent) < 10) impact = 'Minimal';
        else if (changePercent > 10) impact = 'Stepping Up';
        else impact = 'Dropping Back';

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          lastDistance,
          currentDistance,
          change,
          changePercent,
          impact
        };
      })
      .sort((a, b) => Math.abs(a.changePercent) - Math.abs(b.changePercent));
  }

  private computeWinnerProfileChart(runners: RunnerChartData[]) {
    // Match to typical winner profile
    return runners.map(r => {
      let profileScore = 0;
      
      // Recent form (30%)
      if (r.positions.length > 0 && r.positions[0] <= 3) profileScore += 30;
      
      // Win rate (25%)
      profileScore += Math.min(25, r.careerStats.winRate * 1.5);
      
      // Consistency (20%)
      if (r.positions.length >= 3) {
        const variance = r.positions.slice(0, 5).reduce((sum, p, i, arr) => {
          const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
          return sum + Math.pow(p - avg, 2);
        }, 0) / Math.min(5, r.positions.length);
        profileScore += Math.max(0, 20 - variance);
      }
      
      // Class (15%)
      if (r.careerStats.earnings > 50000) profileScore += 15;
      else if (r.careerStats.earnings > 20000) profileScore += 10;
      
      // Experience (10%)
      if (r.careerStats.races >= 10) profileScore += 10;
      else profileScore += (r.careerStats.races / 10) * 10;

      return {
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        profileScore: Math.round(profileScore),
        matchLevel: profileScore >= 80 ? 'Strong Match' : 
                    profileScore >= 60 ? 'Good Match' : 
                    profileScore >= 40 ? 'Fair Match' : 'Weak Match'
      };
    }).sort((a, b) => b.profileScore - a.profileScore);
  }

  private computeValueIndexChart(runners: RunnerChartData[], odds: any) {
    // Value index combining multiple factors
    if (!odds) return [];
    
    return runners
      .filter(r => r.odds)
      .map(r => {
        const impliedProb = 100 / (r.odds || 1);
        const winProb = r.careerStats.winRate;
        
        // Value calculation
        const value = winProb - impliedProb;
        const roi = value > 0 ? Math.round((value / impliedProb) * 100) : 0;
        
        // Quality score
        let quality = 50;
        if (r.positions[0] <= 3) quality += 20;
        if (r.careerStats.winRate > 15) quality += 15;
        if (r.careerStats.races >= 10) quality += 15;
        
        const valueIndex = Math.round((value * 2) + (quality / 2));

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          valueIndex,
          value: Math.round(value),
          roi,
          quality,
          odds: r.odds,
          category: valueIndex > 30 ? 'Strong Value' :
                    valueIndex > 15 ? 'Good Value' :
                    valueIndex > 0 ? 'Fair Value' : 'Overbet'
        };
      })
      .sort((a, b) => b.valueIndex - a.valueIndex);
  }

  private computeCompetitionLevelChart(runners: RunnerChartData[]) {
    // Analyze strength of competition
    const avgWinRate = runners.reduce((sum, r) => sum + r.careerStats.winRate, 0) / runners.length;
    const avgEarnings = runners.reduce((sum, r) => sum + r.careerStats.earnings, 0) / runners.length;
    
    return runners.map(r => {
      const winRateVsField = r.careerStats.winRate - avgWinRate;
      const earningsVsField = ((r.careerStats.earnings - avgEarnings) / avgEarnings) * 100;
      
      const competitiveEdge = Math.round((winRateVsField * 2) + (earningsVsField / 10));
      
      const standing = competitiveEdge > 20 ? 'Class Above' :
                       competitiveEdge > 0 ? 'Above Average' :
                       competitiveEdge > -20 ? 'Average' : 'Outclassed';

      return {
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        competitiveEdge,
        standing,
        winRateVsField: Math.round(winRateVsField),
        earningsVsField: Math.round(earningsVsField)
      };
    }).sort((a, b) => b.competitiveEdge - a.competitiveEdge);
  }

  private computeFinishingKickChart(runners: RunnerChartData[]) {
    // Late pace/closing ability
    return runners
      .filter(r => r.positions.length >= 5)
      .map(r => {
        const positions = r.positions.slice(0, 5);
        
        // Calculate improvement from mid-race to finish
        const improvements = [];
        for (let i = 0; i < positions.length - 1; i++) {
          const improvement = positions[i + 1] - positions[i]; // Negative = improved
          improvements.push(improvement);
        }
        
        const avgImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
        const kickScore = Math.round(50 - (avgImprovement * 10));
        
        const kickType = avgImprovement < -1 ? 'Strong Closer' :
                         avgImprovement < 0 ? 'Closer' :
                         avgImprovement < 1 ? 'Steady' : 'Fader';

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          kickScore: Math.max(0, Math.min(100, kickScore)),
          kickType,
          avgImprovement: Math.round(avgImprovement * 10) / 10
        };
      })
      .sort((a, b) => b.kickScore - a.kickScore);
  }


  // ==========================================
  // FINAL BATCH - 6 Charts to Complete Roadmap
  // ==========================================

  private computeBarrierTrialChart(runners: RunnerChartData[]) {
    // Recent trial/workout performance (simplified - would need trial data)
    return runners
      .filter(r => r.recentHistory.length >= 1)
      .map(r => {
        const daysSinceLastRace = Math.floor((new Date().getTime() - new Date(r.recentHistory[0].date).getTime()) / (1000 * 60 * 60 * 24));
        const lastPosition = r.positions[0] || 10;
        
        // Trial score based on recency and last performance
        let trialScore = 50;
        if (daysSinceLastRace <= 14 && lastPosition <= 3) trialScore = 90;
        else if (daysSinceLastRace <= 21 && lastPosition <= 5) trialScore = 75;
        else if (daysSinceLastRace <= 30) trialScore = 60;

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          trialScore,
          daysSince: daysSinceLastRace,
          lastPerformance: lastPosition
        };
      })
      .sort((a, b) => b.trialScore - a.trialScore);
  }

  private computePacePressureChart(runners: RunnerChartData[]) {
    // Expected pace pressure on each runner
    return runners
      .filter(r => r.positions.length >= 3)
      .map(r => {
        const early = r.positions.slice(0, 3);
        const earlyAvg = early.reduce((a, b) => a + b, 0) / 3;
        
        // Count front runners in field
        const frontRunners = runners.filter(runner => {
          if (runner.positions.length < 3) return false;
          const avg = runner.positions.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
          return avg < 4;
        }).length;
        
        let pressureScore = 50;
        if (earlyAvg < 4) {
          // Front runner - more pressure if many front runners
          pressureScore = 30 + (frontRunners * 10);
        } else {
          // Closer - benefits from hot pace
          pressureScore = 70 - (frontRunners * 5);
        }

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          pressureScore: Math.max(0, Math.min(100, pressureScore)),
          style: earlyAvg < 4 ? 'Front Runner' : 'Closer',
          frontRunnersInField: frontRunners
        };
      })
      .sort((a, b) => a.pressureScore - b.pressureScore);
  }

  private computeHotStreakChart(runners: RunnerChartData[]) {
    // Recent winning streaks for jockey/trainer
    return runners.map(r => {
      let streakScore = 0;
      
      // Jockey recent form
      if (r.monteCalculated) {
        const jockeyPositions = this.parseMusic(r.monteCalculated, 5);
        const recentWins = jockeyPositions.filter(p => p === 1).length;
        streakScore += recentWins * 15;
      }
      
      // Trainer recent form
      if (r.trainerCalculated) {
        const trainerPositions = this.parseMusic(r.trainerCalculated, 5);
        const recentWins = trainerPositions.filter(p => p === 1).length;
        streakScore += recentWins * 15;
      }
      
      // Horse recent form
      const horseRecentWins = r.positions.slice(0, 3).filter(p => p === 1).length;
      streakScore += horseRecentWins * 20;

      return {
        name: `#${r.numPartant}`,
        fullName: r.horseName,
        streakScore: Math.min(100, streakScore),
        status: streakScore >= 60 ? 'Hot' : streakScore >= 30 ? 'Warm' : 'Cold'
      };
    }).sort((a, b) => b.streakScore - a.streakScore);
  }

  private computeTrackConditionSpecChart(runners: RunnerChartData[], etatTerrain: string) {
    // Ground condition expertise
    const currentCondition = etatTerrain.toUpperCase();
    
    return runners
      .filter(r => r.groundStats)
      .map(r => {
        const stats = r.groundStats!;
        let specialistScore = 50;
        
        if (currentCondition.includes('BON')) specialistScore = stats.bon;
        else if (currentCondition.includes('SOUPLE')) specialistScore = stats.souple;
        else if (currentCondition.includes('LOURD')) specialistScore = stats.lourd;
        
        const expertise = specialistScore >= 30 ? 'Specialist' :
                         specialistScore >= 15 ? 'Capable' : 'Unproven';

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          specialistScore,
          expertise,
          condition: currentCondition
        };
      })
      .sort((a, b) => b.specialistScore - a.specialistScore);
  }

  private computeDistanceSpecialistChart(runners: RunnerChartData[], currentDistance: number, discipline: string) {
    // Optimal distance range analysis
    return runners
      .filter(r => r.distanceStats)
      .map(r => {
        const ranges = this.getDistanceRanges(discipline);
        
        let suitability = 50;
        if (currentDistance < ranges.short) suitability = r.distanceStats!.short;
        else if (currentDistance >= ranges.long) suitability = r.distanceStats!.long;
        else suitability = r.distanceStats!.medium;
        
        const rating = suitability >= 30 ? 'Ideal' :
                      suitability >= 15 ? 'Suitable' : 'Questionable';

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          suitability,
          rating,
          currentDistance
        };
      })
      .sort((a, b) => b.suitability - a.suitability);
  }

  private computeBounceCandidateChart(runners: RunnerChartData[]) {
    // Regression risk after career-best
    return runners
      .filter(r => r.positions.length >= 5)
      .map(r => {
        const positions = r.positions;
        const lastPosition = positions[0];
        const careerBest = Math.min(...positions);
        const avgPosition = positions.reduce((a, b) => a + b, 0) / positions.length;
        
        let bounceRisk = 0;
        
        // High risk if last race was career best and much better than average
        if (lastPosition === careerBest && lastPosition < avgPosition - 3) {
          bounceRisk = 80;
        } else if (lastPosition <= 2 && lastPosition < avgPosition - 2) {
          bounceRisk = 60;
        } else if (lastPosition < avgPosition) {
          bounceRisk = 30;
        } else {
          bounceRisk = 10;
        }

        return {
          name: `#${r.numPartant}`,
          fullName: r.horseName,
          bounceRisk,
          lastPosition,
          careerBest,
          avgPosition: Math.round(avgPosition * 10) / 10,
          warning: bounceRisk >= 60 ? 'High Risk' : bounceRisk >= 40 ? 'Moderate Risk' : 'Low Risk'
        };
      })
      .sort((a, b) => b.bounceRisk - a.bounceRisk);
  }
}

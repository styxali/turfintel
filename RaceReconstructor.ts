import { DateTime } from 'luxon';

// --- INTERFACES ---
export interface AiFrame {
  timestamp: number;
  clock_str?: string | null;
  speed?: number | null;
  ranks: number[];
  distance_pct: number;
  distance_remaining_m?: number | null;
  distance_total_m?: number | null;
}

export interface AiAnalysisResponse {
  points: AiFrame[];
  series: {
    speed: { t: number; v: number | null }[];
    distance_left_m: { t: number; v: number | null }[];
    distance_pct: { t: number; v: number | null }[];
    clock_str: { t: number; v: string | null }[];
    rank_positions: Record<string, { t: number; pos: number }[]>;
  };
}



export interface StarterInfo {
  num_partant: number;
  nom_cheval: string;
  uuid: string;
  casaque_slug: string;
}

export interface GpsResult {
  casaque: { updated_at: string; slug: string };
  cheval: { nom_cheval: string; uuid: string };
  num_place_arrivee: string;
  num_partant: number;
  texte_place_arrivee: string;
  interne_tracking_gps: {
    tracking_id_nav_partant: string;
    vmax: number;
    temps_officiel: string;
    derniers_600m: string;
    derniers_200m: string;
    derniers_100m: string;
    pos_moy: number;
    pos_mi_course: number;
    parcouru_vs_1er: number;
    active: number;
    tracking_created_at: string;
    tracking_updated_at: string;
    distance_parcouru?: number;
  };
}

export class RaceReconstructor {
  
  /**
   * Main entry: Takes AI time-series and DB Starters -> Returns Final JSON
   */
  public reconstruct(
    frames: AiFrame[], 
    starters: StarterInfo[], 
    totalDist: number = 3200
  ): GpsResult[] {
    
    const horseMap = new Map<number, any>();
    const now = new Date().toISOString();

    // Init stats buckets
    starters.forEach(s => {
      horseMap.set(s.num_partant, {
        info: s,
        vmax: 0,
        positions: [] as number[],
        finish_rank: 99
      });
    });

    // --- TIMING ANALYSIS ---
    let finishTime = 0;
    let t600 = 0;
    let t200 = 0;
    
    // Thresholds
    const pct600 = (1 - (600 / totalDist)) * 100;
    const pct200 = (1 - (200 / totalDist)) * 100;

    frames.forEach(f => {
      // 1. Detect splits based on Distance Percentage
      if (f.distance_pct >= pct600 && t600 === 0) t600 = f.timestamp;
      if (f.distance_pct >= pct200 && t200 === 0) t200 = f.timestamp;
      if (f.distance_pct >= 99 && finishTime === 0) finishTime = f.timestamp;

      // 2. Map Horse Data
      f.ranks.forEach((num, idx) => {
        const h = horseMap.get(num);
        if (!h) return;

        const rank = idx + 1;
        h.positions.push(rank);

        // Max Speed Logic (Assign leader speed if horse is in top 5)
        if (rank <= 5 && f.speed && f.speed > h.vmax) {
          h.vmax = f.speed;
        }
      });
    });

    // Fallback if race finish not caught
    if (finishTime === 0 && frames.length > 0) {
      finishTime = frames[frames.length - 1].timestamp;
    }

    // --- FINAL RESULTS BUILDER ---
    const lastFrame = frames[frames.length - 1];
    
    // Assign Finish Rank based on LAST detected frame
    lastFrame.ranks.forEach((num, idx) => {
      const h = horseMap.get(num);
      if(h) h.finish_rank = idx + 1;
    });

    const results: GpsResult[] = [];

    horseMap.forEach((stats, num) => {
      if (stats.positions.length === 0) return; // Horse not seen

      // Avg Position
      const sum = stats.positions.reduce((a:number, b:number) => a + b, 0);
      const posMoy = Math.round(sum / stats.positions.length);
      
      // Mid Position
      const midIdx = Math.floor(stats.positions.length / 2);
      const posMi = stats.positions[midIdx] || posMoy;

      // Durations
      const totalDur = finishTime; 
      const d600 = t600 > 0 ? (finishTime - t600) : 0;
      const d200 = t200 > 0 ? (finishTime - t200) : 0;

      // Format String "01" etc
      const rankStr = stats.finish_rank < 10 ? `0${stats.finish_rank}` : `${stats.finish_rank}`;

      results.push({
        casaque: { updated_at: now, slug: stats.info.casaque_slug },
        cheval: { nom_cheval: stats.info.nom_cheval, uuid: stats.info.uuid },
        num_place_arrivee: rankStr,
        num_partant: num,
        texte_place_arrivee: rankStr,
        interne_tracking_gps: {
          tracking_id_nav_partant: `AI-${uuid()}`,
          vmax: stats.vmax || 62.5, // Default average if 0
          temps_officiel: this.fmtTime(totalDur),
          derniers_600m: this.fmtTime(d600),
          derniers_200m: this.fmtTime(d200),
          derniers_100m: "00'00''00", // Hard to estimate
          pos_moy: posMoy,
          pos_mi_course: posMi,
          parcouru_vs_1er: 0,
          active: 1,
          tracking_created_at: now,
          tracking_updated_at: now
        }
      });
    });

    // Sort by arrival
    return results.sort((a, b) => 
      parseInt(a.num_place_arrivee) - parseInt(b.num_place_arrivee)
    );
  }

  // Helper: Seconds -> 03'28''53
  private fmtTime(sec: number): string {
    if (sec <= 0) return "00'00''00";
    return DateTime.fromMillis(sec * 1000).toFormat("mm'ss''SS");
  }
}

// Simple UUID helper for the TS file
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
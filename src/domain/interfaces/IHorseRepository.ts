import * as Types from '../../shared/types/types';

// Repository interface for Horse operations
export interface IHorseRepository {
  // Find operations
  findBySlug(slug: string): Promise<HorseEntity | null>;
  findByUuid(uuid: string): Promise<HorseEntity | null>;
  
  // Save operations
  saveHorse(horse: HorseData): Promise<void>;
  saveHistory(horseSlug: string, history: Types.HorseHistoryResponse): Promise<void>;
  saveStats(horseSlug: string, stats: Types.HorseStatsResponse): Promise<void>;
  
  // Check if data exists
  hasHistory(horseSlug: string): Promise<boolean>;
  hasStats(horseSlug: string): Promise<boolean>;
}

// Domain entity for Horse
export interface HorseEntity {
  id: string;
  uuid: string;
  slug: string;
  nomCheval: string;
  sexeCheval: string;
  ageCheval: number;
  musique: string;
  gainsCarriere: number;
  chevalCalculated?: string;
  trainerCalculated?: string;
  monteCalculated?: string;
  createdAt: Date;
  updatedAt: Date;
  // JSON fields
  history?: any;
  stats?: any;
}

// Data for saving horse
export interface HorseData {
  uuid: string;
  slug: string;
  nomCheval: string;
  sexeCheval: string;
  ageCheval: number;
  musique: string;
  gainsCarriere: number;
  chevalCalculated?: string;
  trainerCalculated?: string;
  monteCalculated?: string;
}

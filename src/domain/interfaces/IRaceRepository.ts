import { RaceParams } from '../value-objects/RaceParams';
import * as Types from '../../shared/types/types';

// Repository interface for Race operations
export interface IRaceRepository {
  // Find operations
  findByGuid(guid: string): Promise<RaceEntity | null>;
  findByGuidWithPartants(guid: string): Promise<any | null>;
  findByParams(params: RaceParams): Promise<RaceEntity | null>;
  findUpcoming(date: string): Promise<RaceEntity[]>;
  
  // Save operations
  saveRaceDetails(raceDetails: Types.RaceDetailResponse): Promise<void>;
  savePronostic(guid: string, pronostic: Types.PronosticResponse): Promise<void>;
  saveInterviews(guid: string, interviews: Types.InterviewResponse): Promise<void>;
  saveNotes(guid: string, notes: Types.NoteResponse): Promise<void>;
  saveTracking(guid: string, tracking: Types.TrackingResponse): Promise<void>;
  saveNotule(guid: string, notule: Types.NotuleResponse): Promise<void>;
  saveReferences(guid: string, references: Types.ReferencesResponse): Promise<void>;
  saveRapports(guid: string, rapports: Types.RapportResponse): Promise<void>;
  savePariSimple(guid: string, pariSimple: Types.PariSimpleResponse): Promise<void>;
  
  // Check if data exists
  hasPronostic(guid: string): Promise<boolean>;
  hasTracking(guid: string): Promise<boolean>;
}

// Domain entity for Race
export interface RaceEntity {
  id: string;
  guid: string;
  uuid: string;
  date: string;
  reunion: string;
  course: string;
  numCoursePmu: number;
  libcourtPrixCourse: string;
  discipline: string;
  distance: number;
  etatTerrain: string;
  heureDepartCourse: string;
  isQuintePlus: boolean;
  tracked: boolean;
  createdAt: Date;
  updatedAt: Date;
  // JSON fields
  raceDetails?: any;
  pronostic?: any;
  interviews?: any;
  notes?: any;
  tracking?: any;
  notule?: any;
  references?: any;
  rapports?: any;
  pariSimple?: any;
}

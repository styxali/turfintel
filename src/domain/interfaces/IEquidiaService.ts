import { RaceParams } from '../value-objects/RaceParams';
import * as Types from '../../shared/types/types';

// Service interface for Equidia API
export interface IEquidiaService {
  getCourseDetails(params: RaceParams): Promise<Types.RaceDetailResponse>;
  getPronostic(params: RaceParams): Promise<Types.PronosticResponse>;
  getInterview(params: RaceParams): Promise<Types.InterviewResponse>;
  getNote(params: RaceParams): Promise<Types.NoteResponse>;
  getRapports(params: RaceParams): Promise<Types.RapportResponse>;
  getReferences(params: RaceParams): Promise<Types.ReferencesResponse>;
  getArticles(params: RaceParams): Promise<Types.ArticleResponse>;
  getPariSimple(params: RaceParams): Promise<Types.PariSimpleResponse>;
  getNotule(params: RaceParams): Promise<Types.NotuleResponse>;
  getTracking(params: RaceParams): Promise<Types.TrackingResponse>;
  getDailyReunions(date: string): Promise<Types.DailyReunionResponse>;
  getHorseHistory(horseSlug: string, options?: any): Promise<Types.HorseHistoryResponse>;
  getHorseStats(horseSlug: string): Promise<Types.HorseStatsResponse>;
  getHorseLastOrNext(horseSlug: string): Promise<Types.HorseLastOrNextResponse>;
  getVideoPlayer(videoId: string): Promise<Types.VideoPlayerResponse>;
}

import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { ExternalApiError } from '../../../shared/errors/DomainErrors';
import EquidiaClient from './equidia-v2';
import * as Types from '../../../shared/types/types';

export class EquidiaService implements IEquidiaService {
  private client: EquidiaClient;

  constructor() {
    this.client = new EquidiaClient();
  }

  async getCourseDetails(params: RaceParams): Promise<Types.RaceDetailResponse> {
    try {
      return await this.client.getCourseDetails({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch course details: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getPronostic(params: RaceParams): Promise<Types.PronosticResponse> {
    try {
      return await this.client.getPronostic({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch pronostic: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getInterview(params: RaceParams): Promise<Types.InterviewResponse> {
    try {
      return await this.client.getInterview({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      // Interviews might not exist for all races
      return {} as Types.InterviewResponse;
    }
  }

  async getNote(params: RaceParams): Promise<Types.NoteResponse> {
    try {
      return await this.client.getNote({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch notes: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getRapports(params: RaceParams): Promise<Types.RapportResponse> {
    try {
      return await this.client.getRapports({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch rapports: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getReferences(params: RaceParams): Promise<Types.ReferencesResponse> {
    try {
      return await this.client.getReferences({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch references: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getArticles(params: RaceParams): Promise<Types.ArticleResponse> {
    try {
      return await this.client.getArticles({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch articles: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getPariSimple(params: RaceParams): Promise<Types.PariSimpleResponse> {
    try {
      return await this.client.getPariSimple({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch pari simple: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getNotule(params: RaceParams): Promise<Types.NotuleResponse> {
    try {
      return await this.client.getNotule({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      // Notules might not exist for all races
      return {} as Types.NotuleResponse;
    }
  }

  async getTracking(params: RaceParams): Promise<Types.TrackingResponse> {
    try {
      return await this.client.getTracking({
        date: params.date,
        reunion: params.reunion,
        course: params.course
      });
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch tracking: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getDailyReunions(date: string): Promise<Types.DailyReunionResponse> {
    try {
      return await this.client.getDailyReunions(date);
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch daily reunions: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getHorseHistory(horseSlug: string, options?: any): Promise<Types.HorseHistoryResponse> {
    try {
      return await this.client.getHorseHistory(horseSlug, options);
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch horse history: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getHorseStats(horseSlug: string): Promise<Types.HorseStatsResponse> {
    try {
      return await this.client.getHorseStats(horseSlug);
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch horse stats: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getHorseLastOrNext(horseSlug: string): Promise<Types.HorseLastOrNextResponse> {
    try {
      return await this.client.getHorseLastOrNext(horseSlug);
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch horse last/next: ${error.message}`,
        'Equidia',
        error
      );
    }
  }

  async getVideoPlayer(videoId: string): Promise<Types.VideoPlayerResponse> {
    try {
      return await this.client.getVideoPlayer(videoId);
    } catch (error: any) {
      throw new ExternalApiError(
        `Failed to fetch video player: ${error.message}`,
        'Equidia',
        error
      );
    }
  }
}

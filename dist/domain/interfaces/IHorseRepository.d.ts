import * as Types from '../../shared/types/types';
export interface IHorseRepository {
    findBySlug(slug: string): Promise<HorseEntity | null>;
    findByUuid(uuid: string): Promise<HorseEntity | null>;
    saveHorse(horse: HorseData): Promise<void>;
    saveHistory(horseSlug: string, history: Types.HorseHistoryResponse): Promise<void>;
    saveStats(horseSlug: string, stats: Types.HorseStatsResponse): Promise<void>;
    hasHistory(horseSlug: string): Promise<boolean>;
    hasStats(horseSlug: string): Promise<boolean>;
}
export interface HorseEntity {
    id: string;
    uuid: string;
    slug: string;
    nomCheval: string;
    sexeCheval: string;
    ageCheval: number;
    musique: string;
    gainsCarriere: number;
    createdAt: Date;
    updatedAt: Date;
    history?: any;
    stats?: any;
}
export interface HorseData {
    uuid: string;
    slug: string;
    nomCheval: string;
    sexeCheval: string;
    ageCheval: number;
    musique: string;
    gainsCarriere: number;
}
//# sourceMappingURL=IHorseRepository.d.ts.map
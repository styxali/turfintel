import { PrismaClient } from '@prisma/client';
import { IHorseRepository, HorseEntity, HorseData } from '../../../domain/interfaces/IHorseRepository';
import * as Types from '../../../shared/types/types';
export declare class PrismaHorseRepository implements IHorseRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findBySlug(slug: string): Promise<HorseEntity | null>;
    findByUuid(uuid: string): Promise<HorseEntity | null>;
    saveHorse(horseData: HorseData): Promise<void>;
    saveHistory(horseSlug: string, history: Types.HorseHistoryResponse): Promise<void>;
    saveStats(horseSlug: string, stats: Types.HorseStatsResponse): Promise<void>;
    hasHistory(horseSlug: string): Promise<boolean>;
    hasStats(horseSlug: string): Promise<boolean>;
}
//# sourceMappingURL=PrismaHorseRepository.d.ts.map
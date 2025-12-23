import { PrismaClient } from '@prisma/client';
import { IRaceRepository, RaceEntity } from '../../../domain/interfaces/IRaceRepository';
import { RaceParams } from '../../../domain/value-objects/RaceParams';
import * as Types from '../../../shared/types/types';
export declare class PrismaRaceRepository implements IRaceRepository {
    private prisma;
    constructor(prisma: PrismaClient);
    findByGuid(guid: string): Promise<RaceEntity | null>;
    findByParams(params: RaceParams): Promise<RaceEntity | null>;
    findUpcoming(date: string): Promise<RaceEntity[]>;
    saveRaceDetails(raceDetails: Types.RaceDetailResponse): Promise<void>;
    savePronostic(guid: string, pronostic: Types.PronosticResponse): Promise<void>;
    saveInterviews(guid: string, interviews: Types.InterviewResponse): Promise<void>;
    saveNotes(guid: string, notes: Types.NoteResponse): Promise<void>;
    saveTracking(guid: string, tracking: Types.TrackingResponse): Promise<void>;
    saveNotule(guid: string, notule: Types.NotuleResponse): Promise<void>;
    saveReferences(guid: string, references: Types.ReferencesResponse): Promise<void>;
    saveRapports(guid: string, rapports: Types.RapportResponse): Promise<void>;
    savePariSimple(guid: string, pariSimple: Types.PariSimpleResponse): Promise<void>;
    hasPronostic(guid: string): Promise<boolean>;
    hasTracking(guid: string): Promise<boolean>;
    private buildGuid;
}
//# sourceMappingURL=PrismaRaceRepository.d.ts.map
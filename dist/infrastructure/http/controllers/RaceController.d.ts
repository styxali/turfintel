import { Request, Response, NextFunction } from 'express';
import { GetRaceDetailsUseCase } from '../../../application/use-cases/race/GetRaceDetails';
import { GetDailyRacesUseCase } from '../../../application/use-cases/race/GetDailyRaces';
import { GetPronosticUseCase } from '../../../application/use-cases/race/GetPronostic';
import { GetInterviewUseCase } from '../../../application/use-cases/race/GetInterview';
import { GetNoteUseCase } from '../../../application/use-cases/race/GetNote';
import { GetRapportsUseCase } from '../../../application/use-cases/race/GetRapports';
import { GetReferencesUseCase } from '../../../application/use-cases/race/GetReferences';
import { GetArticlesUseCase } from '../../../application/use-cases/race/GetArticles';
import { GetPariSimpleUseCase } from '../../../application/use-cases/race/GetPariSimple';
import { GetNotuleUseCase } from '../../../application/use-cases/race/GetNotule';
import { GetTrackingUseCase } from '../../../application/use-cases/race/GetTracking';
export declare class RaceController {
    private getRaceDetailsUseCase;
    private getDailyRacesUseCase;
    private getPronosticUseCase;
    private getInterviewUseCase;
    private getNoteUseCase;
    private getRapportsUseCase;
    private getReferencesUseCase;
    private getArticlesUseCase;
    private getPariSimpleUseCase;
    private getNotuleUseCase;
    private getTrackingUseCase;
    constructor(getRaceDetailsUseCase: GetRaceDetailsUseCase, getDailyRacesUseCase: GetDailyRacesUseCase, getPronosticUseCase: GetPronosticUseCase, getInterviewUseCase: GetInterviewUseCase, getNoteUseCase: GetNoteUseCase, getRapportsUseCase: GetRapportsUseCase, getReferencesUseCase: GetReferencesUseCase, getArticlesUseCase: GetArticlesUseCase, getPariSimpleUseCase: GetPariSimpleUseCase, getNotuleUseCase: GetNotuleUseCase, getTrackingUseCase: GetTrackingUseCase);
    getRaceDetails: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getDailyRaces: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPronostic: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getInterview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNote: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRapports: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getReferences: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getArticles: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPariSimple: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getNotule: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTracking: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=RaceController.d.ts.map
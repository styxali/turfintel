import { Request, Response, NextFunction } from 'express';
import { GetHorseHistoryUseCase } from '../../../application/use-cases/horse/GetHorseHistory';
import { GetHorseStatsUseCase } from '../../../application/use-cases/horse/GetHorseStats';
import { GetHorseLastOrNextUseCase } from '../../../application/use-cases/horse/GetHorseLastOrNext';
export declare class HorseController {
    private getHorseHistoryUseCase;
    private getHorseStatsUseCase;
    private getHorseLastOrNextUseCase;
    constructor(getHorseHistoryUseCase: GetHorseHistoryUseCase, getHorseStatsUseCase: GetHorseStatsUseCase, getHorseLastOrNextUseCase: GetHorseLastOrNextUseCase);
    getHorseHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getHorseStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getHorseLastOrNext: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    private parseHistoryOptions;
}
//# sourceMappingURL=HorseController.d.ts.map
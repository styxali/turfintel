import { Request, Response, NextFunction } from 'express';
import { GetHorseHistoryUseCase } from '../../../application/use-cases/horse/GetHorseHistory';
import { GetHorseStatsUseCase } from '../../../application/use-cases/horse/GetHorseStats';
import { GetHorseLastOrNextUseCase } from '../../../application/use-cases/horse/GetHorseLastOrNext';

export class HorseController {
  constructor(
    private getHorseHistoryUseCase: GetHorseHistoryUseCase,
    private getHorseStatsUseCase: GetHorseStatsUseCase,
    private getHorseLastOrNextUseCase: GetHorseLastOrNextUseCase
  ) {}

  getHorseHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { horseSlug } = req.params;
      const options = this.parseHistoryOptions(req.query);

      const history = await this.getHorseHistoryUseCase.execute(horseSlug, options);

      res.setHeader('X-Cache-Key', `horse:history:${horseSlug}`);
      res.json(history);
    } catch (error) {
      next(error);
    }
  };

  getHorseStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { horseSlug } = req.params;
      const stats = await this.getHorseStatsUseCase.execute(horseSlug);

      res.setHeader('X-Cache-Key', `horse:stats:${horseSlug}`);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  getHorseLastOrNext = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { horseSlug } = req.params;
      const lastOrNext = await this.getHorseLastOrNextUseCase.execute(horseSlug);

      res.setHeader('X-Cache-Key', `horse:last-or-next:${horseSlug}`);
      res.json(lastOrNext);
    } catch (error) {
      next(error);
    }
  };

  private parseHistoryOptions(query: any): any {
    const options: any = {};

    if (query.range) {
      const str = String(query.range);
      if (str.startsWith('[')) {
        try {
          const arr = JSON.parse(str);
          if (Array.isArray(arr) && arr.length === 2) {
            options.range = [Number(arr[0]), Number(arr[1])];
          }
        } catch {
          // ignore
        }
      } else {
        const parts = str.split(',');
        if (parts.length === 2) {
          options.range = [Number(parts[0]), Number(parts[1])];
        }
      }
    }

    if (query.with_meta !== undefined) {
      options.with_meta = query.with_meta === 'true';
    }

    if (query.sort) {
      const str = String(query.sort);
      if (str.startsWith('[')) {
        try {
          const arr = JSON.parse(str);
          if (Array.isArray(arr) && arr.length === 2) {
            options.sort = [String(arr[0]), String(arr[1])];
          }
        } catch {
          // ignore
        }
      } else {
        const parts = str.split(',');
        if (parts.length === 2) {
          options.sort = [parts[0], parts[1]];
        }
      }
    }

    if (query.forceUnreliable !== undefined) {
      options.forceUnreliable = Number(query.forceUnreliable);
    }

    return options;
  }
}

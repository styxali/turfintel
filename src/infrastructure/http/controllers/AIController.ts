import { Request, Response } from 'express';
import { GetRaceForAIUseCase } from '../../../application/use-cases/race/GetRaceForAI';
import { RaceParams } from '../../../domain/value-objects/RaceParams';

export class AIController {
  constructor(private getRaceForAIUseCase: GetRaceForAIUseCase) {}

  getRaceForAI = async (req: Request, res: Response) => {
    try {
      const { date, reunion, course } = req.query;

      if (!date || !reunion || !course) {
        return res.status(400).json({
          error: 'Missing required parameters: date, reunion, course'
        });
      }

      const params = new RaceParams(
        date as string,
        reunion as string,
        course as string
      );

      const data = await this.getRaceForAIUseCase.execute(params);

      res.json(data);
    } catch (error: any) {
      console.error('[AI] Error:', error.message);
      res.status(500).json({ error: error.message });
    }
  };
}

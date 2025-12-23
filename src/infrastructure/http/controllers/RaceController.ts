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
import { GetRaceChartDataUseCase } from '../../../application/use-cases/race/GetRaceChartData';
import { RaceParams } from '../../../domain/value-objects/RaceParams';

export class RaceController {
  constructor(
    private getRaceDetailsUseCase: GetRaceDetailsUseCase,
    private getDailyRacesUseCase: GetDailyRacesUseCase,
    private getPronosticUseCase: GetPronosticUseCase,
    private getInterviewUseCase: GetInterviewUseCase,
    private getNoteUseCase: GetNoteUseCase,
    private getRapportsUseCase: GetRapportsUseCase,
    private getReferencesUseCase: GetReferencesUseCase,
    private getArticlesUseCase: GetArticlesUseCase,
    private getPariSimpleUseCase: GetPariSimpleUseCase,
    private getNotuleUseCase: GetNotuleUseCase,
    private getTrackingUseCase: GetTrackingUseCase,
    private getRaceChartDataUseCase: GetRaceChartDataUseCase
  ) {}

  getRaceDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const enrich = req.query.enrich !== 'false';

      const race = await this.getRaceDetailsUseCase.execute(params, enrich);

      res.setHeader('X-Cache-Key', `race:details:${params.toGuid()}`);
      res.json(race);
    } catch (error) {
      next(error);
    }
  };

  getDailyRaces = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.params;
      
      const races = await this.getDailyRacesUseCase.execute(date);

      res.setHeader('X-Cache-Key', `daily:races:${date}`);
      res.json(races);
    } catch (error) {
      next(error);
    }
  };

  getPronostic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const pronostic = await this.getPronosticUseCase.execute(params);

      res.setHeader('X-Cache-Key', `race:pronostic:${params.toGuid()}`);
      res.json(pronostic);
    } catch (error) {
      next(error);
    }
  };

  getInterview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const interview = await this.getInterviewUseCase.execute(params);

      res.setHeader('X-Cache-Key', `race:interview:${params.toGuid()}`);
      res.json(interview);
    } catch (error) {
      next(error);
    }
  };

  getNote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const note = await this.getNoteUseCase.execute(params);

      res.setHeader('X-Cache-Key', `race:note:${params.toGuid()}`);
      res.json(note);
    } catch (error) {
      next(error);
    }
  };

  getRapports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const rapports = await this.getRapportsUseCase.execute(params);

      res.setHeader('X-Cache-Key', `race:rapports:${params.toGuid()}`);
      res.json(rapports);
    } catch (error) {
      next(error);
    }
  };

  getReferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const references = await this.getReferencesUseCase.execute(params);

      res.setHeader('X-Cache-Key', `race:references:${params.toGuid()}`);
      res.json(references);
    } catch (error) {
      next(error);
    }
  };

  getArticles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const articles = await this.getArticlesUseCase.execute(params);

      res.setHeader('X-Cache-Key', `race:articles:${params.toGuid()}`);
      res.json(articles);
    } catch (error) {
      next(error);
    }
  };

  getPariSimple = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const pariSimple = await this.getPariSimpleUseCase.execute(params);

      res.setHeader('X-Cache-Key', `race:pari-simple:${params.toGuid()}`);
      res.json(pariSimple);
    } catch (error) {
      next(error);
    }
  };

  getNotule = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const notule = await this.getNotuleUseCase.execute(params);

      res.setHeader('X-Cache-Key', `race:notule:${params.toGuid()}`);
      res.json(notule);
    } catch (error) {
      next(error);
    }
  };

  getTracking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const tracking = await this.getTrackingUseCase.execute(params);

      res.setHeader('X-Cache-Key', `race:tracking:${params.toGuid()}`);
      res.json(tracking);
    } catch (error) {
      next(error);
    }
  };

  getChartData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = RaceParams.fromQuery(req.query);
      const guid = params.toGuid();
      
      const chartData = await this.getRaceChartDataUseCase.execute(guid);

      res.setHeader('X-Cache-Key', `race:chart-data:${guid}`);
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
      res.json(chartData);
    } catch (error) {
      next(error);
    }
  };
}

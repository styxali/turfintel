"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaceController = void 0;
const RaceParams_1 = require("../../../domain/value-objects/RaceParams");
class RaceController {
    constructor(getRaceDetailsUseCase, getDailyRacesUseCase, getPronosticUseCase, getInterviewUseCase, getNoteUseCase, getRapportsUseCase, getReferencesUseCase, getArticlesUseCase, getPariSimpleUseCase, getNotuleUseCase, getTrackingUseCase) {
        this.getRaceDetailsUseCase = getRaceDetailsUseCase;
        this.getDailyRacesUseCase = getDailyRacesUseCase;
        this.getPronosticUseCase = getPronosticUseCase;
        this.getInterviewUseCase = getInterviewUseCase;
        this.getNoteUseCase = getNoteUseCase;
        this.getRapportsUseCase = getRapportsUseCase;
        this.getReferencesUseCase = getReferencesUseCase;
        this.getArticlesUseCase = getArticlesUseCase;
        this.getPariSimpleUseCase = getPariSimpleUseCase;
        this.getNotuleUseCase = getNotuleUseCase;
        this.getTrackingUseCase = getTrackingUseCase;
        this.getRaceDetails = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const enrich = req.query.enrich !== 'false';
                const race = await this.getRaceDetailsUseCase.execute(params, enrich);
                res.setHeader('X-Cache-Key', `race:details:${params.toGuid()}`);
                res.json(race);
            }
            catch (error) {
                next(error);
            }
        };
        this.getDailyRaces = async (req, res, next) => {
            try {
                const { date } = req.params;
                const races = await this.getDailyRacesUseCase.execute(date);
                res.setHeader('X-Cache-Key', `daily:races:${date}`);
                res.json(races);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPronostic = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const pronostic = await this.getPronosticUseCase.execute(params);
                res.setHeader('X-Cache-Key', `race:pronostic:${params.toGuid()}`);
                res.json(pronostic);
            }
            catch (error) {
                next(error);
            }
        };
        this.getInterview = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const interview = await this.getInterviewUseCase.execute(params);
                res.setHeader('X-Cache-Key', `race:interview:${params.toGuid()}`);
                res.json(interview);
            }
            catch (error) {
                next(error);
            }
        };
        this.getNote = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const note = await this.getNoteUseCase.execute(params);
                res.setHeader('X-Cache-Key', `race:note:${params.toGuid()}`);
                res.json(note);
            }
            catch (error) {
                next(error);
            }
        };
        this.getRapports = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const rapports = await this.getRapportsUseCase.execute(params);
                res.setHeader('X-Cache-Key', `race:rapports:${params.toGuid()}`);
                res.json(rapports);
            }
            catch (error) {
                next(error);
            }
        };
        this.getReferences = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const references = await this.getReferencesUseCase.execute(params);
                res.setHeader('X-Cache-Key', `race:references:${params.toGuid()}`);
                res.json(references);
            }
            catch (error) {
                next(error);
            }
        };
        this.getArticles = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const articles = await this.getArticlesUseCase.execute(params);
                res.setHeader('X-Cache-Key', `race:articles:${params.toGuid()}`);
                res.json(articles);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPariSimple = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const pariSimple = await this.getPariSimpleUseCase.execute(params);
                res.setHeader('X-Cache-Key', `race:pari-simple:${params.toGuid()}`);
                res.json(pariSimple);
            }
            catch (error) {
                next(error);
            }
        };
        this.getNotule = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const notule = await this.getNotuleUseCase.execute(params);
                res.setHeader('X-Cache-Key', `race:notule:${params.toGuid()}`);
                res.json(notule);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTracking = async (req, res, next) => {
            try {
                const params = RaceParams_1.RaceParams.fromQuery(req.query);
                const tracking = await this.getTrackingUseCase.execute(params);
                res.setHeader('X-Cache-Key', `race:tracking:${params.toGuid()}`);
                res.json(tracking);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.RaceController = RaceController;
//# sourceMappingURL=RaceController.js.map
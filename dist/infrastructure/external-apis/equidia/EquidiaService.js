"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquidiaService = void 0;
const DomainErrors_1 = require("../../../shared/errors/DomainErrors");
const equidia_v2_1 = __importDefault(require("./equidia-v2"));
class EquidiaService {
    constructor() {
        this.client = new equidia_v2_1.default();
    }
    async getCourseDetails(params) {
        try {
            return await this.client.getCourseDetails({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch course details: ${error.message}`, 'Equidia', error);
        }
    }
    async getPronostic(params) {
        try {
            return await this.client.getPronostic({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch pronostic: ${error.message}`, 'Equidia', error);
        }
    }
    async getInterview(params) {
        try {
            return await this.client.getInterview({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            // Interviews might not exist for all races
            return {};
        }
    }
    async getNote(params) {
        try {
            return await this.client.getNote({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch notes: ${error.message}`, 'Equidia', error);
        }
    }
    async getRapports(params) {
        try {
            return await this.client.getRapports({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch rapports: ${error.message}`, 'Equidia', error);
        }
    }
    async getReferences(params) {
        try {
            return await this.client.getReferences({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch references: ${error.message}`, 'Equidia', error);
        }
    }
    async getArticles(params) {
        try {
            return await this.client.getArticles({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch articles: ${error.message}`, 'Equidia', error);
        }
    }
    async getPariSimple(params) {
        try {
            return await this.client.getPariSimple({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch pari simple: ${error.message}`, 'Equidia', error);
        }
    }
    async getNotule(params) {
        try {
            return await this.client.getNotule({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            // Notules might not exist for all races
            return {};
        }
    }
    async getTracking(params) {
        try {
            return await this.client.getTracking({
                date: params.date,
                reunion: params.reunion,
                course: params.course
            });
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch tracking: ${error.message}`, 'Equidia', error);
        }
    }
    async getDailyReunions(date) {
        try {
            return await this.client.getDailyReunions(date);
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch daily reunions: ${error.message}`, 'Equidia', error);
        }
    }
    async getHorseHistory(horseSlug, options) {
        try {
            return await this.client.getHorseHistory(horseSlug, options);
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch horse history: ${error.message}`, 'Equidia', error);
        }
    }
    async getHorseStats(horseSlug) {
        try {
            return await this.client.getHorseStats(horseSlug);
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch horse stats: ${error.message}`, 'Equidia', error);
        }
    }
    async getHorseLastOrNext(horseSlug) {
        try {
            return await this.client.getHorseLastOrNext(horseSlug);
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch horse last/next: ${error.message}`, 'Equidia', error);
        }
    }
    async getVideoPlayer(videoId) {
        try {
            return await this.client.getVideoPlayer(videoId);
        }
        catch (error) {
            throw new DomainErrors_1.ExternalApiError(`Failed to fetch video player: ${error.message}`, 'Equidia', error);
        }
    }
}
exports.EquidiaService = EquidiaService;
//# sourceMappingURL=EquidiaService.js.map
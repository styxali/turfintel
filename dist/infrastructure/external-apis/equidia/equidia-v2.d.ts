import { RaceParams, HorseHistoryParams, VideoPlayerResponse, RaceDetailResponse, PronosticResponse, InterviewResponse, NoteResponse, RapportResponse, ArticleResponse, ReferencesResponse, DailyReunionResponse, NotuleResponse, TrackingResponse, PariSimpleResponse, HorseHistoryResponse, HorseStatsResponse, HorseLastOrNextResponse, HorseFicheInRaceResponse, PronoStatsResponse, StaticAnimationResponse, HorseFavoritesResponse } from "../../../shared/types/types";
export default class EquidiaClient {
    private baseUrl;
    private headers;
    private buildQuery;
    private request;
    private get;
    private post;
    private formatCourse;
    getCourseDetails(params: RaceParams): Promise<RaceDetailResponse>;
    getPronostic(params: RaceParams): Promise<PronosticResponse>;
    getInterview(params: RaceParams): Promise<InterviewResponse>;
    getNote(params: RaceParams): Promise<NoteResponse>;
    getRapports(params: RaceParams): Promise<RapportResponse>;
    getReferences(params: RaceParams): Promise<ReferencesResponse>;
    getDailyReunions(date: string): Promise<DailyReunionResponse>;
    getArticles(params: RaceParams): Promise<ArticleResponse>;
    getPariSimple(params: RaceParams): Promise<PariSimpleResponse>;
    getNotule(params: RaceParams): Promise<NotuleResponse>;
    getTracking(params: RaceParams): Promise<TrackingResponse>;
    getVideoPlayer(videoId: string): Promise<VideoPlayerResponse>;
    getHorseLastOrNext(horseSlug: string): Promise<HorseLastOrNextResponse>;
    getHorseHistory(horseSlug: string, options?: HorseHistoryParams): Promise<HorseHistoryResponse>;
    getHorseStats(horseSlug: string): Promise<HorseStatsResponse>;
    getHorseFicheInRace(params: RaceParams, horseSlug: string): Promise<HorseFicheInRaceResponse>;
    postPronoStats(courseId: string): Promise<PronoStatsResponse>;
    getStaticAnimation(): Promise<StaticAnimationResponse>;
    postHorseFavorites(uuids: string[]): Promise<HorseFavoritesResponse>;
}
//# sourceMappingURL=equidia-v2.d.ts.map
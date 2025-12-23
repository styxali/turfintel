import {
  RaceParams,
  HorseHistoryParams,
  VideoPlayerResponse,
  RaceDetailResponse,
  PronosticResponse,
  InterviewResponse,
  NoteResponse,
  RapportResponse,
  ArticleResponse,
  ReferencesResponse,
  DailyReunionResponse,
  NotuleResponse,
  TrackingResponse,
  PariSimpleResponse,
  HorseHistoryResponse,
  HorseStatsResponse,
  HorseLastOrNextResponse,
  HorseFicheInRaceResponse,
  PronoStatsResponse,
  StaticAnimationResponse,
  HorseFavoritesResponse,
} from "../../../shared/types/types";

export default class EquidiaClient {
  private baseUrl = "https://api.equidia.fr";

  private headers: Record<string, string> = {
    // Standard User-Agent is MANDATORY when sending sec-ch-ua headers
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",

    // Your exact headers
    accept: "application/json, text/plain, */*",
    "accept-language":
      "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar;q=0.6",
    "content-type": "application/json",
    priority: "u=1, i",
    "sec-ch-ua":
      '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    referrer: "https://www.equidia.fr/",
    origin: "https://www.equidia.fr",
  };

  // ---------- Internal helpers ----------

  private buildQuery(params?: Record<string, string | number | boolean>): string {
    if (!params) return "";
    const usp = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      usp.append(key, String(value));
    }
    const qs = usp.toString();
    return qs ? `?${qs}` : "";
  }

  private async request<T>(
    endpoint: string,
    init: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseUrl}${endpoint}`;

    const headers = {
      ...this.headers,
      ...(init.headers || {}),
    } as Record<string, string>;

    try {
      const response = await fetch(url, {
        ...init,
        method: init.method ?? "GET",
        headers,
        referrer: "https://www.equidia.fr/",
        credentials: "omit", // No cookies
        mode: "cors",
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(
          `HTTP ${response.status} ${response.statusText} – ${text || "no body"}`
        );
      }

      // Some endpoints (like static JSON) are still JSON
      return (await response.json()) as T;
    } catch (error: any) {
      console.error(`Request Failed: ${url} [${error.message}]`);
      throw error;
    }
  }

  private get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  private post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  // Helper to ensure course numbers are NOT zero-padded (e.g., "5" -> "C5", "C05" -> "C5")
  private formatCourse(course: string): string {
    if (course.startsWith('C')) {
      const num = course.substring(1);
      return `C${parseInt(num, 10)}`;
    }
    return `C${parseInt(course, 10)}`;
  }

  // ==========================================
  // API ENDPOINTS (mirror of axios client)
  // ==========================================

  // --- Course / Race endpoints ---

  public async getCourseDetails(
    params: RaceParams
  ): Promise<RaceDetailResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    return this.get<RaceDetailResponse>(
      `/api/public/v2/courses/${date}/${reunion}/${formattedCourse}`
    );
  }

  public async getPronostic(
    params: RaceParams
  ): Promise<PronosticResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    return this.get<PronosticResponse>(
      `/api/public/courses/${date}/${reunion}/${formattedCourse}/pronostic`
    );
  }

  public async getInterview(
    params: RaceParams
  ): Promise<InterviewResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    return this.get<InterviewResponse>(
      `/api/public/courses/${date}/${reunion}/${formattedCourse}/interview`
    );
  }

  public async getNote(
    params: RaceParams
  ): Promise<NoteResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    const query = this.buildQuery({ range: "[0,99]" });
    return this.get<NoteResponse>(
      `/api/public/v2/note/${date}/${reunion}/${formattedCourse}${query}`
    );
  }

  public async getRapports(
    params: RaceParams
  ): Promise<RapportResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    return this.get<RapportResponse>(
      `/api/public/courses/${date}/${reunion}/${formattedCourse}/rapports`
    );
  }

  public async getReferences(
    params: RaceParams
  ): Promise<ReferencesResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    return this.get<ReferencesResponse>(
      `/api/public/courses/${date}/${reunion}/${formattedCourse}/references`
    );
  }

  public async getDailyReunions(
    date: string
  ): Promise<DailyReunionResponse> {
    return this.get<DailyReunionResponse>(
      `/api/public/dailyreunions/${date}`
    );
  }

  public async getArticles(
    params: RaceParams
  ): Promise<ArticleResponse> {
    const { date, reunion, course } = params;
    const courseNum = course.replace(/\D/g, "");
    const reunionNum = reunion.replace(/\D/g, "");

    const filter = JSON.stringify({
      "course.num_course_pmu": courseNum,
      "reunion.date_reunion": date,
      "reunion.num_reunion": reunionNum,
    });

    const query = this.buildQuery({ filter });
    return this.get<ArticleResponse>(
      `/api/public/articles${query}`
    );
  }

  public async getPariSimple(params: RaceParams): Promise<PariSimpleResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    return this.get<PariSimpleResponse>(
      `/api/public/courses/${date}/${reunion}/${formattedCourse}/pari_simple`
    );
  }

  public async getNotule(params: RaceParams): Promise<NotuleResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    return this.get<NotuleResponse>(
      `/api/public/courses/${date}/${reunion}/${formattedCourse}/notule`
    );
  }

  public async getTracking(params: RaceParams): Promise<TrackingResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    const query = this.buildQuery({
      sort: '["num_place_arrivee","ASC"]',
      range: "[0,99]",
    });
    return this.get<TrackingResponse>(
      `/api/public/v2/tracking/${date}/${reunion}/${formattedCourse}${query}`
    );
  }

  // --- Horse / Video Endpoints ---

  public async getVideoPlayer(
    videoId: string
  ): Promise<VideoPlayerResponse> {
    return this.get<VideoPlayerResponse>(
      `/api/public/videos-store/player/${videoId}`
    );
  }

  public async getHorseLastOrNext(
    horseSlug: string
  ): Promise<HorseLastOrNextResponse> {
    return this.get<HorseLastOrNextResponse>(
      `/api/public/v2/chevaux/${horseSlug}/last-or-next`
    );
  }

  public async getHorseHistory(
    horseSlug: string,
    options: HorseHistoryParams = {}
  ): Promise<HorseHistoryResponse> {
    const params = {
      range: JSON.stringify(options.range || [0, 9]),
      with_meta: options.with_meta ?? true,
      sort: JSON.stringify(
        options.sort || ["date_reunion", "DESC"]
      ),
      forceUnreliable: options.forceUnreliable ?? 1,
    };

    const query = this.buildQuery(
      params as Record<string, string | number | boolean>
    );

    return this.get<HorseHistoryResponse>(
      `/api/public/v2/chevaux/${horseSlug}/history${query}`
    );
  }

  public async getHorseStats(horseSlug: string): Promise<HorseStatsResponse> {
    return this.get<HorseStatsResponse>(
      `/api/public/v2/chevaux/${horseSlug}/all-stats`
    );
  }

  public async getHorseFicheInRace(
    params: RaceParams,
    horseSlug: string
  ): Promise<HorseFicheInRaceResponse> {
    const { date, reunion, course } = params;
    const formattedCourse = this.formatCourse(course);
    const query = this.buildQuery({ forceUnreliable: 1 });
    return this.get<HorseFicheInRaceResponse>(
      `/api/public/courses/${date}/${reunion}/${formattedCourse}/fiche/${horseSlug}${query}`
    );
  }

  // --- Cross-Domain Endpoints (absolute URLs) ---

  public async postPronoStats(courseId: string): Promise<PronoStatsResponse> {
    return this.post<PronoStatsResponse>(
      "https://perso-api.equidia.fr/prono/stats",
      { course_id: courseId }
    );
  }

  public async getStaticAnimation(): Promise<StaticAnimationResponse> {
    return this.get<StaticAnimationResponse>(
      "https://www.equidia.fr/assets/animation/star-blast.json"
    );
  }

  public async postHorseFavorites(uuids: string[]): Promise<HorseFavoritesResponse> {
    return this.post<HorseFavoritesResponse>(
      "https://apiv2.equidia.fr/api/web/horse-favorites",
      { uuids }
    );
  }
}

// ==========================================
// TEST EXECUTION
// ==========================================

// (async () => {
//   const api = new EquidiaClient();
//   const race: RaceParams = {
//     date: "2025-06-29",
//     reunion: "R1",
//     course: "C5",
//   };

//   console.log(`\n--- Testing ${race.date} ${race.reunion}${race.course} ---`);

//   try {
//     console.log("Fetching Course Details...");
//     const details = await api.getCourseDetails(race);
//     console.log(
//       `[SUCCESS] Race Name: ${details.libcourt_prix_course}`
//     );
//     console.log(
//       `[SUCCESS] Runners: ${details.partants.length}`
//     );

//     console.log("\nFetching Tracking...");
//     const tracking = await api.getTracking(race);
//     console.log(
//       `[SUCCESS] Tracking rows: ${
//         Array.isArray(tracking) ? tracking.length : 0
//       }`
//     );

//     console.log("\nFetching References...");
//     const refs = await api.getReferences(race);
//     console.log(
//       `[SUCCESS] References most_common: ${
//         refs.results?.most_common?.length ?? 0
//       }`
//     );

//     console.log("\nFetching Notes...");
//     const notes = await api.getNote(race);
//     console.log(`[SUCCESS] Notes: ${notes.length}`);

//     console.log("\nFetching Daily Reunions...");
//     const calendar = await api.getDailyReunions("2025-12-09");
//     console.log(`[SUCCESS] Reunions: ${calendar.length}`);
//   } catch (e: any) {
//     console.error("Test Failed:", e.message);
//   }
// })();

import axios, { AxiosInstance, AxiosRequestConfig, AxiosProxyConfig } from 'axios';
import axiosRetry from 'axios-retry';
import { CookieJar } from 'tough-cookie';
import { URL } from 'url';
import * as https from 'https';
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
  DailyReunionResponse
} from './types';

export class EquidiaClient {
  private client: AxiosInstance;
  public jar: CookieJar;

  constructor(proxyUrl?: string) {
    this.jar = new CookieJar();

    // 1. Configure Proxy
    let proxyConfig: AxiosProxyConfig | false = false;
    if (proxyUrl) {
      try {
        const parsed = new URL(proxyUrl);
        proxyConfig = {
          protocol: parsed.protocol.replace(':', ''),
          host: parsed.hostname,
          port: parseInt(parsed.port, 10),
          auth: parsed.username ? { username: parsed.username, password: parsed.password } : undefined
        };
      } catch (e) {
        console.warn("Invalid Proxy URL");
      }
    }

    // 2. Configure Custom HTTPS Agent (TLS Spoofing to beat 403)
    // We enforce specific ciphers to mimic Chrome and avoid Node.js fingerprint detection
    const agent = new https.Agent({
      keepAlive: true,
      ciphers: [
        'TLS_AES_128_GCM_SHA256',
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256',
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-ECDSA-CHACHA20-POLY1305',
        'ECDHE-RSA-CHACHA20-POLY1305',
        'ECDHE-RSA-AES128-SHA',
        'ECDHE-RSA-AES256-SHA'
      ].join(':'),
      honorCipherOrder: true,
      minVersion: 'TLSv1.2'
    });

    // 3. Create Axios Instance
    // Note: We do NOT use the wrapper() here to avoid conflict with the httpsAgent
    this.client = axios.create({
      baseURL: 'https://api.equidia.fr',
      timeout: 20000,
      withCredentials: true,
      proxy: proxyConfig,
      httpsAgent: agent,
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar;q=0.6',
        'content-type': 'application/json',
        'priority': 'u=1, i',
        // USER-AGENT MUST MATCH THE CLIENT HINTS (Chrome 138)
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'referrer': 'https://www.equidia.fr/', // Explicit referrer
        'origin': 'https://www.equidia.fr'
      }
    });

    // 4. Manual Cookie Interceptors
    // Since we aren't using the wrapper, we handle cookies manually here.
    
    // Request Interceptor: Inject cookies from Jar into Headers
    this.client.interceptors.request.use(async (config) => {
      if (config.url) {
        // Resolve full URL to ensure domain matching works
        const requestUrl = config.baseURL 
          ? (config.url.startsWith('http') ? config.url : `${config.baseURL.replace(/\/$/, '')}/${config.url.replace(/^\//, '')}`)
          : config.url;
          
        const cookieString = await this.jar.getCookieString(requestUrl);
        if (cookieString) {
          config.headers['Cookie'] = cookieString;
        }
      }
      return config;
    });

    // Response Interceptor: Scrape 'set-cookie' headers into Jar
    this.client.interceptors.response.use(async (response) => {
      const setCookie = response.headers['set-cookie'];
      if (setCookie) {
        const requestUrl = response.config.baseURL 
          ? (response.config.url?.startsWith('http') ? response.config.url : `${response.config.baseURL.replace(/\/$/, '')}/${response.config.url?.replace(/^\//, '')}`)
          : response.config.url;

        if (requestUrl) {
          if (Array.isArray(setCookie)) {
            for (const cookie of setCookie) {
              await this.jar.setCookie(cookie, requestUrl);
            }
          } else {
            await this.jar.setCookie(setCookie as string, requestUrl);
          }
        }
      }
      return response;
    });

    // 5. Attach Retry Logic
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429 ||
          (error.response?.status ? error.response.status >= 500 : false)
        );
      },
      onRetry: (retryCount, error, requestConfig) => {
        console.warn(`[Retry ${retryCount}] ${requestConfig.url} - ${error.message}`);
      }
    });
  }

  /**
   * Initialize Session / Warm-up
   * Visits the frontend page to establish initial cookies/CSRF tokens
   */
  public async init(date?: string, reunion?: string, course?: string) {
    try {
      const url = (date && reunion && course)
        ? `https://www.equidia.fr/courses/${date}/${reunion}/${course}`
        : 'https://www.equidia.fr/';

      await this.client.get(url, {
        baseURL: undefined, // Override base URL to hit the website, not API
        responseType: 'text',
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'priority': 'u=0, i'
        }
      });
    } catch (e) {
      // It's common for the warm-up to fail parsing or redirect, we just want the headers
      console.warn("Warm-up completed (ignoring response body).");
    }
  }

  // --- Internal Helpers ---

  private async get<T>(url: string, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status || 'Unknown';
      console.error(`GET Error [${status}] ${url}`);
      throw error;
    }
  }

  private async post<T>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      const status = error.response?.status || 'Unknown';
      console.error(`POST Error [${status}] ${url}`);
      throw error;
    }
  }

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  public async getCourseDetails(params: RaceParams): Promise<RaceDetailResponse> {
    const { date, reunion, course } = params;
    return this.get<RaceDetailResponse>(`/api/public/v2/courses/${date}/${reunion}/${course}`);
  }

  public async getPronostic(params: RaceParams): Promise<PronosticResponse> {
    const { date, reunion, course } = params;
    return this.get<PronosticResponse>(`/api/public/courses/${date}/${reunion}/${course}/pronostic`);
  }

  public async getInterview(params: RaceParams): Promise<InterviewResponse> {
    const { date, reunion, course } = params;
    return this.get<InterviewResponse>(`/api/public/courses/${date}/${reunion}/${course}/interview`);
  }

  public async getNote(params: RaceParams): Promise<NoteResponse> {
    const { date, reunion, course } = params;
    return this.get<NoteResponse>(`/api/public/v2/note/${date}/${reunion}/${course}`, {
      params: { range: '[0,99]' }
    });
  }

  public async getRapports(params: RaceParams): Promise<RapportResponse> {
    const { date, reunion, course } = params;
    return this.get<RapportResponse>(`/api/public/courses/${date}/${reunion}/${course}/rapports`);
  }

  public async getReferences(params: RaceParams): Promise<ReferencesResponse> {
    const { date, reunion, course } = params;
    return this.get<ReferencesResponse>(`/api/public/courses/${date}/${reunion}/${course}/references`);
  }

  public async getDailyReunions(date: string): Promise<DailyReunionResponse> {
    return this.get<DailyReunionResponse>(`/api/public/dailyreunions/${date}`);
  }

  public async getArticles(params: RaceParams): Promise<ArticleResponse> {
    const { date, reunion, course } = params;
    const courseNum = course.replace(/\D/g, '');
    const reunionNum = reunion.replace(/\D/g, '');
    
    // The API requires filter params as a JSON string
    const filter = JSON.stringify({
      "course.num_course_pmu": courseNum,
      "reunion.date_reunion": date,
      "reunion.num_reunion": reunionNum
    });
    
    return this.get<ArticleResponse>(`/api/public/articles`, { params: { filter } });
  }

  public async getPariSimple(params: RaceParams): Promise<any> {
    const { date, reunion, course } = params;
    return this.get(`/api/public/courses/${date}/${reunion}/${course}/pari_simple`);
  }

  public async getNotule(params: RaceParams): Promise<any> {
    const { date, reunion, course } = params;
    return this.get(`/api/public/courses/${date}/${reunion}/${course}/notule`);
  }

  public async getTracking(params: RaceParams): Promise<any> {
    const { date, reunion, course } = params;
    return this.get(`/api/public/v2/tracking/${date}/${reunion}/${course}`, {
      params: {
        sort: '["num_place_arrivee", "ASC"]',
        range: '[0,99]'
      }
    });
  }

  // --- Horse / Video Endpoints ---

  public async getVideoPlayer(videoId: string): Promise<VideoPlayerResponse> {
    return this.get<VideoPlayerResponse>(`/api/public/videos-store/player/${videoId}`);
  }

  public async getHorseLastOrNext(horseSlug: string) {
    return this.get(`/api/public/v2/chevaux/${horseSlug}/last-or-next`);
  }

  public async getHorseHistory(horseSlug: string, options: HorseHistoryParams = {}) {
    const params = {
      range: JSON.stringify(options.range || [0, 9]),
      with_meta: options.with_meta ?? true,
      sort: JSON.stringify(options.sort || ["date_reunion", "DESC"]),
      forceUnreliable: options.forceUnreliable ?? 1
    };
    return this.get(`/api/public/v2/chevaux/${horseSlug}/history`, { params });
  }

  public async getHorseStats(horseSlug: string) {
    return this.get(`/api/public/v2/chevaux/${horseSlug}/all-stats`);
  }

  public async getHorseFicheInRace(params: RaceParams, horseSlug: string) {
    const { date, reunion, course } = params;
    return this.get(`/api/public/courses/${date}/${reunion}/${course}/fiche/${horseSlug}`, {
      params: { forceUnreliable: 1 }
    });
  }

  // --- Cross-Domain Endpoints ---

  public async postPronoStats(courseId: string) {
    return this.post('https://perso-api.equidia.fr/prono/stats', { course_id: courseId });
  }

  public async getStaticAnimation() {
    return this.get('https://www.equidia.fr/assets/animation/star-blast.json');
  }

  public async postHorseFavorites(uuids: string[]) {
    return this.post('https://apiv2.equidia.fr/api/web/horse-favorites', { uuids });
  }
}

// ==========================================
// TEST EXECUTION
// ==========================================

(async () => {
  const api = new EquidiaClient();
  const race = { date: '2025-06-29', reunion: 'R1', course: 'C4' };

  console.log("--- Initializing Session (Warm-up) ---");
  await api.init(race.date, race.reunion, race.course);

  try {
    console.log(`\nFetching Data for ${race.date} ${race.reunion}${race.course}...`);
    
    // 1. Details
    const details = await api.getCourseDetails(race);
    console.log(`[OK] Race: ${details.libcourt_prix_course} (${details.partants.length} runners)`);

    // 2. References
    const refs = await api.getReferences(race);
    console.log(`[OK] References: ${refs.results.most_common.length} common records`);

    // 3. Notes
    const notes = await api.getNote(race);
    console.log(`[OK] Notes: ${notes.length} items`);

    // 4. Calendar (Verify new endpoint)
    const calendar = await api.getDailyReunions("2025-12-09");
    console.log(`[OK] Calendar: ${calendar.length} reunions found`);

  } catch (e: any) {
    console.error("Critical Failure:", e.message);
    if (e.response) {
      console.error("Status:", e.response.status);
    }
  }
})();
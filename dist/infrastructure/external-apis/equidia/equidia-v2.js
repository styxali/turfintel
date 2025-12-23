"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EquidiaClient {
    constructor() {
        this.baseUrl = "https://api.equidia.fr";
        this.headers = {
            // Standard User-Agent is MANDATORY when sending sec-ch-ua headers
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            // Your exact headers
            accept: "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,ar;q=0.6",
            "content-type": "application/json",
            priority: "u=1, i",
            "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            referrer: "https://www.equidia.fr/",
            origin: "https://www.equidia.fr",
        };
    }
    // ---------- Internal helpers ----------
    buildQuery(params) {
        if (!params)
            return "";
        const usp = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            usp.append(key, String(value));
        }
        const qs = usp.toString();
        return qs ? `?${qs}` : "";
    }
    async request(endpoint, init = {}) {
        const url = endpoint.startsWith("http")
            ? endpoint
            : `${this.baseUrl}${endpoint}`;
        const headers = {
            ...this.headers,
            ...(init.headers || {}),
        };
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
                throw new Error(`HTTP ${response.status} ${response.statusText} – ${text || "no body"}`);
            }
            // Some endpoints (like static JSON) are still JSON
            return (await response.json());
        }
        catch (error) {
            console.error(`Request Failed: ${url} [${error.message}]`);
            throw error;
        }
    }
    get(endpoint) {
        return this.request(endpoint, { method: "GET" });
    }
    post(endpoint, body) {
        return this.request(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }
    // Helper to ensure course numbers are zero-padded (e.g., "5" -> "05", "C5" -> "C05")
    formatCourse(course) {
        if (course.startsWith('C')) {
            const num = course.substring(1);
            return `C${num.padStart(2, '0')}`;
        }
        return course.padStart(2, '0');
    }
    // ==========================================
    // API ENDPOINTS (mirror of axios client)
    // ==========================================
    // --- Course / Race endpoints ---
    async getCourseDetails(params) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        return this.get(`/api/public/v2/courses/${date}/${reunion}/${formattedCourse}`);
    }
    async getPronostic(params) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        return this.get(`/api/public/courses/${date}/${reunion}/${formattedCourse}/pronostic`);
    }
    async getInterview(params) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        return this.get(`/api/public/courses/${date}/${reunion}/${formattedCourse}/interview`);
    }
    async getNote(params) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        const query = this.buildQuery({ range: "[0,99]" });
        return this.get(`/api/public/v2/note/${date}/${reunion}/${formattedCourse}${query}`);
    }
    async getRapports(params) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        return this.get(`/api/public/courses/${date}/${reunion}/${formattedCourse}/rapports`);
    }
    async getReferences(params) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        return this.get(`/api/public/courses/${date}/${reunion}/${formattedCourse}/references`);
    }
    async getDailyReunions(date) {
        return this.get(`/api/public/dailyreunions/${date}`);
    }
    async getArticles(params) {
        const { date, reunion, course } = params;
        const courseNum = course.replace(/\D/g, "");
        const reunionNum = reunion.replace(/\D/g, "");
        const filter = JSON.stringify({
            "course.num_course_pmu": courseNum,
            "reunion.date_reunion": date,
            "reunion.num_reunion": reunionNum,
        });
        const query = this.buildQuery({ filter });
        return this.get(`/api/public/articles${query}`);
    }
    async getPariSimple(params) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        return this.get(`/api/public/courses/${date}/${reunion}/${formattedCourse}/pari_simple`);
    }
    async getNotule(params) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        return this.get(`/api/public/courses/${date}/${reunion}/${formattedCourse}/notule`);
    }
    async getTracking(params) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        const query = this.buildQuery({
            sort: '["num_place_arrivee","ASC"]',
            range: "[0,99]",
        });
        return this.get(`/api/public/v2/tracking/${date}/${reunion}/${formattedCourse}${query}`);
    }
    // --- Horse / Video Endpoints ---
    async getVideoPlayer(videoId) {
        return this.get(`/api/public/videos-store/player/${videoId}`);
    }
    async getHorseLastOrNext(horseSlug) {
        return this.get(`/api/public/v2/chevaux/${horseSlug}/last-or-next`);
    }
    async getHorseHistory(horseSlug, options = {}) {
        const params = {
            range: JSON.stringify(options.range || [0, 9]),
            with_meta: options.with_meta ?? true,
            sort: JSON.stringify(options.sort || ["date_reunion", "DESC"]),
            forceUnreliable: options.forceUnreliable ?? 1,
        };
        const query = this.buildQuery(params);
        return this.get(`/api/public/v2/chevaux/${horseSlug}/history${query}`);
    }
    async getHorseStats(horseSlug) {
        return this.get(`/api/public/v2/chevaux/${horseSlug}/all-stats`);
    }
    async getHorseFicheInRace(params, horseSlug) {
        const { date, reunion, course } = params;
        const formattedCourse = this.formatCourse(course);
        const query = this.buildQuery({ forceUnreliable: 1 });
        return this.get(`/api/public/courses/${date}/${reunion}/${formattedCourse}/fiche/${horseSlug}${query}`);
    }
    // --- Cross-Domain Endpoints (absolute URLs) ---
    async postPronoStats(courseId) {
        return this.post("https://perso-api.equidia.fr/prono/stats", { course_id: courseId });
    }
    async getStaticAnimation() {
        return this.get("https://www.equidia.fr/assets/animation/star-blast.json");
    }
    async postHorseFavorites(uuids) {
        return this.post("https://apiv2.equidia.fr/api/web/horse-favorites", { uuids });
    }
}
exports.default = EquidiaClient;
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
//# sourceMappingURL=equidia-v2.js.map
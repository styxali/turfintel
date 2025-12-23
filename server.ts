// server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import EquidiaClient from "./equidia-v2";
import {
  RaceParams,
  HorseHistoryParams,
  RaceDetailResponse,
  PronosticResponse,
  InterviewResponse,
  NoteResponse,
  RapportResponse,
  ReferencesResponse,
  DailyReunionResponse,
  ArticleResponse,
  PariSimpleResponse,
  NotuleResponse,
  TrackingResponse,
  VideoPlayerResponse,
  HorseLastOrNextResponse,
  HorseHistoryResponse,
  HorseStatsResponse,
  HorseFicheInRaceResponse,
  PronoStatsResponse,
  StaticAnimationResponse,
  HorseFavoritesResponse,
} from "./types";

const app = express();
const port = process.env.PORT || 4000;
const equidia = new EquidiaClient();

app.use(cors());
app.use(express.json());

// ==========================================
// CACHING LAYER
// ==========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 15): void {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Entry expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new MemoryCache();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  cache.cleanup();
  console.log(`[CACHE] Cleanup completed. Current size: ${cache.size()}`);
}, 10 * 60 * 1000);

// Cache configuration for different endpoints
const CACHE_CONFIG = {
  // Race data - cache for 30 minutes (races don't change often)
  'course-details': 30,
  'pronostic': 30,
  'interview': 30,
  'note': 30,
  'rapports': 60, // Results cache longer (1 hour)
  'references': 60,
  'articles': 30,
  'notule': 30,
  'tracking': 60,
  
  // Daily data - cache for 15 minutes (more dynamic)
  'daily-reunions': 15,
  
  // Horse data - cache for 45 minutes (relatively stable)
  'horse-history': 45,
  'horse-stats': 45,
  'horse-fiche': 45,
  'horse-last-or-next': 30,
  
  // Video/static - cache for 2 hours (rarely changes)
  'video-player': 120,
  'static-animation': 120,
  
  // Betting data - cache for 5 minutes (very dynamic)
  'pari-simple': 5,
  'prono-stats': 5,
  'horse-favorites': 10
};

// Helper function to create cache-enabled endpoint
function createCachedEndpoint<T>(
  endpointName: keyof typeof CACHE_CONFIG,
  dataFetcher: (req: Request) => Promise<T>
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create cache key from endpoint and request parameters
      const cacheKey = `${endpointName}:${JSON.stringify({
        params: req.params,
        query: req.query,
        body: req.body
      })}`;

      // Try to get from cache first
      const cachedData = cache.get<T>(cacheKey);
      if (cachedData) {
        console.log(`[CACHE HIT] ${endpointName} - ${cacheKey.substring(0, 100)}...`);
        res.setHeader('X-Cache', 'HIT');
        return res.json(cachedData);
      }

      // Cache miss - fetch from API
      console.log(`[CACHE MISS] ${endpointName} - Fetching from API...`);
      const data = await dataFetcher(req);
      
      // Store in cache
      const ttl = CACHE_CONFIG[endpointName];
      cache.set(cacheKey, data, ttl);
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-TTL', `${ttl}m`);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}

// Small helper to build RaceParams from query
function buildRaceParams(req: Request): RaceParams {
  const { date, reunion, course } = req.query;

  if (!date || !reunion || !course) {
    throw new Error("Missing required query params: date, reunion, course");
  }

  return {
    date: String(date),
    reunion: String(reunion),
    course: String(course),
  };
}

// Small helper to parse HorseHistoryParams from query
function buildHorseHistoryParams(req: Request): HorseHistoryParams {
  const { range, with_meta, sort, forceUnreliable } = req.query;

  let parsedRange: [number, number] | undefined;
  if (range) {
    // support "0,9" or JSON "[0,9]"
    const str = String(range);
    if (str.startsWith("[")) {
      try {
        const arr = JSON.parse(str);
        if (Array.isArray(arr) && arr.length === 2) {
          parsedRange = [Number(arr[0]), Number(arr[1])];
        }
      } catch {
        // ignore, fallback below
      }
    } else {
      const parts = str.split(",");
      if (parts.length === 2) {
        parsedRange = [Number(parts[0]), Number(parts[1])];
      }
    }
  }

  let parsedSort: [string, string] | undefined;
  if (sort) {
    const str = String(sort);
    if (str.startsWith("[")) {
      try {
        const arr = JSON.parse(str);
        if (Array.isArray(arr) && arr.length === 2) {
          parsedSort = [String(arr[0]), String(arr[1])];
        }
      } catch {
        // ignore
      }
    } else {
      const parts = str.split(",");
      if (parts.length === 2) {
        parsedSort = [parts[0], parts[1]];
      }
    }
  }

  return {
    range: parsedRange,
    with_meta:
      typeof with_meta === "string"
        ? with_meta === "true"
        : undefined,
    sort: parsedSort,
    forceUnreliable:
      typeof forceUnreliable !== "undefined"
        ? Number(forceUnreliable)
        : undefined,
  };
}

// ==========================================
// API ENDPOINTS (with caching)
// ==========================================

// --- Course / Race endpoints ---

app.get("/api/course-details", createCachedEndpoint(
  'course-details',
  async (req) => {
    const params = buildRaceParams(req);
    return await equidia.getCourseDetails(params);
  }
));

app.get("/api/pronostic", createCachedEndpoint(
  'pronostic',
  async (req) => {
    const params = buildRaceParams(req);
    return await equidia.getPronostic(params);
  }
));

app.get("/api/interview", createCachedEndpoint(
  'interview',
  async (req) => {
    const params = buildRaceParams(req);
    try{
      return await equidia.getInterview(params);

    }catch(e){
      return {}
    }
  }
));

app.get("/api/note", createCachedEndpoint(
  'note',
  async (req) => {
    const params = buildRaceParams(req);
    return await equidia.getNote(params);
  }
));

app.get("/api/rapports", createCachedEndpoint(
  'rapports',
  async (req) => {
    const params = buildRaceParams(req);
    return await equidia.getRapports(params);
  }
));

app.get("/api/references", createCachedEndpoint(
  'references',
  async (req) => {
    const params = buildRaceParams(req);
    return await equidia.getReferences(params);
  }
));

app.get("/api/daily-reunions/:date", createCachedEndpoint(
  'daily-reunions',
  async (req) => {
    const { date } = req.params;
    return await equidia.getDailyReunions(date);
  }
));

app.get("/api/articles", createCachedEndpoint(
  'articles',
  async (req) => {
    const params = buildRaceParams(req);
    return await equidia.getArticles(params);
  }
));

app.get("/api/pari-simple", createCachedEndpoint(
  'pari-simple',
  async (req) => {
    const params = buildRaceParams(req);
    return await equidia.getPariSimple(params);
  }
));

app.get("/api/notule", createCachedEndpoint(
  'notule',
  async (req) => {
    const params = buildRaceParams(req);
    try{
    return await equidia.getNotule(params);
     }catch(e){
      return {}
    }
  }
));

app.get("/api/tracking", createCachedEndpoint(
  'tracking',
  async (req) => {
    const params = buildRaceParams(req);
    return await equidia.getTracking(params);
  }
));

// --- Horse / Video Endpoints ---

app.get("/api/video-player/:videoId", createCachedEndpoint(
  'video-player',
  async (req) => {
    const { videoId } = req.params;
    return await equidia.getVideoPlayer(videoId);
  }
));

app.get("/api/horses/:horseSlug/last-or-next", createCachedEndpoint(
  'horse-last-or-next',
  async (req) => {
    const { horseSlug } = req.params;
    return await equidia.getHorseLastOrNext(horseSlug);
  }
));

app.get("/api/horses/:horseSlug/history", createCachedEndpoint(
  'horse-history',
  async (req) => {
    const { horseSlug } = req.params;
    const options = buildHorseHistoryParams(req);
    return await equidia.getHorseHistory(horseSlug, options);
  }
));

app.get("/api/horses/:horseSlug/stats", createCachedEndpoint(
  'horse-stats',
  async (req) => {
    const { horseSlug } = req.params;
    return await equidia.getHorseStats(horseSlug);
  }
));

app.get("/api/horse-fiche", createCachedEndpoint(
  'horse-fiche',
  async (req) => {
    const { horseSlug } = req.query;
    if (!horseSlug) {
      throw new Error("Missing required query param: horseSlug");
    }
    const params = buildRaceParams(req);
    return await equidia.getHorseFicheInRace(params, String(horseSlug));
  }
));

// --- Cross-Domain Endpoints (absolute URLs) ---

app.post("/api/prono-stats", createCachedEndpoint(
  'prono-stats',
  async (req) => {
    const { courseId } = req.body;
    if (!courseId) {
      throw new Error("Missing required body field: courseId");
    }
    return await equidia.postPronoStats(String(courseId));
  }
));

app.get("/api/static-animation", createCachedEndpoint(
  'static-animation',
  async (req) => {
    return await equidia.getStaticAnimation();
  }
));

app.post("/api/horse-favorites", createCachedEndpoint(
  'horse-favorites',
  async (req) => {
    const { uuids } = req.body;
    if (!Array.isArray(uuids)) {
      throw new Error("Body field 'uuids' must be an array of strings");
    }
    return await equidia.postHorseFavorites(uuids);
  }
));

// ==========================================
// CACHE MANAGEMENT ENDPOINTS
// ==========================================

// Get cache statistics
app.get("/api/cache/stats", (req, res) => {
  res.json({
    size: cache.size(),
    config: CACHE_CONFIG,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Clear cache
app.delete("/api/cache", (req, res) => {
  cache.clear();
  console.log("[CACHE] Manual cache clear requested");
  res.json({ message: "Cache cleared successfully", size: cache.size() });
});

// Clear specific cache entries by pattern
app.delete("/api/cache/:pattern", (req, res) => {
  const { pattern } = req.params;
  let cleared = 0;
  
  // This is a simple implementation - in production you might want more sophisticated pattern matching
  for (const [key] of cache['cache'].entries()) {
    if (key.includes(pattern)) {
      cache['cache'].delete(key);
      cleared++;
    }
  }
  
  console.log(`[CACHE] Cleared ${cleared} entries matching pattern: ${pattern}`);
  res.json({ 
    message: `Cleared ${cleared} entries matching pattern: ${pattern}`,
    remainingSize: cache.size()
  });
});

// ==========================================
// Error handler
// ==========================================

app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({
      error: true,
      message: err.message || "Internal Server Error",
    });
  }
);

// ==========================================
// Start server
// ==========================================

app.listen(port, () => {
  console.log(`🚀 Equidia proxy server listening on port ${port}`);
  console.log(`📦 Caching enabled with the following TTL configuration:`);
  Object.entries(CACHE_CONFIG).forEach(([endpoint, ttl]) => {
    console.log(`   ${endpoint}: ${ttl} minutes`);
  });
  console.log(`🔧 Cache management endpoints:`);
  console.log(`   GET  /api/cache/stats - View cache statistics`);
  console.log(`   DELETE /api/cache - Clear all cache`);
  console.log(`   DELETE /api/cache/:pattern - Clear cache by pattern`);
});

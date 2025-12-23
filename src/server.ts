// Clean Architecture Server Entry Point
import express from 'express';
import cors from 'cors';

// Infrastructure
import { MemoryCache } from './infrastructure/cache/MemoryCache';
import { EquidiaService } from './infrastructure/external-apis/equidia/EquidiaService';
import { getPrismaClient, disconnectPrisma } from './infrastructure/database/prisma';
import { PrismaRaceRepository } from './infrastructure/database/repositories/PrismaRaceRepository';
import { PrismaHorseRepository } from './infrastructure/database/repositories/PrismaHorseRepository';

// Use Cases - Race
import { GetRaceDetailsUseCase } from './application/use-cases/race/GetRaceDetails';
import { GetDailyRacesUseCase } from './application/use-cases/race/GetDailyRaces';
import { GetPronosticUseCase } from './application/use-cases/race/GetPronostic';
import { GetInterviewUseCase } from './application/use-cases/race/GetInterview';
import { GetNoteUseCase } from './application/use-cases/race/GetNote';
import { GetRapportsUseCase } from './application/use-cases/race/GetRapports';
import { GetReferencesUseCase } from './application/use-cases/race/GetReferences';
import { GetArticlesUseCase } from './application/use-cases/race/GetArticles';
import { GetPariSimpleUseCase } from './application/use-cases/race/GetPariSimple';
import { GetNotuleUseCase } from './application/use-cases/race/GetNotule';
import { GetTrackingUseCase } from './application/use-cases/race/GetTracking';
import { GetRaceChartDataUseCase } from './application/use-cases/race/GetRaceChartData';

// Use Cases - Horse
import { GetHorseHistoryUseCase } from './application/use-cases/horse/GetHorseHistory';
import { GetHorseStatsUseCase } from './application/use-cases/horse/GetHorseStats';
import { GetHorseLastOrNextUseCase } from './application/use-cases/horse/GetHorseLastOrNext';
import { GetBatchHorseDataUseCase } from './application/use-cases/horse/GetBatchHorseData';

// Use Cases - Optimized Endpoints
import { GetRaceOverviewUseCase } from './application/use-cases/race/GetRaceOverview';
import { GetRaceSimulationUseCase } from './application/use-cases/race/GetRaceSimulation';
import { GetRaceForAIUseCase } from './application/use-cases/race/GetRaceForAI';

// Use Cases - Video
import { GetVideoPlayerUseCase } from './application/use-cases/video/GetVideoPlayer';

// Application Services
import { IngestionService } from './application/services/IngestionService';

// Infrastructure - Scheduler
import { IngestionScheduler } from './infrastructure/scheduler/IngestionScheduler';

// HTTP Layer
import { RaceController } from './infrastructure/http/controllers/RaceController';
import { HorseController } from './infrastructure/http/controllers/HorseController';
import { VideoController } from './infrastructure/http/controllers/VideoController';
import { IngestionController } from './infrastructure/http/controllers/IngestionController';
import { OptimizedRaceController } from './infrastructure/http/controllers/OptimizedRaceController';
import { createRaceRoutes } from './infrastructure/http/routes/raceRoutes';
import { createHorseRoutes } from './infrastructure/http/routes/horseRoutes';
import { createVideoRoutes } from './infrastructure/http/routes/videoRoutes';
import { createIngestionRoutes } from './infrastructure/http/routes/ingestionRoutes';
import { createChatbotRoutes } from './infrastructure/http/routes/chatbotRoutes';
import { createOptimizedRoutes } from './infrastructure/http/routes/optimizedRoutes';
import { ChatbotController } from './infrastructure/http/controllers/ChatbotController';
import { RagChatbotService } from './application/services/RagChatbotService';
import { AIController } from './infrastructure/http/controllers/AIController';
import { createAIRoutes } from './infrastructure/http/routes/aiRoutes';
import { errorHandler } from './infrastructure/http/middleware/errorHandler';

const app = express();
const port = process.env.PORT || 4000;

// ==========================================
// DEPENDENCY INJECTION SETUP
// ==========================================

// Infrastructure Layer
const cacheManager = new MemoryCache();
const equidiaService = new EquidiaService();
const prisma = getPrismaClient();
const raceRepository = new PrismaRaceRepository(prisma);
const horseRepository = new PrismaHorseRepository(prisma);

// Application Layer - Race Use Cases
const getRaceDetailsUseCase = new GetRaceDetailsUseCase(equidiaService, cacheManager, raceRepository);
const getDailyRacesUseCase = new GetDailyRacesUseCase(equidiaService, cacheManager, raceRepository);
const getPronosticUseCase = new GetPronosticUseCase(equidiaService, cacheManager, raceRepository);
const getInterviewUseCase = new GetInterviewUseCase(equidiaService, cacheManager, raceRepository);
const getNoteUseCase = new GetNoteUseCase(equidiaService, cacheManager, raceRepository);
const getRapportsUseCase = new GetRapportsUseCase(equidiaService, cacheManager);
const getReferencesUseCase = new GetReferencesUseCase(equidiaService, cacheManager, raceRepository);
const getArticlesUseCase = new GetArticlesUseCase(equidiaService, cacheManager);
const getPariSimpleUseCase = new GetPariSimpleUseCase(equidiaService, cacheManager, raceRepository);
const getNotuleUseCase = new GetNotuleUseCase(equidiaService, cacheManager, raceRepository);
const getTrackingUseCase = new GetTrackingUseCase(equidiaService, cacheManager, raceRepository);
const getRaceChartDataUseCase = new GetRaceChartDataUseCase(raceRepository, horseRepository);

// Application Layer - Horse Use Cases
const getHorseHistoryUseCase = new GetHorseHistoryUseCase(equidiaService, cacheManager, horseRepository);
const getHorseStatsUseCase = new GetHorseStatsUseCase(equidiaService, cacheManager, horseRepository);
const getHorseLastOrNextUseCase = new GetHorseLastOrNextUseCase(equidiaService, cacheManager);
const getBatchHorseDataUseCase = new GetBatchHorseDataUseCase(equidiaService, cacheManager, horseRepository);

// Application Layer - Optimized Use Cases
const getRaceOverviewUseCase = new GetRaceOverviewUseCase(equidiaService, cacheManager, raceRepository);
const getRaceSimulationUseCase = new GetRaceSimulationUseCase(equidiaService, cacheManager, raceRepository);
const getRaceForAIUseCase = new GetRaceForAIUseCase(equidiaService, cacheManager, raceRepository);

// Application Layer - Video Use Cases
const getVideoPlayerUseCase = new GetVideoPlayerUseCase(equidiaService, cacheManager);

// Application Services - Ingestion
const ingestionService = new IngestionService(equidiaService, raceRepository);
const ingestionScheduler = new IngestionScheduler(ingestionService);

// HTTP Layer - Controllers
const raceController = new RaceController(
  getRaceDetailsUseCase,
  getDailyRacesUseCase,
  getPronosticUseCase,
  getInterviewUseCase,
  getNoteUseCase,
  getRapportsUseCase,
  getReferencesUseCase,
  getArticlesUseCase,
  getPariSimpleUseCase,
  getNotuleUseCase,
  getTrackingUseCase,
  getRaceChartDataUseCase
);

const horseController = new HorseController(
  getHorseHistoryUseCase,
  getHorseStatsUseCase,
  getHorseLastOrNextUseCase
);

const videoController = new VideoController(getVideoPlayerUseCase);

const ingestionController = new IngestionController(ingestionService, ingestionScheduler);

// Optimized Controller
const optimizedController = new OptimizedRaceController(
  getRaceOverviewUseCase,
  getRaceSimulationUseCase,
  getBatchHorseDataUseCase
);

// RAG Chatbot Service & Controller
const ragChatbotService = new RagChatbotService(prisma);
const chatbotController = new ChatbotController(ragChatbotService);

// AI Controller
const aiController = new AIController(getRaceForAIUseCase);

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Cache headers
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'TurfTracker-API');
  next();
});

// ==========================================
// ROUTES
// ==========================================

// API Routes
app.use('/api', createRaceRoutes(raceController));
app.use('/api', createHorseRoutes(horseController));
app.use('/api', createVideoRoutes(videoController));
app.use('/api', createIngestionRoutes(ingestionController));
app.use('/api/chatbot', createChatbotRoutes(chatbotController));

// Optimized Routes (NEW - Database-first with minimal payloads)
app.use('/api', createOptimizedRoutes(optimizedController));

// AI Routes (Complete race data for LLM/video generation)
app.use('/api', createAIRoutes(aiController));

// Cache Management Routes
app.get('/api/cache/stats', async (req, res) => {
  const stats = await cacheManager.getStats();
  res.json({
    ...stats,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.delete('/api/cache', async (req, res) => {
  await cacheManager.clear();
  console.log('[CACHE] Manual cache clear requested');
  res.json({ message: 'Cache cleared successfully' });
});

app.delete('/api/cache/:pattern', async (req, res) => {
  const { pattern } = req.params;
  await cacheManager.invalidatePattern(pattern);
  console.log(`[CACHE] Cleared entries matching pattern: ${pattern}`);
  res.json({ message: `Cleared entries matching pattern: ${pattern}` });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==========================================
// ERROR HANDLING
// ==========================================

app.use(errorHandler);

// ==========================================
// BACKGROUND TASKS
// ==========================================

// Cleanup expired cache entries every 10 minutes
setInterval(() => {
  cacheManager.cleanup();
  console.log(`[CACHE] Cleanup completed`);
}, 10 * 60 * 1000);

// Start ingestion scheduler
ingestionScheduler.start();

// ==========================================
// START SERVER
// ==========================================

app.listen(port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🏇 TurfTracker API Server                              ║
║                                                           ║
║   Port: ${port}                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                  ║
║   Architecture: Clean Architecture                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

📦 Services Initialized:
   ✓ Cache Manager (Memory)
   ✓ Equidia API Client
   ✓ Prisma Database Client
   ✓ Race Repository
   ✓ Horse Repository
   ✓ Race Use Cases (11)
   ✓ Horse Use Cases (3)
   ✓ Video Use Cases (1)
   ✓ Ingestion Service
   ✓ Ingestion Scheduler

🔧 Race Endpoints:
   GET  /api/course-details?date=YYYY-MM-DD&reunion=R1&course=C1
   GET  /api/daily-reunions/:date
   GET  /api/pronostic?date=...&reunion=...&course=...
   GET  /api/interview?date=...&reunion=...&course=...
   GET  /api/note?date=...&reunion=...&course=...
   GET  /api/rapports?date=...&reunion=...&course=...
   GET  /api/references?date=...&reunion=...&course=...
   GET  /api/articles?date=...&reunion=...&course=...
   GET  /api/pari-simple?date=...&reunion=...&course=...
   GET  /api/notule?date=...&reunion=...&course=...
   GET  /api/tracking?date=...&reunion=...&course=...

🚀 Optimized Endpoints (NEW - 85% less data, database-first):
   GET  /api/races/overview?date=...&reunion=...&course=...
        (Replaces: course-details + pronostic + note)
   GET  /api/races/simulation?date=...&reunion=...&course=...
        (Replaces: course-details + tracking + notule + interview)
   POST /api/horses/batch
        Body: { slugs: ['horse-1', ...], maxRaces: 5 }
        (Replaces: 48 individual horse requests)

🔧 Horse Endpoints:
   GET  /api/horses/:horseSlug/history
   GET  /api/horses/:horseSlug/stats
   GET  /api/horses/:horseSlug/last-or-next

🔧 Video Endpoints:
   GET  /api/video-player/:videoId

🔧 Ingestion Endpoints:
   POST /api/ingestion/run (body: {daysAhead: 1})
   POST /api/ingestion/update (body: {date: "YYYY-MM-DD"})
   POST /api/ingestion/date (body: {date: "YYYY-MM-DD"})
   POST /api/ingestion/deep (body: {date, reunion, course})
   GET  /api/ingestion/status

🔧 Cache Management:
   GET    /api/cache/stats
   DELETE /api/cache
   DELETE /api/cache/:pattern

🔧 Health:
   GET  /health

🚀 Server ready!
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n[SERVER] SIGTERM received, shutting down gracefully...');
  ingestionScheduler.stop();
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n[SERVER] SIGINT received, shutting down gracefully...');
  ingestionScheduler.stop();
  await disconnectPrisma();
  process.exit(0);
});

export default app;

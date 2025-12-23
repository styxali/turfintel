"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Clean Architecture Server Entry Point
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Infrastructure
const MemoryCache_1 = require("./infrastructure/cache/MemoryCache");
const EquidiaService_1 = require("./infrastructure/external-apis/equidia/EquidiaService");
const prisma_1 = require("./infrastructure/database/prisma");
const PrismaRaceRepository_1 = require("./infrastructure/database/repositories/PrismaRaceRepository");
const PrismaHorseRepository_1 = require("./infrastructure/database/repositories/PrismaHorseRepository");
// Use Cases - Race
const GetRaceDetails_1 = require("./application/use-cases/race/GetRaceDetails");
const GetDailyRaces_1 = require("./application/use-cases/race/GetDailyRaces");
const GetPronostic_1 = require("./application/use-cases/race/GetPronostic");
const GetInterview_1 = require("./application/use-cases/race/GetInterview");
const GetNote_1 = require("./application/use-cases/race/GetNote");
const GetRapports_1 = require("./application/use-cases/race/GetRapports");
const GetReferences_1 = require("./application/use-cases/race/GetReferences");
const GetArticles_1 = require("./application/use-cases/race/GetArticles");
const GetPariSimple_1 = require("./application/use-cases/race/GetPariSimple");
const GetNotule_1 = require("./application/use-cases/race/GetNotule");
const GetTracking_1 = require("./application/use-cases/race/GetTracking");
// Use Cases - Horse
const GetHorseHistory_1 = require("./application/use-cases/horse/GetHorseHistory");
const GetHorseStats_1 = require("./application/use-cases/horse/GetHorseStats");
const GetHorseLastOrNext_1 = require("./application/use-cases/horse/GetHorseLastOrNext");
// Use Cases - Video
const GetVideoPlayer_1 = require("./application/use-cases/video/GetVideoPlayer");
// Application Services
const IngestionService_1 = require("./application/services/IngestionService");
// Infrastructure - Scheduler
const IngestionScheduler_1 = require("./infrastructure/scheduler/IngestionScheduler");
// HTTP Layer
const RaceController_1 = require("./infrastructure/http/controllers/RaceController");
const HorseController_1 = require("./infrastructure/http/controllers/HorseController");
const VideoController_1 = require("./infrastructure/http/controllers/VideoController");
const IngestionController_1 = require("./infrastructure/http/controllers/IngestionController");
const raceRoutes_1 = require("./infrastructure/http/routes/raceRoutes");
const horseRoutes_1 = require("./infrastructure/http/routes/horseRoutes");
const videoRoutes_1 = require("./infrastructure/http/routes/videoRoutes");
const ingestionRoutes_1 = require("./infrastructure/http/routes/ingestionRoutes");
const chatbotRoutes_1 = require("./infrastructure/http/routes/chatbotRoutes");
const ChatbotController_1 = require("./infrastructure/http/controllers/ChatbotController");
const RagChatbotService_1 = require("./application/services/RagChatbotService");
const errorHandler_1 = require("./infrastructure/http/middleware/errorHandler");
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
// ==========================================
// DEPENDENCY INJECTION SETUP
// ==========================================
// Infrastructure Layer
const cacheManager = new MemoryCache_1.MemoryCache();
const equidiaService = new EquidiaService_1.EquidiaService();
const prisma = (0, prisma_1.getPrismaClient)();
const raceRepository = new PrismaRaceRepository_1.PrismaRaceRepository(prisma);
const horseRepository = new PrismaHorseRepository_1.PrismaHorseRepository(prisma);
// Application Layer - Race Use Cases
const getRaceDetailsUseCase = new GetRaceDetails_1.GetRaceDetailsUseCase(equidiaService, cacheManager, raceRepository);
const getDailyRacesUseCase = new GetDailyRaces_1.GetDailyRacesUseCase(equidiaService, cacheManager);
const getPronosticUseCase = new GetPronostic_1.GetPronosticUseCase(equidiaService, cacheManager, raceRepository);
const getInterviewUseCase = new GetInterview_1.GetInterviewUseCase(equidiaService, cacheManager, raceRepository);
const getNoteUseCase = new GetNote_1.GetNoteUseCase(equidiaService, cacheManager, raceRepository);
const getRapportsUseCase = new GetRapports_1.GetRapportsUseCase(equidiaService, cacheManager);
const getReferencesUseCase = new GetReferences_1.GetReferencesUseCase(equidiaService, cacheManager, raceRepository);
const getArticlesUseCase = new GetArticles_1.GetArticlesUseCase(equidiaService, cacheManager);
const getPariSimpleUseCase = new GetPariSimple_1.GetPariSimpleUseCase(equidiaService, cacheManager, raceRepository);
const getNotuleUseCase = new GetNotule_1.GetNotuleUseCase(equidiaService, cacheManager, raceRepository);
const getTrackingUseCase = new GetTracking_1.GetTrackingUseCase(equidiaService, cacheManager, raceRepository);
// Application Layer - Horse Use Cases
const getHorseHistoryUseCase = new GetHorseHistory_1.GetHorseHistoryUseCase(equidiaService, cacheManager, horseRepository);
const getHorseStatsUseCase = new GetHorseStats_1.GetHorseStatsUseCase(equidiaService, cacheManager, horseRepository);
const getHorseLastOrNextUseCase = new GetHorseLastOrNext_1.GetHorseLastOrNextUseCase(equidiaService, cacheManager);
// Application Layer - Video Use Cases
const getVideoPlayerUseCase = new GetVideoPlayer_1.GetVideoPlayerUseCase(equidiaService, cacheManager);
// Application Services - Ingestion
const ingestionService = new IngestionService_1.IngestionService(equidiaService, raceRepository);
const ingestionScheduler = new IngestionScheduler_1.IngestionScheduler(ingestionService);
// HTTP Layer - Controllers
const raceController = new RaceController_1.RaceController(getRaceDetailsUseCase, getDailyRacesUseCase, getPronosticUseCase, getInterviewUseCase, getNoteUseCase, getRapportsUseCase, getReferencesUseCase, getArticlesUseCase, getPariSimpleUseCase, getNotuleUseCase, getTrackingUseCase);
const horseController = new HorseController_1.HorseController(getHorseHistoryUseCase, getHorseStatsUseCase, getHorseLastOrNextUseCase);
const videoController = new VideoController_1.VideoController(getVideoPlayerUseCase);
const ingestionController = new IngestionController_1.IngestionController(ingestionService, ingestionScheduler);
// RAG Chatbot Service & Controller
const ragChatbotService = new RagChatbotService_1.RagChatbotService(prisma);
const chatbotController = new ChatbotController_1.ChatbotController(ragChatbotService);
// ==========================================
// MIDDLEWARE
// ==========================================
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
app.use('/api', (0, raceRoutes_1.createRaceRoutes)(raceController));
app.use('/api', (0, horseRoutes_1.createHorseRoutes)(horseController));
app.use('/api', (0, videoRoutes_1.createVideoRoutes)(videoController));
app.use('/api', (0, ingestionRoutes_1.createIngestionRoutes)(ingestionController));
app.use('/api/chatbot', (0, chatbotRoutes_1.createChatbotRoutes)(chatbotController));
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
app.use(errorHandler_1.errorHandler);
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
    await (0, prisma_1.disconnectPrisma)();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('\n[SERVER] SIGINT received, shutting down gracefully...');
    ingestionScheduler.stop();
    await (0, prisma_1.disconnectPrisma)();
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=server.js.map
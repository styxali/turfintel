"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagChatbotService = void 0;
const openai_1 = require("@langchain/openai");
const VectorStoreIngestionService_1 = require("./VectorStoreIngestionService");
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const luxon_1 = require("luxon");
class RagChatbotService {
    constructor(prisma) {
        this.prisma = prisma;
        this.initialized = false;
        this.llm = new openai_1.ChatOpenAI({
            modelName: 'gpt-4-turbo-preview',
            temperature: 0.7,
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        this.embeddings = new openai_1.OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
        this.vectorIngestion = new VectorStoreIngestionService_1.VectorStoreIngestionService(prisma);
        this.vectorStore = this.vectorIngestion.getVectorStore();
        this.tools = this.createTools();
    }
    async ensureInitialized() {
        if (!this.initialized) {
            await this.vectorStore.init();
            this.initialized = true;
        }
    }
    createTools() {
        return [
            // Get race details
            new tools_1.DynamicStructuredTool({
                name: 'get_race_details',
                description: 'Get complete details about a race including distance, terrain, time, partants',
                schema: zod_1.z.object({
                    raceGuid: zod_1.z.string().describe('Race GUID like 20251212_R1_C01'),
                }),
                func: async ({ raceGuid }) => {
                    const race = await this.prisma.race.findUnique({
                        where: { guid: raceGuid },
                        include: {
                            reunion: { include: { hippodrome: true } },
                            partants: {
                                include: {
                                    horse: true,
                                    jockey: true,
                                    trainer: true,
                                },
                            },
                        },
                    });
                    return JSON.stringify(race, null, 2);
                },
            }),
            // Get pronostic
            new tools_1.DynamicStructuredTool({
                name: 'get_pronostic',
                description: 'Get expert predictions and analysis for a race',
                schema: zod_1.z.object({
                    raceGuid: zod_1.z.string(),
                }),
                func: async ({ raceGuid }) => {
                    const race = await this.prisma.race.findUnique({
                        where: { guid: raceGuid },
                        select: { pronosticJson: true },
                    });
                    return race?.pronosticJson || 'No pronostic available';
                },
            }),
            // Get odds
            new tools_1.DynamicStructuredTool({
                name: 'get_odds',
                description: 'Get current betting odds for all horses in a race',
                schema: zod_1.z.object({
                    raceGuid: zod_1.z.string(),
                }),
                func: async ({ raceGuid }) => {
                    const race = await this.prisma.race.findUnique({
                        where: { guid: raceGuid },
                        select: { pariSimpleJson: true },
                    });
                    return race?.pariSimpleJson || 'No odds available';
                },
            }),
            // Get interviews
            new tools_1.DynamicStructuredTool({
                name: 'get_interviews',
                description: 'Get expert interviews about horses in the race',
                schema: zod_1.z.object({
                    raceGuid: zod_1.z.string(),
                }),
                func: async ({ raceGuid }) => {
                    const race = await this.prisma.race.findUnique({
                        where: { guid: raceGuid },
                        select: { interviewsJson: true },
                    });
                    return race?.interviewsJson || 'No interviews available';
                },
            }),
            // Get notes
            new tools_1.DynamicStructuredTool({
                name: 'get_notes',
                description: 'Get detailed notes about each horse in the race',
                schema: zod_1.z.object({
                    raceGuid: zod_1.z.string(),
                }),
                func: async ({ raceGuid }) => {
                    const race = await this.prisma.race.findUnique({
                        where: { guid: raceGuid },
                        select: { notesJson: true },
                    });
                    return race?.notesJson || 'No notes available';
                },
            }),
            // Get tracking
            new tools_1.DynamicStructuredTool({
                name: 'get_tracking',
                description: 'Get GPS tracking data and positions for horses',
                schema: zod_1.z.object({
                    raceGuid: zod_1.z.string(),
                }),
                func: async ({ raceGuid }) => {
                    const race = await this.prisma.race.findUnique({
                        where: { guid: raceGuid },
                        select: { trackingJson: true },
                    });
                    return race?.trackingJson || 'No tracking available';
                },
            }),
            // Get notule
            new tools_1.DynamicStructuredTool({
                name: 'get_notule',
                description: 'Get official race report and analysis',
                schema: zod_1.z.object({
                    raceGuid: zod_1.z.string(),
                }),
                func: async ({ raceGuid }) => {
                    const race = await this.prisma.race.findUnique({
                        where: { guid: raceGuid },
                        select: { notuleJson: true },
                    });
                    return race?.notuleJson || 'No notule available';
                },
            }),
            // Get references
            new tools_1.DynamicStructuredTool({
                name: 'get_references',
                description: 'Get past reference races and historical data',
                schema: zod_1.z.object({
                    raceGuid: zod_1.z.string(),
                }),
                func: async ({ raceGuid }) => {
                    const race = await this.prisma.race.findUnique({
                        where: { guid: raceGuid },
                        select: { referencesJson: true },
                    });
                    return race?.referencesJson || 'No references available';
                },
            }),
            // Get horse details
            new tools_1.DynamicStructuredTool({
                name: 'get_horse_details',
                description: 'Get complete horse information including stats and history',
                schema: zod_1.z.object({
                    horseSlug: zod_1.z.string().describe('Horse slug like "arion" or "golden-star"'),
                }),
                func: async ({ horseSlug }) => {
                    const horse = await this.prisma.horse.findUnique({
                        where: { slug: horseSlug },
                        include: {
                            stats: true,
                            historyRaces: {
                                orderBy: { dateReunion: 'desc' },
                                take: 10,
                            },
                        },
                    });
                    return JSON.stringify(horse, null, 2);
                },
            }),
            // Get horse history
            new tools_1.DynamicStructuredTool({
                name: 'get_horse_history',
                description: 'Get detailed race history for a horse',
                schema: zod_1.z.object({
                    horseSlug: zod_1.z.string(),
                }),
                func: async ({ horseSlug }) => {
                    const horse = await this.prisma.horse.findUnique({
                        where: { slug: horseSlug },
                        select: { historyJson: true },
                    });
                    return horse?.historyJson || 'No history available';
                },
            }),
            // Get horse stats
            new tools_1.DynamicStructuredTool({
                name: 'get_horse_stats',
                description: 'Get statistical analysis for a horse',
                schema: zod_1.z.object({
                    horseSlug: zod_1.z.string(),
                }),
                func: async ({ horseSlug }) => {
                    const horse = await this.prisma.horse.findUnique({
                        where: { slug: horseSlug },
                        select: { statsJson: true },
                    });
                    return horse?.statsJson || 'No stats available';
                },
            }),
            // Search horses in race
            new tools_1.DynamicStructuredTool({
                name: 'search_horses_in_race',
                description: 'Search for specific horses by name or number in a race',
                schema: zod_1.z.object({
                    raceGuid: zod_1.z.string(),
                    query: zod_1.z.string().describe('Horse name or number to search for'),
                }),
                func: async ({ raceGuid, query }) => {
                    const race = await this.prisma.race.findUnique({
                        where: { guid: raceGuid },
                        include: {
                            partants: {
                                include: { horse: true, jockey: true, trainer: true },
                            },
                        },
                    });
                    if (!race)
                        return 'Race not found';
                    const matches = race.partants.filter((p) => p.horse.nomCheval.toLowerCase().includes(query.toLowerCase()) ||
                        p.numPartant.toString() === query);
                    return JSON.stringify(matches, null, 2);
                },
            }),
        ];
    }
    async ensureVectorStore(raceGuid) {
        // Ensure vector store is initialized
        await this.ensureInitialized();
        // Check if race is already ingested
        const docs = await this.vectorStore.similaritySearch('test', 1, raceGuid);
        if (docs.length === 0) {
            // Ingest race into vector store
            await this.vectorIngestion.ingestRace(raceGuid);
        }
    }
    async chat(sessionId, userMessage, context) {
        // Ensure vector store has race data
        if (context.raceGuid) {
            await this.ensureVectorStore(context.raceGuid);
        }
        // Ensure vector store is initialized
        await this.ensureInitialized();
        // Retrieve relevant documents
        const relevantDocs = await this.vectorStore.similaritySearch(userMessage, 5, context.raceGuid);
        // Build context for LLM
        const contextText = relevantDocs.map((doc) => doc.content).join('\n\n');
        // Create system message
        const systemMessage = `Tu es un assistant expert en courses hippiques. Tu as accès à toutes les données de la course en cours.

Contexte de la course:
${contextText}

Tu peux utiliser les outils suivants pour obtenir plus d'informations:
- get_race_details: Détails complets de la course
- get_pronostic: Pronostics experts
- get_odds: Cotes actuelles
- get_interviews: Interviews d'experts
- get_notes: Notes détaillées sur les chevaux
- get_tracking: Données GPS et positions
- get_notule: Rapport officiel de course
- get_references: Courses de référence
- get_horse_details: Informations complètes sur un cheval
- search_horses_in_race: Rechercher un cheval dans la course

Réponds en français de manière claire et concise. Si tu utilises des données, cite tes sources.`;
        // For now, generate response without full agent (simplified)
        const response = await this.generateSimpleResponse(userMessage, contextText, context);
        // Save to session
        await this.saveMessage(sessionId, 'user', userMessage, context);
        await this.saveMessage(sessionId, 'assistant', response.message, context);
        return response;
    }
    async generateSimpleResponse(userMessage, contextText, context) {
        const msg = userMessage.toLowerCase();
        // Use context to provide smart responses
        const lines = contextText.split('\n');
        const sources = [];
        // Extract key info from context
        const raceInfo = lines.find((l) => l.startsWith('Course:'));
        const distanceInfo = lines.find((l) => l.startsWith('Distance:'));
        const terrainInfo = lines.find((l) => l.startsWith('Terrain:'));
        const partantsInfo = lines.find((l) => l.startsWith('Nombre de partants:'));
        if (msg.includes('distance')) {
            sources.push('Race overview');
            return {
                message: distanceInfo || 'Distance non disponible',
                sources,
                suggestions: ['Quel est le terrain ?', 'Qui sont les favoris ?', 'Combien de partants ?'],
            };
        }
        if (msg.includes('terrain')) {
            sources.push('Race overview');
            return {
                message: terrainInfo || 'Terrain non disponible',
                sources,
                suggestions: ['Quelle est la distance ?', 'Voir le pronostic', 'Voir les cotes'],
            };
        }
        if (msg.includes('partant') || msg.includes('cheval')) {
            sources.push('Race overview', 'Partants list');
            const horses = lines.filter((l) => l.match(/^N°\d+/));
            return {
                message: `${partantsInfo}\n\nPrincipaux partants:\n${horses.slice(0, 5).join('\n')}`,
                sources,
                suggestions: ['Voir le pronostic', 'Détails sur le N°1', 'Voir les cotes'],
            };
        }
        if (msg.includes('favori') || msg.includes('pronostic')) {
            sources.push('Pronostic expert');
            const pronoLines = lines.filter((l) => l.includes('Sélections:') || l.includes('Base:'));
            return {
                message: pronoLines.join('\n') || 'Pronostic non disponible',
                sources,
                suggestions: ['Détails sur le favori', 'Voir les cotes', 'Voir les notes'],
            };
        }
        if (msg.match(/n°?\s*(\d+)/i)) {
            const num = msg.match(/n°?\s*(\d+)/i)[1];
            const horseInfo = lines.filter((l) => l.startsWith(`N°${num}`));
            sources.push(`Horse N°${num}`);
            return {
                message: horseInfo.join('\n') || `Cheval N°${num} non trouvé`,
                sources,
                suggestions: ['Historique de ce cheval', 'Voir le pronostic', 'Voir les autres'],
            };
        }
        // Default: show race overview
        sources.push('Race overview');
        return {
            message: `${raceInfo}\n${distanceInfo}\n${terrainInfo}\n${partantsInfo}`,
            sources,
            suggestions: ['Qui sont les favoris ?', 'Voir les partants', 'Voir les cotes'],
        };
    }
    async saveMessage(sessionId, role, content, context) {
        await this.prisma.chatMessage.create({
            data: {
                sessionId,
                role,
                content,
                raceGuid: context?.raceGuid,
                horseSlug: context?.horseSlug,
            },
        });
    }
    async createSession(userId) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const expiresAt = luxon_1.DateTime.now().plus({ hours: 24 }).toJSDate();
        await this.prisma.chatSession.create({
            data: {
                sessionId,
                userId,
                expiresAt,
            },
        });
        return sessionId;
    }
    async getSession(sessionId) {
        return await this.prisma.chatSession.findUnique({
            where: { sessionId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 20,
                },
            },
        });
    }
    async updateContext(sessionId, context) {
        await this.prisma.chatSession.update({
            where: { sessionId },
            data: {
                currentRaceGuid: context.raceGuid,
                currentHorseSlug: context.horseSlug,
                lastActivityAt: new Date(),
            },
        });
        // Ensure vector store has race data
        if (context.raceGuid) {
            await this.ensureVectorStore(context.raceGuid);
        }
    }
    async ingestAllRaces() {
        return await this.vectorIngestion.ingestAllRaces();
    }
}
exports.RagChatbotService = RagChatbotService;
//# sourceMappingURL=RagChatbotService.js.map
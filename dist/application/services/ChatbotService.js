"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const luxon_1 = require("luxon");
class ChatbotService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createSession(userId) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
                    take: 20, // Last 20 messages
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
    }
    async addMessage(sessionId, role, content, context) {
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
    async chat(sessionId, userMessage, context) {
        // Get session
        const session = await this.getSession(sessionId);
        if (!session) {
            throw new Error('Session not found');
        }
        // Update context if provided
        if (context) {
            await this.updateContext(sessionId, context);
        }
        // Save user message
        await this.addMessage(sessionId, 'user', userMessage, context);
        // Get race data if in context
        let raceData = null;
        let horseData = null;
        if (context?.raceGuid) {
            raceData = await this.prisma.race.findUnique({
                where: { guid: context.raceGuid },
                include: {
                    reunion: {
                        include: { hippodrome: true },
                    },
                    partants: {
                        include: {
                            horse: true,
                            jockey: true,
                            trainer: true,
                        },
                    },
                },
            });
        }
        if (context?.horseSlug) {
            horseData = await this.prisma.horse.findUnique({
                where: { slug: context.horseSlug },
                include: {
                    stats: true,
                    historyRaces: {
                        orderBy: { dateReunion: 'desc' },
                        take: 5,
                    },
                },
            });
        }
        // Generate response based on context
        const response = await this.generateResponse(userMessage, {
            raceData,
            horseData,
            history: session.messages,
        });
        // Save assistant message
        await this.addMessage(sessionId, 'assistant', response.message, context);
        return response;
    }
    async generateResponse(userMessage, data) {
        const msg = userMessage.toLowerCase();
        // Race-specific queries
        if (data.raceData) {
            const race = data.raceData;
            if (msg.includes('distance') || msg.includes('combien de mètre')) {
                return {
                    message: `Cette course se court sur ${race.distance}m sur ${race.etatTerrain}.`,
                    context: { raceGuid: race.guid },
                    suggestions: ['Qui sont les favoris ?', 'Quel est le pronostic ?', 'Combien de partants ?'],
                };
            }
            if (msg.includes('partant') || msg.includes('cheval')) {
                return {
                    message: `Il y a ${race.partants.length} partants dans cette course. Les principaux favoris sont : ${race.partants
                        .slice(0, 3)
                        .map((p) => `N°${p.numPartant} ${p.horse.nomCheval}`)
                        .join(', ')}.`,
                    context: { raceGuid: race.guid },
                    suggestions: ['Détails sur le N°1', 'Quel est le terrain ?', 'Quelle heure ?'],
                };
            }
            if (msg.includes('heure') || msg.includes('départ')) {
                return {
                    message: `Le départ est prévu à ${race.heureDepartCourse} à ${race.reunion.hippodrome.name}.`,
                    context: { raceGuid: race.guid },
                    suggestions: ['Qui sont les favoris ?', 'Quel est le pronostic ?'],
                };
            }
            if (msg.includes('favori') || msg.includes('pronostic')) {
                const pronostic = race.pronosticJson ? JSON.parse(race.pronosticJson) : null;
                if (pronostic?.selections) {
                    const top3 = pronostic.selections.slice(0, 3);
                    return {
                        message: `Les favoris selon notre expert sont : ${top3.map((s) => `N°${s.num_partant} ${s.nom_cheval}`).join(', ')}.`,
                        context: { raceGuid: race.guid },
                        suggestions: ['Détails sur le N°' + top3[0].num_partant, 'Voir les cotes', 'Historique'],
                    };
                }
            }
            if (msg.includes('cote') || msg.includes('odds')) {
                const pariSimple = race.pariSimpleJson ? JSON.parse(race.pariSimpleJson) : null;
                if (pariSimple?.rapports_probables) {
                    const top3 = pariSimple.rapports_probables.slice(0, 3);
                    return {
                        message: `Les cotes actuelles : ${top3.map((r) => `N°${r.num_partant} à ${r.rapport}€`).join(', ')}.`,
                        context: { raceGuid: race.guid },
                        suggestions: ['Qui est le favori ?', 'Voir le pronostic', 'Détails partants'],
                    };
                }
            }
            if (msg.match(/n°?\s*(\d+)/i)) {
                const num = parseInt(msg.match(/n°?\s*(\d+)/i)[1]);
                const partant = race.partants.find((p) => p.numPartant === num);
                if (partant) {
                    return {
                        message: `N°${num} ${partant.horse.nomCheval} - ${partant.horse.ageCheval} ans, monté par ${partant.jockey.nomMonte}. Musique : ${partant.horse.musique}`,
                        context: { raceGuid: race.guid, horseSlug: partant.horse.slug },
                        suggestions: ['Historique de ce cheval', 'Statistiques', 'Voir les autres partants'],
                    };
                }
            }
        }
        // Horse-specific queries
        if (data.horseData) {
            const horse = data.horseData;
            if (msg.includes('victoire') || msg.includes('gagné')) {
                return {
                    message: `${horse.nomCheval} a remporté ${horse.stats?.carriereNbVictoire || 0} victoires sur ${horse.stats?.carriereNbCourse || 0} courses.`,
                    context: { horseSlug: horse.slug },
                    suggestions: ['Dernières performances', 'Gains carrière', 'Musique'],
                };
            }
            if (msg.includes('performance') || msg.includes('historique')) {
                const last3 = horse.historyRaces.slice(0, 3);
                return {
                    message: `Dernières performances de ${horse.nomCheval} : ${last3
                        .map((h) => `${h.textePlaceArrivee} à ${h.hippodromeName} (${h.dateReunion})`)
                        .join(', ')}.`,
                    context: { horseSlug: horse.slug },
                    suggestions: ['Voir les statistiques', 'Gains carrière', 'Retour à la course'],
                };
            }
            if (msg.includes('gain') || msg.includes('argent')) {
                return {
                    message: `${horse.nomCheval} a gagné ${horse.gainsCarriere}€ en carrière.`,
                    context: { horseSlug: horse.slug },
                    suggestions: ['Nombre de victoires', 'Dernières courses', 'Statistiques'],
                };
            }
        }
        // General queries
        if (msg.includes('aide') || msg.includes('help')) {
            return {
                message: "Je peux vous aider avec :\n- Informations sur la course (distance, heure, partants)\n- Pronostics et favoris\n- Cotes et paris\n- Détails sur les chevaux\n- Historique et statistiques\n\nPosez-moi une question !",
                context: {},
                suggestions: ['Qui sont les favoris ?', 'Quelle est la distance ?', 'Voir les cotes'],
            };
        }
        // Default response
        return {
            message: "Je n'ai pas bien compris votre question. Vous pouvez me demander des informations sur la course, les chevaux, les pronostics ou les cotes.",
            context: {},
            suggestions: ['Aide', 'Qui sont les favoris ?', 'Voir les partants'],
        };
    }
    async cleanupExpiredSessions() {
        const now = new Date();
        await this.prisma.chatSession.deleteMany({
            where: {
                expiresAt: {
                    lt: now,
                },
            },
        });
    }
}
exports.ChatbotService = ChatbotService;
//# sourceMappingURL=ChatbotService.js.map
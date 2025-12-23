"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotController = void 0;
class ChatbotController {
    constructor(chatbotService) {
        this.chatbotService = chatbotService;
        this.createSession = async (req, res) => {
            try {
                const { userId } = req.body;
                const sessionId = await this.chatbotService.createSession(userId);
                res.json({
                    success: true,
                    sessionId,
                    message: 'Session créée. Comment puis-je vous aider ?',
                });
            }
            catch (error) {
                console.error('[CHATBOT] Error creating session:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to create session',
                });
            }
        };
        this.chat = async (req, res) => {
            try {
                const { sessionId, message, context } = req.body;
                if (!sessionId || !message) {
                    return res.status(400).json({
                        success: false,
                        error: 'sessionId and message are required',
                    });
                }
                const response = await this.chatbotService.chat(sessionId, message, context);
                res.json({
                    success: true,
                    ...response,
                });
            }
            catch (error) {
                console.error('[CHATBOT] Error in chat:', error.message);
                res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        };
        this.getHistory = async (req, res) => {
            try {
                const { sessionId } = req.params;
                const session = await this.chatbotService.getSession(sessionId);
                if (!session) {
                    return res.status(404).json({
                        success: false,
                        error: 'Session not found',
                    });
                }
                res.json({
                    success: true,
                    messages: session.messages,
                    context: {
                        raceGuid: session.currentRaceGuid,
                        horseSlug: session.currentHorseSlug,
                    },
                });
            }
            catch (error) {
                console.error('[CHATBOT] Error getting history:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to get history',
                });
            }
        };
        this.updateContext = async (req, res) => {
            try {
                const { sessionId } = req.params;
                const { raceGuid, horseSlug } = req.body;
                await this.chatbotService.updateContext(sessionId, { raceGuid, horseSlug });
                res.json({
                    success: true,
                    message: 'Context updated',
                });
            }
            catch (error) {
                console.error('[CHATBOT] Error updating context:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to update context',
                });
            }
        };
        this.ingestAllRaces = async (req, res) => {
            try {
                const result = await this.chatbotService.ingestAllRaces();
                res.json({
                    success: true,
                    message: 'Vector store ingestion complete',
                    ...result,
                });
            }
            catch (error) {
                console.error('[CHATBOT] Error ingesting races:', error.message);
                res.status(500).json({
                    success: false,
                    error: 'Failed to ingest races',
                });
            }
        };
    }
}
exports.ChatbotController = ChatbotController;
//# sourceMappingURL=ChatbotController.js.map
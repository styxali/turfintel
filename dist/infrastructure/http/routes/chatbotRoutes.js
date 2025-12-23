"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatbotRoutes = createChatbotRoutes;
// Chatbot Routes
const express_1 = require("express");
function createChatbotRoutes(controller) {
    const router = (0, express_1.Router)();
    // Create new chat session
    router.post('/session', controller.createSession);
    // Send message and get response
    router.post('/chat', controller.chat);
    // Get chat history
    router.get('/history/:sessionId', controller.getHistory);
    // Update context (when user navigates to different race/horse)
    router.put('/context/:sessionId', controller.updateContext);
    // Ingest all races into vector store
    router.post('/ingest-all', controller.ingestAllRaces);
    return router;
}
//# sourceMappingURL=chatbotRoutes.js.map
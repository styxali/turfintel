// Chatbot Routes
import { Router } from 'express';
import { ChatbotController } from '../controllers/ChatbotController';

export function createChatbotRoutes(controller: ChatbotController): Router {
  const router = Router();

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

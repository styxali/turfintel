// Chatbot Controller
import { Request, Response } from 'express';
import { RagChatbotService } from '../../../application/services/RagChatbotService';

export class ChatbotController {
  constructor(private chatbotService: RagChatbotService) {}

  createSession = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const sessionId = await this.chatbotService.createSession(userId);

      res.json({
        success: true,
        sessionId,
        message: 'Session créée. Comment puis-je vous aider ?',
      });
    } catch (error: any) {
      console.error('[CHATBOT] Error creating session:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to create session',
      });
    }
  };

  chat = async (req: Request, res: Response) => {
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
    } catch (error: any) {
      console.error('[CHATBOT] Error in chat:', error.message);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  };

  getHistory = async (req: Request, res: Response) => {
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
    } catch (error: any) {
      console.error('[CHATBOT] Error getting history:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to get history',
      });
    }
  };

  updateContext = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { raceGuid, horseSlug } = req.body;

      await this.chatbotService.updateContext(sessionId, { raceGuid, horseSlug });

      res.json({
        success: true,
        message: 'Context updated',
      });
    } catch (error: any) {
      console.error('[CHATBOT] Error updating context:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to update context',
      });
    }
  };

  ingestAllRaces = async (req: Request, res: Response) => {
    try {
      const result = await this.chatbotService.ingestAllRaces();

      res.json({
        success: true,
        message: 'Vector store ingestion complete',
        ...result,
      });
    } catch (error: any) {
      console.error('[CHATBOT] Error ingesting races:', error.message);
      res.status(500).json({
        success: false,
        error: 'Failed to ingest races',
      });
    }
  };
}

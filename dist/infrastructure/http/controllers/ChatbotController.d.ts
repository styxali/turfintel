import { Request, Response } from 'express';
import { RagChatbotService } from '../../../application/services/RagChatbotService';
export declare class ChatbotController {
    private chatbotService;
    constructor(chatbotService: RagChatbotService);
    createSession: (req: Request, res: Response) => Promise<void>;
    chat: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    updateContext: (req: Request, res: Response) => Promise<void>;
    ingestAllRaces: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=ChatbotController.d.ts.map
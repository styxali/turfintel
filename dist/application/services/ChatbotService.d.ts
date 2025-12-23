import { PrismaClient } from '@prisma/client';
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface ChatContext {
    raceGuid?: string;
    horseSlug?: string;
    raceData?: any;
    horseData?: any;
}
export interface ChatResponse {
    message: string;
    context: ChatContext;
    suggestions?: string[];
}
export declare class ChatbotService {
    private prisma;
    constructor(prisma: PrismaClient);
    createSession(userId?: string): Promise<string>;
    getSession(sessionId: string): Promise<({
        messages: {
            model: string | null;
            id: string;
            createdAt: Date;
            raceGuid: string | null;
            sessionId: string;
            role: string;
            content: string;
            horseSlug: string | null;
            tokens: number | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expiresAt: Date;
        sessionId: string;
        userId: string | null;
        currentRaceGuid: string | null;
        currentHorseSlug: string | null;
        lastActivityAt: Date;
    }) | null>;
    updateContext(sessionId: string, context: ChatContext): Promise<void>;
    addMessage(sessionId: string, role: 'user' | 'assistant' | 'system', content: string, context?: ChatContext): Promise<void>;
    chat(sessionId: string, userMessage: string, context?: ChatContext): Promise<ChatResponse>;
    private generateResponse;
    cleanupExpiredSessions(): Promise<void>;
}
//# sourceMappingURL=ChatbotService.d.ts.map
import { PrismaClient } from '@prisma/client';
export interface RagChatContext {
    raceGuid?: string;
    horseSlug?: string;
}
export interface RagChatResponse {
    message: string;
    sources?: string[];
    suggestions?: string[];
}
export declare class RagChatbotService {
    private prisma;
    private llm;
    private embeddings;
    private vectorStore;
    private vectorIngestion;
    private tools;
    private initialized;
    constructor(prisma: PrismaClient);
    private ensureInitialized;
    private createTools;
    ensureVectorStore(raceGuid: string): Promise<void>;
    chat(sessionId: string, userMessage: string, context: RagChatContext): Promise<RagChatResponse>;
    private generateSimpleResponse;
    private saveMessage;
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
    updateContext(sessionId: string, context: RagChatContext): Promise<void>;
    ingestAllRaces(): Promise<{
        total: number;
        ingested: number;
    }>;
}
//# sourceMappingURL=RagChatbotService.d.ts.map
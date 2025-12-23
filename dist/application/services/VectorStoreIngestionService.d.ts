import { PrismaClient } from '@prisma/client';
import { SqliteVectorStore } from '../../infrastructure/vectorstore/SqliteVectorStore';
export declare class VectorStoreIngestionService {
    private prisma;
    private vectorStore;
    private embeddings;
    private initialized;
    constructor(prisma: PrismaClient);
    private ensureInitialized;
    ingestRace(raceGuid: string): Promise<number>;
    ingestAllRaces(): Promise<{
        total: number;
        ingested: number;
    }>;
    getVectorStore(): SqliteVectorStore;
}
//# sourceMappingURL=VectorStoreIngestionService.d.ts.map
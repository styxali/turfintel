export interface VectorDocument {
    id: string;
    content: string;
    embedding: number[];
    metadata: {
        type: string;
        raceGuid?: string;
        horseSlug?: string;
        numPartant?: number;
    };
}
export declare class SqliteVectorStore {
    private dbPath?;
    private db;
    private embeddings;
    constructor(dbPath?: string | undefined);
    /** MUST be called once */
    init(): Promise<void>;
    private initializeDatabase;
    addDocuments(documents: VectorDocument[]): Promise<void>;
    similaritySearch(query: string, k?: number, raceGuid?: string): Promise<VectorDocument[]>;
    deleteByRaceGuid(raceGuid: string): Promise<void>;
    clear(): Promise<void>;
    close(): Promise<void>;
    private cosineSimilarity;
}
//# sourceMappingURL=SqliteVectorStore.d.ts.map
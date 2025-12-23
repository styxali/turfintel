"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqliteVectorStore = void 0;
// SQLite Vector Store for Race Data (node-sqlite)
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const openai_1 = require("@langchain/openai");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class SqliteVectorStore {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.embeddings = new openai_1.OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
    }
    /** MUST be called once */
    async init() {
        const vectorDbPath = this.dbPath || path_1.default.join(process.cwd(), 'data', 'vectors.db');
        // Ensure directory exists
        const dir = path_1.default.dirname(vectorDbPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        this.db = await (0, sqlite_1.open)({
            filename: vectorDbPath,
            driver: sqlite3_1.default.Database,
        });
        await this.initializeDatabase();
    }
    async initializeDatabase() {
        await this.db.exec(`
      PRAGMA journal_mode = WAL;

      CREATE TABLE IF NOT EXISTS vectors (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        embedding TEXT NOT NULL,
        type TEXT NOT NULL,
        race_guid TEXT,
        horse_slug TEXT,
        num_partant INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_vectors_race_guid ON vectors(race_guid);
      CREATE INDEX IF NOT EXISTS idx_vectors_type ON vectors(type);
      CREATE INDEX IF NOT EXISTS idx_vectors_horse_slug ON vectors(horse_slug);
    `);
    }
    // -----------------------------
    // Insert / Upsert documents
    // -----------------------------
    async addDocuments(documents) {
        const stmt = await this.db.prepare(`
      INSERT OR REPLACE INTO vectors
      (id, content, embedding, type, race_guid, horse_slug, num_partant)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        try {
            await this.db.exec('BEGIN');
            for (const doc of documents) {
                await stmt.run(doc.id, doc.content, JSON.stringify(doc.embedding), doc.metadata.type, doc.metadata.raceGuid ?? null, doc.metadata.horseSlug ?? null, doc.metadata.numPartant ?? null);
            }
            await this.db.exec('COMMIT');
        }
        catch (err) {
            await this.db.exec('ROLLBACK');
            throw err;
        }
        finally {
            await stmt.finalize();
        }
    }
    // -----------------------------
    // Similarity search
    // -----------------------------
    async similaritySearch(query, k = 5, raceGuid) {
        const queryEmbedding = await this.embeddings.embedQuery(query);
        let sql = 'SELECT * FROM vectors';
        const params = [];
        if (raceGuid) {
            sql += ' WHERE race_guid = ?';
            params.push(raceGuid);
        }
        const rows = (await this.db.all(sql, params));
        const scored = rows.map((row) => {
            const embedding = JSON.parse(row.embedding);
            const similarity = this.cosineSimilarity(queryEmbedding, embedding);
            return {
                id: row.id,
                content: row.content,
                embedding,
                metadata: {
                    type: row.type,
                    raceGuid: row.race_guid,
                    horseSlug: row.horse_slug,
                    numPartant: row.num_partant,
                },
                similarity,
            };
        });
        return scored
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, k);
    }
    // -----------------------------
    // Delete helpers
    // -----------------------------
    async deleteByRaceGuid(raceGuid) {
        await this.db.run('DELETE FROM vectors WHERE race_guid = ?', raceGuid);
    }
    async clear() {
        await this.db.exec('DELETE FROM vectors');
    }
    async close() {
        await this.db.close();
    }
    // -----------------------------
    // Math
    // -----------------------------
    cosineSimilarity(a, b) {
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] ** 2;
            normB += b[i] ** 2;
        }
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
exports.SqliteVectorStore = SqliteVectorStore;
//# sourceMappingURL=SqliteVectorStore.js.map
// SQLite Vector Store for Race Data (node-sqlite)
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { OpenAIEmbeddings } from '@langchain/openai';
import path from 'path';
import fs from 'fs';

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

export class SqliteVectorStore {
  private db!: Database<sqlite3.Database, sqlite3.Statement>;
  private embeddings: OpenAIEmbeddings;

  constructor(private dbPath?: string) {
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  /** MUST be called once */
  async init() {
    // Default path for race-specific DB
    const vectorDbPath =
      this.dbPath || path.join(process.cwd(), 'data', 'vectors', 'default.db');

    // Ensure directory exists
    const dir = path.dirname(vectorDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = await open({
      filename: vectorDbPath,
      driver: sqlite3.Database,
    });

    await this.initializeDatabase();
  }

  /** Create a race-specific vector store with organized folder structure */
  static forRace(raceGuid: string): SqliteVectorStore {
    // Parse guid: 20251212_R4_C01 -> 2025-12-12/R4/C1
    const parts = raceGuid.split('_');
    if (parts.length !== 3) {
      throw new Error(`Invalid race GUID format: ${raceGuid}. Expected format: YYYYMMDD_RX_CY`);
    }
    
    const dateStr = parts[0]; // 20251212
    const reunion = parts[1]; // R4
    const courseRaw = parts[2]; // C01 or C1
    
    // Format date: 20251212 -> 2025-12-12
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    const date = `${year}-${month}-${day}`;
    
    // Ensure course is in CXX format (C01, C02, etc.)
    const courseNum = courseRaw.replace(/^C0*/, ''); // Remove C and leading zeros
    const course = `C${courseNum.padStart(2, '0')}`; // Add back C with 2-digit padding
    
    const dbPath = path.join(
      process.cwd(),
      'data',
      'vectors',
      date,
      reunion,
      course,
      'context.db'
    );
    
    console.log(`[VECTOR STORE] Creating store for race ${raceGuid} at: ${dbPath}`);
    
    return new SqliteVectorStore(dbPath);
  }

  private async initializeDatabase() {
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
  async addDocuments(documents: VectorDocument[]) {
    const stmt = await this.db.prepare(`
      INSERT OR REPLACE INTO vectors
      (id, content, embedding, type, race_guid, horse_slug, num_partant)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      await this.db.exec('BEGIN');

      for (const doc of documents) {
        await stmt.run(
          doc.id,
          doc.content,
          JSON.stringify(doc.embedding),
          doc.metadata.type,
          doc.metadata.raceGuid ?? null,
          doc.metadata.horseSlug ?? null,
          doc.metadata.numPartant ?? null
        );
      }

      await this.db.exec('COMMIT');
    } catch (err) {
      await this.db.exec('ROLLBACK');
      throw err;
    } finally {
      await stmt.finalize();
    }
  }

  // -----------------------------
  // Similarity search
  // -----------------------------
  async similaritySearch(
    query: string,
    k = 5,
    raceGuid?: string
  ): Promise<VectorDocument[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);

    let sql = 'SELECT * FROM vectors';
    const params: any[] = [];

    if (raceGuid) {
      sql += ' WHERE race_guid = ?';
      params.push(raceGuid);
    }

    const rows = (await this.db.all(sql, params)) as any[];

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
  async deleteByRaceGuid(raceGuid: string) {
    await this.db.run(
      'DELETE FROM vectors WHERE race_guid = ?',
      raceGuid
    );
  }

  async clear() {
    await this.db.exec('DELETE FROM vectors');
  }

  async close() {
    await this.db.close();
  }

  async getDocumentCount(): Promise<number> {
    const result = await this.db.get('SELECT COUNT(*) as count FROM vectors');
    return result?.count || 0;
  }

  // -----------------------------
  // Math
  // -----------------------------
  private cosineSimilarity(a: number[], b: number[]): number {
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

// Vector Store Ingestion Service
import { PrismaClient } from '@prisma/client';
import { SqliteVectorStore, VectorDocument } from '../../infrastructure/vectorstore/SqliteVectorStore';
import { OpenAIEmbeddings } from '@langchain/openai';
import path from 'path';
import fs from 'fs';

export class VectorStoreIngestionService {
  private embeddings: OpenAIEmbeddings;
  private raceStores: Map<string, SqliteVectorStore> = new Map();

  constructor(private prisma: PrismaClient) {
    if (!process.env.OPENAI_API_KEY) {
      console.error('[VECTOR INGESTION] ❌ OPENAI_API_KEY not set in environment!');
      throw new Error('OPENAI_API_KEY is required for vector embeddings');
    }
    
    console.log('[VECTOR INGESTION] ✅ OpenAI API key found, initializing embeddings...');
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    console.log('[VECTOR INGESTION] ✅ Embeddings service initialized');
  }

  private async getStoreForRace(raceGuid: string): Promise<SqliteVectorStore> {
    if (!this.raceStores.has(raceGuid)) {
      const store = SqliteVectorStore.forRace(raceGuid);
      await store.init();
      this.raceStores.set(raceGuid, store);
    }
    return this.raceStores.get(raceGuid)!;
  }

  async ingestRace(raceGuid: string): Promise<number> {
    console.log(`[VECTOR INGESTION] 🚀 Starting comprehensive ingestion for race: ${raceGuid}`);

    // Get race-specific vector store
    console.log(`[VECTOR INGESTION] 📦 Getting race-specific vector store...`);
    const vectorStore = await this.getStoreForRace(raceGuid);
    console.log(`[VECTOR INGESTION] ✅ Vector store ready`);

    // Clear existing data for this race
    console.log(`[VECTOR INGESTION] 🧹 Clearing existing data...`);
    await vectorStore.clear();

    // Get race data
    console.log(`[VECTOR INGESTION] 🔍 Fetching race data from database...`);
    const race = await this.prisma.race.findUnique({
      where: { guid: raceGuid },
      include: {
        reunion: { include: { hippodrome: true } },
        partants: {
          include: {
            horse: true,
            jockey: true,
            trainer: true,
          },
        },
      },
    });

    if (!race) {
      console.error(`[VECTOR INGESTION] ❌ Race ${raceGuid} not found in database`);
      throw new Error(`Race ${raceGuid} not found`);
    }

    console.log(`[VECTOR INGESTION] ✅ Race found: ${race.libcourtPrixCourse}`);
    console.log(`[VECTOR INGESTION] 📊 Partants: ${race.partants.length}`);
    console.log(`[VECTOR INGESTION] 📝 Has pronostic: ${!!race.pronosticJson}`);
    console.log(`[VECTOR INGESTION] 📝 Has notes: ${!!race.notesJson}`);
    console.log(`[VECTOR INGESTION] 📝 Has interviews: ${!!race.interviewsJson}`);

    const documents: VectorDocument[] = [];

    // 1. Race overview
    console.log(`[VECTOR INGESTION] 📄 Creating race overview document...`);
    const raceOverview = `Course: ${race.libcourtPrixCourse}
Hippodrome: ${race.reunion.hippodrome.name}
Date: ${race.reunion.dateReunion}
Heure: ${race.heureDepartCourse}
Distance: ${race.distance}m
Terrain: ${race.etatTerrain}
Discipline: ${race.discipline}
Catégorie: ${race.categCourse}
Allocation: ${race.montantTotalAllocation || 'N/A'}
Nombre de partants: ${race.partants.length}`;

    console.log(`[VECTOR INGESTION] 🔮 Generating embedding for race overview...`);
    const overviewEmbedding = await this.embeddings.embedQuery(raceOverview);
    console.log(`[VECTOR INGESTION] ✅ Embedding generated (${overviewEmbedding.length} dimensions)`);
    
    documents.push({
      id: `${raceGuid}_overview`,
      content: raceOverview,
      embedding: overviewEmbedding,
      metadata: { type: 'race_overview', raceGuid },
    });

    // 2. Each horse
    console.log(`[VECTOR INGESTION] 🐴 Creating horse documents (${race.partants.length} horses)...`);
    for (let i = 0; i < race.partants.length; i++) {
      const partant = race.partants[i];
      console.log(`[VECTOR INGESTION] 🐴 Processing horse ${i + 1}/${race.partants.length}: N°${partant.numPartant} ${partant.horse.nomCheval}`);
      
      const horseContent = `N°${partant.numPartant} - ${partant.horse.nomCheval}
Âge: ${partant.horse.ageCheval} ans
Sexe: ${partant.horse.sexeCheval}
Jockey: ${partant.jockey.nomMonte}
Entraîneur: ${partant.trainer.nomEntraineur}
Musique: ${partant.horse.musique}
Gains carrière: ${partant.horse.gainsCarriere}€
Poids: ${partant.pdsCalcHandPartant}kg
Corde: ${partant.placeCordepartant}`;

      console.log(`[VECTOR INGESTION] 🔮 Generating embedding for horse N°${partant.numPartant}...`);
      const horseEmbedding = await this.embeddings.embedQuery(horseContent);
      console.log(`[VECTOR INGESTION] ✅ Embedding generated for N°${partant.numPartant}`);
      
      documents.push({
        id: `${raceGuid}_horse_${partant.numPartant}`,
        content: horseContent,
        embedding: horseEmbedding,
        metadata: {
          type: 'horse',
          raceGuid,
          horseSlug: partant.horse.slug,
          numPartant: partant.numPartant,
        },
      });
    }
    console.log(`[VECTOR INGESTION] ✅ All horse documents created`);

    // 3. Pronostic
    if (race.pronosticJson) {
      const prono = JSON.parse(race.pronosticJson);
      const pronoContent = `Pronostic Expert:
${prono.chapeau || ''}
Sélections: ${prono.selections?.map((s: any) => `N°${s.num_partant} ${s.nom_cheval}`).join(', ') || 'N/A'}
Base: ${prono.base ? `N°${prono.base.num_partant} ${prono.base.nom_cheval}` : 'N/A'}
Outsider: ${prono.outsider ? `N°${prono.outsider.num_partant} ${prono.outsider.nom_cheval}` : 'N/A'}`;

      documents.push({
        id: `${raceGuid}_pronostic`,
        content: pronoContent,
        embedding: await this.embeddings.embedQuery(pronoContent),
        metadata: { type: 'pronostic', raceGuid },
      });
    }

    // 4. Notes
    if (race.notesJson) {
      const notes = JSON.parse(race.notesJson);
      if (notes.notes) {
        for (const note of notes.notes) {
          const noteContent = `Note N°${note.num_partant} ${note.nom_cheval}: ${note.texte_note}`;
          documents.push({
            id: `${raceGuid}_note_${note.num_partant}`,
            content: noteContent,
            embedding: await this.embeddings.embedQuery(noteContent),
            metadata: { type: 'note', raceGuid, numPartant: note.num_partant },
          });
        }
      }
    }

    // 5. Interviews
    if (race.interviewsJson) {
      const interviews = JSON.parse(race.interviewsJson);
      if (interviews.interviews) {
        for (const interview of interviews.interviews) {
          const interviewContent = `Interview ${interview.personne}: ${interview.texte}`;
          documents.push({
            id: `${raceGuid}_interview_${interview.num_partant}`,
            content: interviewContent,
            embedding: await this.embeddings.embedQuery(interviewContent),
            metadata: { type: 'interview', raceGuid, numPartant: interview.num_partant },
          });
        }
      }
    }

    // 6. Horse History & Stats (comprehensive data for each horse)
    for (const partant of race.partants) {
      // Horse history
      if (partant.horse.historyJson) {
        const history = JSON.parse(partant.horse.historyJson);
        if (history.results && history.results.length > 0) {
          const historyContent = `Historique de ${partant.horse.nomCheval}:
${history.results.slice(0, 5).map((r: any) => 
  `${r.date_reunion}: ${r.place_arrivee || 'NP'} à ${r.hippodrome?.name || 'N/A'} (${r.distance}m)`
).join('\n')}`;
          
          documents.push({
            id: `${raceGuid}_history_${partant.numPartant}`,
            content: historyContent,
            embedding: await this.embeddings.embedQuery(historyContent),
            metadata: { type: 'horse_history', raceGuid, horseSlug: partant.horse.slug, numPartant: partant.numPartant },
          });
        }
      }

      // Horse stats
      if (partant.horse.statsJson) {
        const stats = JSON.parse(partant.horse.statsJson);
        const statsContent = `Statistiques de ${partant.horse.nomCheval}:
Victoires: ${stats.nb_victoires || 0}
Places: ${stats.nb_places || 0}
Courses: ${stats.nb_courses || 0}
Taux de réussite: ${stats.taux_reussite || 0}%`;
          
        documents.push({
          id: `${raceGuid}_stats_${partant.numPartant}`,
          content: statsContent,
          embedding: await this.embeddings.embedQuery(statsContent),
          metadata: { type: 'horse_stats', raceGuid, horseSlug: partant.horse.slug, numPartant: partant.numPartant },
        });
      }
    }

    // 7. Reference Races
    if (race.referencesJson) {
      const references = JSON.parse(race.referencesJson);
      if (references.results?.references) {
        for (let i = 0; i < references.results.references.length; i++) {
          const ref = references.results.references[i];
          const refContent = `Course de référence ${i + 1}:
Date: ${ref.date_reunion}
Hippodrome: ${ref.hippodrome?.name || 'N/A'}
Distance: ${ref.distance}m
Discipline: ${ref.discipline}
Résultat: ${ref.arrivee?.join('-') || 'N/A'}`;
          
          documents.push({
            id: `${raceGuid}_reference_${i}`,
            content: refContent,
            embedding: await this.embeddings.embedQuery(refContent),
            metadata: { type: 'reference_race', raceGuid },
          });
        }
      }
    }

    // 8. Tracking data (if available)
    if (race.trackingJson) {
      const tracking = JSON.parse(race.trackingJson);
      if (Array.isArray(tracking) && tracking.length > 0) {
        const trackingContent = `Données GPS disponibles pour ${tracking.length} chevaux
Vitesse max moyenne: ${tracking.reduce((sum: number, t: any) => sum + (t.interne_tracking_gps?.vmax || 0), 0) / tracking.length}km/h`;
        
        documents.push({
          id: `${raceGuid}_tracking`,
          content: trackingContent,
          embedding: await this.embeddings.embedQuery(trackingContent),
          metadata: { type: 'tracking', raceGuid },
        });
      }
    }

    // 9. Notule (race report)
    if (race.notuleJson) {
      const notule = JSON.parse(race.notuleJson);
      if (notule.analyse) {
        documents.push({
          id: `${raceGuid}_notule`,
          content: `Analyse de course: ${notule.analyse}`,
          embedding: await this.embeddings.embedQuery(notule.analyse),
          metadata: { type: 'notule', raceGuid },
        });
      }
    }

    // Add all documents to race-specific vector store
    console.log(`[VECTOR INGESTION] 💾 Saving ${documents.length} documents to vector store...`);
    await vectorStore.addDocuments(documents);

    console.log(`[VECTOR INGESTION] ✅ Successfully ingested ${documents.length} documents for race: ${raceGuid}`);
    console.log(`[VECTOR INGESTION] 📁 Stored in dedicated DB with comprehensive context`);
    console.log(`[VECTOR INGESTION] 📊 Document types: ${[...new Set(documents.map(d => d.metadata.type))].join(', ')}`);
    return documents.length;
  }

  /** Get the vector store for a specific race */
  async getVectorStoreForRace(raceGuid: string): Promise<SqliteVectorStore> {
    return await this.getStoreForRace(raceGuid);
  }

  async ingestAllRaces(): Promise<{ total: number; ingested: number }> {
    console.log('[VECTOR INGESTION] Starting bulk ingestion (one DB per race)...');

    // Get all races with data (any JSON field)
    const races = await this.prisma.race.findMany({
      where: {
        OR: [
          { raceDetailsJson: { not: null } },
          { pronosticJson: { not: null } },
          { notesJson: { not: null } },
          { interviewsJson: { not: null } },
        ],
      },
      select: { guid: true },
    });

    let ingested = 0;
    for (const race of races) {
      try {
        await this.ingestRace(race.guid);
        ingested++;
      } catch (error: any) {
        console.error(`[VECTOR INGESTION] Failed to ingest ${race.guid}:`, error.message);
      }
    }

    console.log(`[VECTOR INGESTION] Bulk ingestion complete: ${ingested}/${races.length} races (${ingested} DBs created)`);
    return { total: races.length, ingested };
  }

  /** Cleanup old race databases (race finished + 1 day) */
  async cleanupOldRaces(): Promise<number> {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const oldRaces = await this.prisma.race.findMany({
      where: {
        reunion: {
          dateReunion: {
            lt: oneDayAgo.toISOString().split('T')[0],
          },
        },
      },
      select: { guid: true },
    });

    let cleaned = 0;
    const vectorsDir = path.join(process.cwd(), 'data', 'vectors');

    for (const race of oldRaces) {
      try {
        // Parse guid: 20251212_R4_C01 -> 2025-12-12/R4/C01
        const parts = race.guid.split('_');
        if (parts.length !== 3) continue;
        
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
        
        const raceFolderPath = path.join(vectorsDir, date, reunion, course);
        
        if (fs.existsSync(raceFolderPath)) {
          // Remove entire race folder (context.db and any other files)
          fs.rmSync(raceFolderPath, { recursive: true, force: true });
          this.raceStores.delete(race.guid);
          cleaned++;
          console.log(`[VECTOR CLEANUP] Deleted: ${raceFolderPath}`);
        }
      } catch (error: any) {
        console.error(`[VECTOR CLEANUP] Failed to delete ${race.guid}:`, error.message);
      }
    }

    console.log(`[VECTOR CLEANUP] Cleaned up ${cleaned} old race databases`);
    return cleaned;
  }
}

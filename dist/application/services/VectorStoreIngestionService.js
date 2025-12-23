"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorStoreIngestionService = void 0;
const SqliteVectorStore_1 = require("../../infrastructure/vectorstore/SqliteVectorStore");
const openai_1 = require("@langchain/openai");
class VectorStoreIngestionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.initialized = false;
        this.vectorStore = new SqliteVectorStore_1.SqliteVectorStore();
        this.embeddings = new openai_1.OpenAIEmbeddings({
            openAIApiKey: process.env.OPENAI_API_KEY,
        });
    }
    async ensureInitialized() {
        if (!this.initialized) {
            await this.vectorStore.init();
            this.initialized = true;
        }
    }
    async ingestRace(raceGuid) {
        console.log(`[VECTOR INGESTION] Starting ingestion for race: ${raceGuid}`);
        // Ensure vector store is initialized
        await this.ensureInitialized();
        // Delete existing vectors for this race
        await this.vectorStore.deleteByRaceGuid(raceGuid);
        // Get race data
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
            throw new Error(`Race ${raceGuid} not found`);
        }
        const documents = [];
        // 1. Race overview
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
        documents.push({
            id: `${raceGuid}_overview`,
            content: raceOverview,
            embedding: await this.embeddings.embedQuery(raceOverview),
            metadata: { type: 'race_overview', raceGuid },
        });
        // 2. Each horse
        for (const partant of race.partants) {
            const horseContent = `N°${partant.numPartant} - ${partant.horse.nomCheval}
Âge: ${partant.horse.ageCheval} ans
Sexe: ${partant.horse.sexeCheval}
Jockey: ${partant.jockey.nomMonte}
Entraîneur: ${partant.trainer.nomEntraineur}
Musique: ${partant.horse.musique}
Gains carrière: ${partant.horse.gainsCarriere}€
Poids: ${partant.pdsCalcHandPartant}kg
Corde: ${partant.placeCordepartant}`;
            documents.push({
                id: `${raceGuid}_horse_${partant.numPartant}`,
                content: horseContent,
                embedding: await this.embeddings.embedQuery(horseContent),
                metadata: {
                    type: 'horse',
                    raceGuid,
                    horseSlug: partant.horse.slug,
                    numPartant: partant.numPartant,
                },
            });
        }
        // 3. Pronostic
        if (race.pronosticJson) {
            const prono = JSON.parse(race.pronosticJson);
            const pronoContent = `Pronostic Expert:
${prono.chapeau || ''}
Sélections: ${prono.selections?.map((s) => `N°${s.num_partant} ${s.nom_cheval}`).join(', ') || 'N/A'}
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
        // Add all documents to vector store
        await this.vectorStore.addDocuments(documents);
        console.log(`[VECTOR INGESTION] Ingested ${documents.length} documents for race: ${raceGuid}`);
        return documents.length;
    }
    async ingestAllRaces() {
        console.log('[VECTOR INGESTION] Starting bulk ingestion...');
        // Ensure vector store is initialized
        await this.ensureInitialized();
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
            }
            catch (error) {
                console.error(`[VECTOR INGESTION] Failed to ingest ${race.guid}:`, error.message);
            }
        }
        console.log(`[VECTOR INGESTION] Bulk ingestion complete: ${ingested}/${races.length}`);
        return { total: races.length, ingested };
    }
    getVectorStore() {
        return this.vectorStore;
    }
}
exports.VectorStoreIngestionService = VectorStoreIngestionService;
//# sourceMappingURL=VectorStoreIngestionService.js.map
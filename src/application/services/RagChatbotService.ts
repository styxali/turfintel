// RAG Chatbot Service with LangChain
import { PrismaClient } from '@prisma/client';
import { VectorStoreIngestionService } from './VectorStoreIngestionService';
import { DateTime } from 'luxon';

export interface RagChatContext {
  raceGuid?: string;
  horseSlug?: string;
}

export interface RagChatResponse {
  message: string;
  sources?: string[];
  suggestions?: string[];
}

export class RagChatbotService {
  private vectorIngestion: VectorStoreIngestionService;

  constructor(private prisma: PrismaClient) {
    this.vectorIngestion = new VectorStoreIngestionService(prisma);
  }



  async ensureVectorStore(raceGuid: string): Promise<void> {
    console.log(`[CHATBOT] 🔍 Ensuring vector store for race: ${raceGuid}`);
    
    try {
      // Get race-specific vector store
      console.log(`[CHATBOT] 📦 Getting race-specific vector store...`);
      const raceStore = await this.vectorIngestion.getVectorStoreForRace(raceGuid);
      console.log(`[CHATBOT] ✅ Vector store initialized`);
      
      // Check if race is already ingested (check if DB has sufficient data)
      console.log(`[CHATBOT] 🔎 Checking if race is already ingested...`);
      const docs = await raceStore.similaritySearch('test', 1, raceGuid);
      console.log(`[CHATBOT] 📊 Found ${docs.length} existing documents`);
      
      // Get total document count to verify complete ingestion
      const totalDocs = await raceStore.getDocumentCount();
      console.log(`[CHATBOT] 📊 Total documents in store: ${totalDocs}`);
      
      // Re-ingest if no documents or incomplete ingestion (< 5 documents suggests incomplete)
      if (totalDocs === 0 || totalDocs < 5) {
        console.log(`[CHATBOT] 🚀 Starting ingestion for race: ${raceGuid} (${totalDocs} docs found, need more)`);
        // Ingest race into its dedicated vector store
        const count = await this.vectorIngestion.ingestRace(raceGuid);
        console.log(`[CHATBOT] ✅ Ingestion complete: ${count} documents`);
      } else {
        console.log(`[CHATBOT] ✅ Race already ingested with ${totalDocs} documents, using existing data`);
      }
    } catch (error: any) {
      // Race might not exist yet (being created asynchronously)
      console.error(`[CHATBOT] ❌ Error ensuring vector store for ${raceGuid}:`, error.message);
      console.error(`[CHATBOT] 📋 Error stack:`, error.stack);
      // Don't throw - chatbot can still work without vector context
    }
  }

  async chat(
    sessionId: string,
    userMessage: string,
    context: RagChatContext
  ): Promise<RagChatResponse> {
    // Ensure vector store has race data
    if (context.raceGuid) {
      await this.ensureVectorStore(context.raceGuid);
    }

    // Get race-specific vector store
    const raceStore = context.raceGuid 
      ? await this.vectorIngestion.getVectorStoreForRace(context.raceGuid)
      : null;

    // Retrieve relevant documents from race-specific DB
    const relevantDocs = raceStore
      ? await raceStore.similaritySearch(userMessage, 5, context.raceGuid)
      : [];

    // Build context for LLM
    const contextText = relevantDocs.map((doc) => doc.content).join('\n\n');

    // Generate response using context
    const response = await this.generateSimpleResponse(userMessage, contextText, context);

    // Save to session
    await this.saveMessage(sessionId, 'user', userMessage, context);
    await this.saveMessage(sessionId, 'assistant', response.message, context);

    return response;
  }

  private async generateSimpleResponse(
    userMessage: string,
    contextText: string,
    _context: RagChatContext
  ): Promise<RagChatResponse> {
    const msg = userMessage.toLowerCase();

    // Use context to provide smart responses
    const lines = contextText.split('\n');
    const sources: string[] = [];

    // Extract key info from context
    const raceInfo = lines.find((l) => l.startsWith('Course:'));
    const distanceInfo = lines.find((l) => l.startsWith('Distance:'));
    const terrainInfo = lines.find((l) => l.startsWith('Terrain:'));
    const partantsInfo = lines.find((l) => l.startsWith('Nombre de partants:'));

    if (msg.includes('distance')) {
      sources.push('Race overview');
      return {
        message: distanceInfo || 'Distance non disponible',
        sources,
        suggestions: ['Quel est le terrain ?', 'Qui sont les favoris ?', 'Combien de partants ?'],
      };
    }

    if (msg.includes('terrain')) {
      sources.push('Race overview');
      return {
        message: terrainInfo || 'Terrain non disponible',
        sources,
        suggestions: ['Quelle est la distance ?', 'Voir le pronostic', 'Voir les cotes'],
      };
    }

    if (msg.includes('partant') || msg.includes('cheval')) {
      sources.push('Race overview', 'Partants list');
      const horses = lines.filter((l) => l.match(/^N°\d+/));
      return {
        message: `${partantsInfo}\n\nPrincipaux partants:\n${horses.slice(0, 5).join('\n')}`,
        sources,
        suggestions: ['Voir le pronostic', 'Détails sur le N°1', 'Voir les cotes'],
      };
    }

    if (msg.includes('favori') || msg.includes('pronostic')) {
      sources.push('Pronostic expert');
      const pronoLines = lines.filter((l) => l.includes('Sélections:') || l.includes('Base:'));
      return {
        message: pronoLines.join('\n') || 'Pronostic non disponible',
        sources,
        suggestions: ['Détails sur le favori', 'Voir les cotes', 'Voir les notes'],
      };
    }

    if (msg.match(/n°?\s*(\d+)/i)) {
      const num = msg.match(/n°?\s*(\d+)/i)![1];
      const horseInfo = lines.filter((l) => l.startsWith(`N°${num}`));
      sources.push(`Horse N°${num}`);
      return {
        message: horseInfo.join('\n') || `Cheval N°${num} non trouvé`,
        sources,
        suggestions: ['Historique de ce cheval', 'Voir le pronostic', 'Voir les autres'],
      };
    }

    // Default: show race overview
    sources.push('Race overview');
    return {
      message: `${raceInfo}\n${distanceInfo}\n${terrainInfo}\n${partantsInfo}`,
      sources,
      suggestions: ['Qui sont les favoris ?', 'Voir les partants', 'Voir les cotes'],
    };
  }

  private async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    context?: RagChatContext
  ) {
    await this.prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        raceGuid: context?.raceGuid,
        horseSlug: context?.horseSlug,
      },
    });
  }

  async createSession(userId?: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const expiresAt = DateTime.now().plus({ hours: 24 }).toJSDate();

    await this.prisma.chatSession.create({
      data: {
        sessionId,
        userId,
        expiresAt,
      },
    });

    return sessionId;
  }

  async getSession(sessionId: string) {
    return await this.prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 20,
        },
      },
    });
  }

  async updateContext(sessionId: string, context: RagChatContext) {
    await this.prisma.chatSession.update({
      where: { sessionId },
      data: {
        currentRaceGuid: context.raceGuid,
        currentHorseSlug: context.horseSlug,
        lastActivityAt: new Date(),
      },
    });

    // Ensure vector store has race data
    if (context.raceGuid) {
      await this.ensureVectorStore(context.raceGuid);
    }
  }

  async ingestAllRaces() {
    return await this.vectorIngestion.ingestAllRaces();
  }
}

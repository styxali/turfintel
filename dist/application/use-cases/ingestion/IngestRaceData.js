"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestRaceDataUseCase = void 0;
class IngestRaceDataUseCase {
    constructor(equidiaService, raceRepository) {
        this.equidiaService = equidiaService;
        this.raceRepository = raceRepository;
    }
    /**
     * Ingest all data for a single race
     */
    async execute(params) {
        const guid = params.toGuid();
        console.log(`[INGESTION] Starting ingestion for race: ${guid}`);
        try {
            // 1. Fetch race details
            const raceDetails = await this.equidiaService.getCourseDetails(params);
            await this.raceRepository.saveRaceDetails(raceDetails);
            console.log(`[INGESTION] ✓ Saved race details: ${guid}`);
            // 2. Fetch all enrichment data in parallel
            const [pronostic, interviews, notes, tracking, notule, references, pariSimple] = await Promise.allSettled([
                this.equidiaService.getPronostic(params),
                this.equidiaService.getInterview(params),
                this.equidiaService.getNote(params),
                raceDetails.tracked ? this.equidiaService.getTracking(params) : Promise.resolve(null),
                this.equidiaService.getNotule(params),
                this.equidiaService.getReferences(params),
                this.equidiaService.getPariSimple(params)
            ]);
            // 3. Save enrichment data
            const savePromises = [];
            if (pronostic.status === 'fulfilled' && pronostic.value) {
                savePromises.push(this.raceRepository.savePronostic(guid, pronostic.value));
            }
            if (interviews.status === 'fulfilled' && interviews.value) {
                savePromises.push(this.raceRepository.saveInterviews(guid, interviews.value));
            }
            if (notes.status === 'fulfilled' && notes.value) {
                savePromises.push(this.raceRepository.saveNotes(guid, notes.value));
            }
            if (tracking.status === 'fulfilled' && tracking.value) {
                savePromises.push(this.raceRepository.saveTracking(guid, tracking.value));
            }
            if (notule.status === 'fulfilled' && notule.value) {
                savePromises.push(this.raceRepository.saveNotule(guid, notule.value));
            }
            if (references.status === 'fulfilled' && references.value) {
                savePromises.push(this.raceRepository.saveReferences(guid, references.value));
            }
            if (pariSimple.status === 'fulfilled' && pariSimple.value) {
                savePromises.push(this.raceRepository.savePariSimple(guid, pariSimple.value));
            }
            // Wait for all saves to complete
            await Promise.all(savePromises);
            console.log(`[INGESTION] ✓ Completed ingestion for race: ${guid}`);
            return true;
        }
        catch (error) {
            console.error(`[INGESTION] ✗ Failed to ingest race ${guid}:`, error.message);
            return false;
        }
    }
    /**
     * Update dynamic data for existing race (pari-simple, tracking)
     */
    async updateDynamicData(params) {
        const guid = params.toGuid();
        console.log(`[INGESTION] Updating dynamic data for race: ${guid}`);
        try {
            // Only update frequently changing data
            const [pariSimple, tracking] = await Promise.allSettled([
                this.equidiaService.getPariSimple(params),
                this.equidiaService.getTracking(params)
            ]);
            const savePromises = [];
            if (pariSimple.status === 'fulfilled' && pariSimple.value) {
                savePromises.push(this.raceRepository.savePariSimple(guid, pariSimple.value));
            }
            if (tracking.status === 'fulfilled' && tracking.value) {
                savePromises.push(this.raceRepository.saveTracking(guid, tracking.value));
            }
            await Promise.all(savePromises);
            console.log(`[INGESTION] ✓ Updated dynamic data for race: ${guid}`);
            return true;
        }
        catch (error) {
            console.error(`[INGESTION] ✗ Failed to update race ${guid}:`, error.message);
            return false;
        }
    }
}
exports.IngestRaceDataUseCase = IngestRaceDataUseCase;
//# sourceMappingURL=IngestRaceData.js.map
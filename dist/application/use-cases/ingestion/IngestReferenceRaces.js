"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IngestReferenceRacesUseCase = void 0;
// Use Case: Deep Ingest Reference Races with Historical Data
const RaceParams_1 = require("../../../domain/value-objects/RaceParams");
class IngestReferenceRacesUseCase {
    constructor(equidiaService, raceRepository, horseRepository) {
        this.equidiaService = equidiaService;
        this.raceRepository = raceRepository;
        this.horseRepository = horseRepository;
    }
    /**
     * Deep ingest a race with all reference races and horse data
     */
    async execute(params) {
        const guid = params.toGuid();
        console.log(`[DEEP INGESTION] Starting deep ingestion for race: ${guid}`);
        const result = {
            mainRace: false,
            referenceRaces: 0,
            horsesIngested: 0,
        };
        try {
            // 1. Fetch main race details
            const raceDetails = await this.equidiaService.getCourseDetails(params);
            await this.raceRepository.saveRaceDetails(raceDetails);
            result.mainRace = true;
            console.log(`[DEEP INGESTION] ✓ Saved main race: ${guid}`);
            // 2. Ingest all horses from the race
            for (const partant of raceDetails.partants) {
                try {
                    const horseSlug = partant.cheval.slug;
                    // Save basic horse info
                    await this.horseRepository.saveHorse({
                        uuid: partant.cheval.uuid,
                        slug: horseSlug,
                        nomCheval: partant.cheval.nom_cheval,
                        sexeCheval: partant.cheval.sexe_cheval,
                        ageCheval: partant.cheval.age_cheval,
                        musique: partant.cheval.musique || '',
                        gainsCarriere: partant.cheval.gains_carriere || 0,
                    });
                    // Fetch and save horse history
                    const history = await this.equidiaService.getHorseHistory(horseSlug);
                    await this.horseRepository.saveHistory(horseSlug, history);
                    // Fetch and save horse stats
                    const stats = await this.equidiaService.getHorseStats(horseSlug);
                    await this.horseRepository.saveStats(horseSlug, stats);
                    result.horsesIngested++;
                    console.log(`[DEEP INGESTION] ✓ Ingested horse: ${horseSlug}`);
                }
                catch (error) {
                    console.error(`[DEEP INGESTION] Failed to ingest horse:`, error.message);
                }
            }
            // 3. Fetch references (past races)
            const references = await this.equidiaService.getReferences(params);
            await this.raceRepository.saveReferences(guid, references);
            // 4. Ingest each reference race with full data
            if (references.results?.references && references.results.references.length > 0) {
                for (const ref of references.results.references) {
                    try {
                        // Skip if no GUID
                        if (!ref.guid)
                            continue;
                        // Parse reference race GUID
                        const refGuidParts = ref.guid.split('_');
                        if (refGuidParts.length !== 3)
                            continue;
                        const refDate = `${refGuidParts[0].slice(0, 4)}-${refGuidParts[0].slice(4, 6)}-${refGuidParts[0].slice(6, 8)}`;
                        const refReunion = refGuidParts[1];
                        const refCourse = refGuidParts[2];
                        const refParams = new RaceParams_1.RaceParams(refDate, refReunion, refCourse);
                        // Fetch reference race details
                        const refRaceDetails = await this.equidiaService.getCourseDetails(refParams);
                        await this.raceRepository.saveRaceDetails(refRaceDetails);
                        // Try to fetch tracking data (might not be available)
                        try {
                            const tracking = await this.equidiaService.getTracking(refParams);
                            await this.raceRepository.saveTracking(ref.guid, tracking);
                        }
                        catch (error) {
                            // Tracking might not be available for all races
                            console.log(`[DEEP INGESTION] No tracking for ${ref.guid}`);
                        }
                        // Try to fetch notule (race report)
                        try {
                            const notule = await this.equidiaService.getNotule(refParams);
                            await this.raceRepository.saveNotule(ref.guid, notule);
                        }
                        catch (error) {
                            console.log(`[DEEP INGESTION] No notule for ${ref.guid}`);
                        }
                        result.referenceRaces++;
                        console.log(`[DEEP INGESTION] ✓ Ingested reference race: ${ref.guid}`);
                        // Small delay to avoid overwhelming API
                        await this.delay(2000);
                    }
                    catch (error) {
                        console.error(`[DEEP INGESTION] Failed to ingest reference race:`, error.message);
                    }
                }
            }
            console.log(`[DEEP INGESTION] ✓ Completed deep ingestion for ${guid}`);
            console.log(`  - Main race: ${result.mainRace ? 'Yes' : 'No'}`);
            console.log(`  - Reference races: ${result.referenceRaces}`);
            console.log(`  - Horses: ${result.horsesIngested}`);
            return result;
        }
        catch (error) {
            console.error(`[DEEP INGESTION] ✗ Failed deep ingestion for ${guid}:`, error.message);
            throw error;
        }
    }
    delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.IngestReferenceRacesUseCase = IngestReferenceRacesUseCase;
//# sourceMappingURL=IngestReferenceRaces.js.map
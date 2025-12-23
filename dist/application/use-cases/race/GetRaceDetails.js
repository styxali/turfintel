"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRaceDetailsUseCase = void 0;
class GetRaceDetailsUseCase {
    constructor(equidiaService, cacheManager, raceRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.raceRepository = raceRepository;
    }
    async execute(params, enrich = true) {
        const cacheKey = `race:details:${params.toGuid()}:${enrich}`;
        const guid = params.toGuid();
        // Try cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) {
            return cached;
        }
        // Try database second
        const dbRace = await this.raceRepository.findByGuid(guid);
        if (dbRace?.raceDetails) {
            const dbDetails = dbRace.raceDetails;
            // If enrichment requested and we have enriched data in DB
            if (enrich && (dbRace.pronostic || dbRace.interviews || dbRace.notes)) {
                const enrichedFromDb = {
                    ...dbDetails,
                    pronostic: dbRace.pronostic,
                    interviews: dbRace.interviews,
                    notes: dbRace.notes,
                    tracking: dbRace.tracking,
                    notule: dbRace.notule,
                    references: dbRace.references,
                    pariSimple: dbRace.pariSimple
                };
                await this.cacheManager.set(cacheKey, enrichedFromDb, 30);
                return enrichedFromDb;
            }
            // Return basic details from DB if no enrichment needed
            if (!enrich) {
                await this.cacheManager.set(cacheKey, dbDetails, 30);
                return dbDetails;
            }
        }
        // Fetch race details from API
        const raceDetails = await this.equidiaService.getCourseDetails(params);
        // Save race details to database (async, don't wait)
        this.raceRepository.saveRaceDetails(raceDetails).catch(err => {
            console.error('[USE CASE] Failed to save race details:', err.message);
        });
        // Enrich with additional data if requested
        let enrichedData = raceDetails;
        if (enrich) {
            enrichedData = await this.enrichRaceData(params, raceDetails);
        }
        // Cache the result (30 minutes for race details)
        await this.cacheManager.set(cacheKey, enrichedData, 30);
        return enrichedData;
    }
    async enrichRaceData(params, raceDetails) {
        const guid = params.toGuid();
        // Fetch all enrichment data in parallel
        const [pronostic, interviews, notes, tracking, notule, references, pariSimple] = await Promise.allSettled([
            this.equidiaService.getPronostic(params),
            this.equidiaService.getInterview(params),
            this.equidiaService.getNote(params),
            raceDetails.tracked ? this.equidiaService.getTracking(params) : Promise.resolve(undefined),
            this.equidiaService.getNotule(params),
            this.equidiaService.getReferences(params),
            this.equidiaService.getPariSimple(params)
        ]);
        // Save enrichment data to database (async, don't wait)
        if (pronostic.status === 'fulfilled' && pronostic.value) {
            this.raceRepository.savePronostic(guid, pronostic.value).catch(err => {
                console.error('[USE CASE] Failed to save pronostic:', err.message);
            });
        }
        if (interviews.status === 'fulfilled' && interviews.value) {
            this.raceRepository.saveInterviews(guid, interviews.value).catch(err => {
                console.error('[USE CASE] Failed to save interviews:', err.message);
            });
        }
        if (notes.status === 'fulfilled' && notes.value) {
            this.raceRepository.saveNotes(guid, notes.value).catch(err => {
                console.error('[USE CASE] Failed to save notes:', err.message);
            });
        }
        if (tracking.status === 'fulfilled' && tracking.value) {
            this.raceRepository.saveTracking(guid, tracking.value).catch(err => {
                console.error('[USE CASE] Failed to save tracking:', err.message);
            });
        }
        if (notule.status === 'fulfilled' && notule.value) {
            this.raceRepository.saveNotule(guid, notule.value).catch(err => {
                console.error('[USE CASE] Failed to save notule:', err.message);
            });
        }
        if (references.status === 'fulfilled' && references.value) {
            this.raceRepository.saveReferences(guid, references.value).catch(err => {
                console.error('[USE CASE] Failed to save references:', err.message);
            });
        }
        if (pariSimple.status === 'fulfilled' && pariSimple.value) {
            this.raceRepository.savePariSimple(guid, pariSimple.value).catch(err => {
                console.error('[USE CASE] Failed to save pari simple:', err.message);
            });
        }
        return {
            ...raceDetails,
            pronostic: pronostic.status === 'fulfilled' ? pronostic.value : undefined,
            interviews: interviews.status === 'fulfilled' ? interviews.value : undefined,
            notes: notes.status === 'fulfilled' ? notes.value : undefined,
            tracking: tracking.status === 'fulfilled' ? tracking.value : undefined,
            notule: notule.status === 'fulfilled' ? notule.value : undefined,
            references: references.status === 'fulfilled' ? references.value : undefined,
            pariSimple: pariSimple.status === 'fulfilled' ? pariSimple.value : undefined
        };
    }
}
exports.GetRaceDetailsUseCase = GetRaceDetailsUseCase;
//# sourceMappingURL=GetRaceDetails.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNoteUseCase = void 0;
class GetNoteUseCase {
    constructor(equidiaService, cacheManager, raceRepository) {
        this.equidiaService = equidiaService;
        this.cacheManager = cacheManager;
        this.raceRepository = raceRepository;
    }
    async execute(params) {
        const cacheKey = `race:note:${params.toGuid()}`;
        const guid = params.toGuid();
        // Try cache first
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        // Try database second
        const dbRace = await this.raceRepository.findByGuid(guid);
        if (dbRace?.notes) {
            const dbNote = dbRace.notes;
            await this.cacheManager.set(cacheKey, dbNote, 30);
            return dbNote;
        }
        // Fetch from API
        const note = await this.equidiaService.getNote(params);
        // Save to database (async, don't wait)
        this.raceRepository.saveNotes(guid, note).catch(err => {
            console.error('[USE CASE] Failed to save note:', err.message);
        });
        // Cache the result
        await this.cacheManager.set(cacheKey, note, 30);
        return note;
    }
}
exports.GetNoteUseCase = GetNoteUseCase;
//# sourceMappingURL=GetNote.js.map
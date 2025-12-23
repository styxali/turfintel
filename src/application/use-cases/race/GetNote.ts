import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import { IRaceRepository } from '../../../domain/interfaces/IRaceRepository';
import * as Types from '../../../shared/types/types';

export class GetNoteUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager,
    private raceRepository: IRaceRepository
  ) {}

  async execute(params: RaceParams): Promise<Types.NoteResponse> {
    const cacheKey = `race:note:${params.toGuid()}`;
    const guid = params.toGuid();

    // Try cache first
    const cached = await this.cacheManager.get<Types.NoteResponse>(cacheKey);
    if (cached) return cached;

    // Try database second
    const dbRace = await this.raceRepository.findByGuid(guid);
    if (dbRace?.notes) {
      const dbNote = dbRace.notes as Types.NoteResponse;
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

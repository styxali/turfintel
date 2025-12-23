import { RaceParams } from '../../../domain/value-objects/RaceParams';
import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import * as Types from '../../../shared/types/types';

export class GetRapportsUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager
  ) {}

  async execute(params: RaceParams): Promise<Types.RapportResponse> {
    const cacheKey = `race:rapports:${params.toGuid()}`;

    const cached = await this.cacheManager.get<Types.RapportResponse>(cacheKey);
    if (cached) return cached;

    const rapports = await this.equidiaService.getRapports(params);
    await this.cacheManager.set(cacheKey, rapports, 60); // Cache longer (1 hour)

    return rapports;
  }
}

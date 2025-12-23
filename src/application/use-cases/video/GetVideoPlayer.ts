import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import * as Types from '../../../shared/types/types';

export class GetVideoPlayerUseCase {
  constructor(
    private equidiaService: IEquidiaService,
    private cacheManager: ICacheManager
  ) {}

  async execute(videoId: string): Promise<Types.VideoPlayerResponse> {
    const cacheKey = `video:player:${videoId}`;

    const cached = await this.cacheManager.get<Types.VideoPlayerResponse>(cacheKey);
    if (cached) return cached;

    const videoPlayer = await this.equidiaService.getVideoPlayer(videoId);
    await this.cacheManager.set(cacheKey, videoPlayer, 120); // Cache for 2 hours

    return videoPlayer;
  }
}

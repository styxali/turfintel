import { IEquidiaService } from '../../../domain/interfaces/IEquidiaService';
import { ICacheManager } from '../../../domain/interfaces/ICacheManager';
import * as Types from '../../../shared/types/types';
export declare class GetVideoPlayerUseCase {
    private equidiaService;
    private cacheManager;
    constructor(equidiaService: IEquidiaService, cacheManager: ICacheManager);
    execute(videoId: string): Promise<Types.VideoPlayerResponse>;
}
//# sourceMappingURL=GetVideoPlayer.d.ts.map
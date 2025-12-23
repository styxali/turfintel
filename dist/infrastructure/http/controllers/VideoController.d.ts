import { Request, Response, NextFunction } from 'express';
import { GetVideoPlayerUseCase } from '../../../application/use-cases/video/GetVideoPlayer';
export declare class VideoController {
    private getVideoPlayerUseCase;
    constructor(getVideoPlayerUseCase: GetVideoPlayerUseCase);
    getVideoPlayer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=VideoController.d.ts.map
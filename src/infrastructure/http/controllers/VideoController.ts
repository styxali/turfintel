import { Request, Response, NextFunction } from 'express';
import { GetVideoPlayerUseCase } from '../../../application/use-cases/video/GetVideoPlayer';

export class VideoController {
  constructor(
    private getVideoPlayerUseCase: GetVideoPlayerUseCase
  ) {}

  getVideoPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { videoId } = req.params;
      const videoPlayer = await this.getVideoPlayerUseCase.execute(videoId);

      res.setHeader('X-Cache-Key', `video:player:${videoId}`);
      res.json(videoPlayer);
    } catch (error) {
      next(error);
    }
  };
}

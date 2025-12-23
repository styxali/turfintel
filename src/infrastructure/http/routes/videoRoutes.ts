import { Router } from 'express';
import { VideoController } from '../controllers/VideoController';

export function createVideoRoutes(videoController: VideoController): Router {
  const router = Router();

  // Get video player info
  router.get('/video-player/:videoId', videoController.getVideoPlayer);

  return router;
}

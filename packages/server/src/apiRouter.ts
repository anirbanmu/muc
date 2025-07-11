import express, { Request, Response, NextFunction } from 'express';
import { BackendMediaService, SpotifyNormalizedTrack, YoutubeNormalizedTrack } from '@muc/common';

interface UriRequestBody {
  uri: string;
}

interface QueryRequestBody {
  query: string;
}

export class ApiRouter {
  private readonly router = express.Router();

  constructor(private readonly mediaService: BackendMediaService) {
    this.initializeRoutes();
  }

  public getRouter(): express.Router {
    return this.router;
  }

  private initializeRoutes(): void {
    // Wraps async route handlers to ensure that any uncaught errors within them are
    // properly passed to the Express error-handling middleware.
    const asyncHandler =
      (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
      (req: Request, res: Response, next: NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next);

    // expecting JSON
    this.router.post('/spotify/track', asyncHandler(this.getSpotifyTrackDetails));
    this.router.post('/spotify/search', asyncHandler(this.searchSpotifyTracks));
    this.router.post('/youtube/video', asyncHandler(this.getYoutubeVideoDetails));
    this.router.post('/youtube/search', asyncHandler(this.searchYoutubeVideos));
  }

  private getSpotifyTrackDetails = async (
    req: Request<any, any, UriRequestBody>,
    res: Response<SpotifyNormalizedTrack | { message: string }>,
  ) => {
    const { uri } = req.body;
    if (!uri) {
      res.status(400).json({ message: 'Request body must contain a "uri" field.' });
      return;
    }
    try {
      const track = await this.mediaService.getSpotifyTrackDetails(uri);
      if (!track) {
        res.status(404).json({ message: 'Spotify track not found or URI invalid.' });
        return;
      }
      res.json(track);
    } catch (error) {
      console.error(
        'Error fetching Spotify track details:',
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({ message: 'Failed to retrieve Spotify track details.' });
    }
  };

  private searchSpotifyTracks = async (
    req: Request<any, any, QueryRequestBody>,
    res: Response<SpotifyNormalizedTrack[] | { message: string }>,
  ) => {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ message: 'Request body must contain a "query" field.' });
      return;
    }
    try {
      const track = await this.mediaService.searchSpotifyTracks(query);
      res.json(track ? [track] : []);
    } catch (error) {
      console.error(
        'Error searching Spotify tracks:',
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({ message: 'Failed to search Spotify tracks.' });
    }
  };

  private getYoutubeVideoDetails = async (
    req: Request<any, any, UriRequestBody>,
    res: Response<YoutubeNormalizedTrack | { message: string }>,
  ) => {
    const { uri } = req.body;
    if (!uri) {
      res.status(400).json({ message: 'Request body must contain a "uri" field.' });
      return;
    }
    try {
      const video = await this.mediaService.getYoutubeVideoDetails(uri);
      if (!video) {
        res.status(404).json({ message: 'YouTube video not found or URI invalid.' });
        return;
      }
      res.json(video);
    } catch (error) {
      console.error(
        'Error fetching YouTube video details:',
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({ message: 'Failed to retrieve YouTube video details.' });
    }
  };

  private searchYoutubeVideos = async (
    req: Request<any, any, QueryRequestBody>,
    res: Response<YoutubeNormalizedTrack[] | { message: string }>,
  ) => {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ message: 'Request body must contain a "query" field.' });
      return;
    }
    try {
      const video = await this.mediaService.searchYoutubeVideos(query);
      res.json(video ? [video] : []);
    } catch (error) {
      console.error(
        'Error searching YouTube videos:',
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({ message: 'Failed to search YouTube videos.' });
    }
  };
}

import express, { Request, Response, NextFunction } from 'express';
import {
  API_ROUTES,
  BackendMediaService,
  ErrorResponse,
  UriRequestBody,
  SearchResponse,
  TrackIdentifier,
} from '@muc/common';

export class ApiRouter {
  private readonly router = express.Router();

  constructor(private readonly mediaServicePromise: Promise<BackendMediaService>) {
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

    this.router.post(`/${API_ROUTES.search}`, asyncHandler(this.search));
  }

  private search = async (req: Request, res: Response<SearchResponse | ErrorResponse>) => {
    const { uri } = req.body as UriRequestBody;
    if (!uri) {
      res.status(400).json({ message: 'Request body must contain a "uri" field.' });
      return;
    }

    try {
      const mediaService = await this.mediaServicePromise;

      // Get the source track details - if this fails, return error
      const sourceTrack = await mediaService.getTrackDetails(uri);
      const trackIdentifier = TrackIdentifier.fromNormalizedTrack(sourceTrack);

      // Start with source track in results
      const results = [sourceTrack];

      // Search other platforms - if individual platforms fail, log but continue
      try {
        const otherPlatformTracks = await mediaService.searchOtherPlatforms(sourceTrack);
        results.push(...otherPlatformTracks);
      } catch (error) {
        console.error('Some platform searches failed:', error instanceof Error ? error.message : error);
        // Continue with just the source track
      }

      res.json({
        results,
        sourceTrack: trackIdentifier.toData(),
      });
    } catch (error) {
      console.error('Failed to get source track details:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to retrieve track details from the provided URI.' });
    }
  };
}

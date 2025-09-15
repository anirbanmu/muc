import express, { Request, Response, NextFunction } from 'express';
import {
  API_ROUTES,
  BackendMediaService,
  ErrorResponse,
  GetSpotifyTrackDetailsResponse,
  GetYoutubeVideoDetailsResponse,
  GetItunesTrackDetailsResponse,
  GetDeezerTrackDetailsResponse,
  QueryRequestBody,
  SearchSpotifyTracksResponse,
  SearchYoutubeVideosResponse,
  SearchItunesTracksResponse,
  SearchDeezerTracksResponse,
  UriRequestBody,
  SearchResponse,
  TrackIdentifier,
} from '@muc/common';
import pLimit from 'p-limit';

export class ApiRouter {
  private readonly router = express.Router();
  private readonly spotifyLimiter = pLimit(10);
  private readonly youtubeLimiter = pLimit(10);
  private readonly itunesLimiter = pLimit(10);
  private readonly deezerLimiter = pLimit(10);

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

    this.router.post(`/${API_ROUTES.spotify.track}`, asyncHandler(this.getSpotifyTrackDetails));
    this.router.post(`/${API_ROUTES.spotify.search}`, asyncHandler(this.searchSpotifyTracks));
    this.router.post(`/${API_ROUTES.youtube.video}`, asyncHandler(this.getYoutubeVideoDetails));
    this.router.post(`/${API_ROUTES.youtube.search}`, asyncHandler(this.searchYoutubeVideos));
    this.router.post(`/${API_ROUTES.itunes.track}`, asyncHandler(this.getItunesTrackDetails));
    this.router.post(`/${API_ROUTES.itunes.search}`, asyncHandler(this.searchItunesTracks));
    this.router.post(`/${API_ROUTES.deezer.track}`, asyncHandler(this.getDeezerTrackDetails));
    this.router.post(`/${API_ROUTES.deezer.search}`, asyncHandler(this.searchDeezerTracks));
    this.router.post(`/${API_ROUTES.search}`, asyncHandler(this.search));
  }

  private getSpotifyTrackDetails = async (
    req: Request,
    res: Response<GetSpotifyTrackDetailsResponse | ErrorResponse>,
  ) => {
    const { uri } = req.body as UriRequestBody;
    if (!uri) {
      res.status(400).json({ message: 'Request body must contain a "uri" field.' });
      return;
    }

    try {
      const mediaService = await this.mediaServicePromise;
      const track = await this.spotifyLimiter(() => mediaService.getSpotifyTrackDetails(uri));
      if (!track) {
        res.status(404).json({ message: 'Spotify track not found or URI invalid.' });
        return;
      }
      res.json(track);
    } catch (error) {
      console.error('Error fetching Spotify track details:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to retrieve Spotify track details.' });
    }
  };

  private searchSpotifyTracks = async (req: Request, res: Response<SearchSpotifyTracksResponse | ErrorResponse>) => {
    const { query } = req.body as QueryRequestBody;
    if (!query) {
      res.status(400).json({ message: 'Request body must contain a "query" field.' });
      return;
    }

    try {
      const mediaService = await this.mediaServicePromise;
      const track = await this.spotifyLimiter(() => mediaService.searchSpotifyTracks(query));
      res.json(track ? [track] : []);
    } catch (error) {
      console.error('Error searching Spotify tracks:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to search Spotify tracks.' });
    }
  };

  private getYoutubeVideoDetails = async (
    req: Request,
    res: Response<GetYoutubeVideoDetailsResponse | ErrorResponse>,
  ) => {
    const { uri } = req.body as UriRequestBody;
    if (!uri) {
      res.status(400).json({ message: 'Request body must contain a "uri" field.' });
      return;
    }

    try {
      const mediaService = await this.mediaServicePromise;
      const video = await this.youtubeLimiter(() => mediaService.getYoutubeVideoDetails(uri));
      if (!video) {
        res.status(404).json({ message: 'YouTube video not found or URI invalid.' });
        return;
      }
      res.json(video);
    } catch (error) {
      console.error('Error fetching YouTube video details:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to retrieve YouTube video details.' });
    }
  };

  private searchYoutubeVideos = async (req: Request, res: Response<SearchYoutubeVideosResponse | ErrorResponse>) => {
    const { query } = req.body as QueryRequestBody;
    if (!query) {
      res.status(400).json({ message: 'Request body must contain a "query" field.' });
      return;
    }

    try {
      const mediaService = await this.mediaServicePromise;
      const video = await this.youtubeLimiter(() => mediaService.searchYoutubeVideos(query));
      res.json(video ? [video] : []);
    } catch (error) {
      console.error('Error searching YouTube videos:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to search YouTube videos.' });
    }
  };

  private getItunesTrackDetails = async (
    req: Request,
    res: Response<GetItunesTrackDetailsResponse | ErrorResponse>,
  ) => {
    const { uri } = req.body as UriRequestBody;
    if (!uri) {
      res.status(400).json({ message: 'Request body must contain a "uri" field.' });
      return;
    }

    try {
      const mediaService = await this.mediaServicePromise;
      const track = await this.itunesLimiter(() => mediaService.getItunesTrackDetails(uri));
      if (!track) {
        res.status(404).json({ message: 'iTunes track not found or URI invalid.' });
        return;
      }
      res.json(track);
    } catch (error) {
      console.error('Error fetching iTunes track details:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to retrieve iTunes track details.' });
    }
  };

  private searchItunesTracks = async (req: Request, res: Response<SearchItunesTracksResponse | ErrorResponse>) => {
    const { query } = req.body as QueryRequestBody;
    if (!query) {
      res.status(400).json({ message: 'Request body must contain a "query" field.' });
      return;
    }

    try {
      const mediaService = await this.mediaServicePromise;
      const track = await this.itunesLimiter(() => mediaService.searchItunesTracks(query));
      res.json(track ? [track] : []);
    } catch (error) {
      console.error('Error searching iTunes tracks:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to search iTunes tracks.' });
    }
  };

  private getDeezerTrackDetails = async (
    req: Request,
    res: Response<GetDeezerTrackDetailsResponse | ErrorResponse>,
  ) => {
    const { uri } = req.body as UriRequestBody;
    if (!uri) {
      res.status(400).json({ message: 'Request body must contain a "uri" field.' });
      return;
    }

    try {
      const mediaService = await this.mediaServicePromise;
      const track = await this.deezerLimiter(() => mediaService.getDeezerTrackDetails(uri));
      if (!track) {
        res.status(404).json({ message: 'Deezer track not found or URI invalid.' });
        return;
      }
      res.json(track);
    } catch (error) {
      console.error('Error fetching Deezer track details:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to retrieve Deezer track details.' });
    }
  };

  private searchDeezerTracks = async (req: Request, res: Response<SearchDeezerTracksResponse | ErrorResponse>) => {
    const { query } = req.body as QueryRequestBody;
    if (!query) {
      res.status(400).json({ message: 'Request body must contain a "query" field.' });
      return;
    }

    try {
      const mediaService = await this.mediaServicePromise;
      const track = await this.deezerLimiter(() => mediaService.searchDeezerTracks(query));
      res.json(track ? [track] : []);
    } catch (error) {
      console.error('Error searching Deezer tracks:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to search Deezer tracks.' });
    }
  };

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

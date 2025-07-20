import express, { Request, Response, NextFunction } from 'express';
import {
  API_ROUTES,
  BackendMediaService,
  ErrorResponse,
  GetSpotifyTrackDetailsResponse,
  GetYoutubeVideoDetailsResponse,
  QueryRequestBody,
  SearchSpotifyTracksResponse,
  SearchYoutubeVideosResponse,
  SpotifyNormalizedTrack,
  UriRequestBody,
  YoutubeNormalizedTrack,
} from '@muc/common';
import NodeCache from 'node-cache';
import pLimit from 'p-limit';

export class ApiRouter {
  private readonly router = express.Router();
  private readonly cache: NodeCache;
  private readonly spotifyLimiter = pLimit(10);
  private readonly youtubeLimiter = pLimit(10);

  constructor(private readonly mediaService: BackendMediaService) {
    this.cache = new NodeCache({ stdTTL: 3600, checkperiod: 600, useClones: false });
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
    this.router.post(API_ROUTES.spotify.track, asyncHandler(this.getSpotifyTrackDetails));
    this.router.post(API_ROUTES.spotify.search, asyncHandler(this.searchSpotifyTracks));
    this.router.post(API_ROUTES.youtube.video, asyncHandler(this.getYoutubeVideoDetails));
    this.router.post(API_ROUTES.youtube.search, asyncHandler(this.searchYoutubeVideos));
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

    const cacheKey = `spotify:track:${uri}`;
    const cachedTrack = this.cache.get<SpotifyNormalizedTrack>(cacheKey);
    if (cachedTrack) {
      res.json(cachedTrack);
      return;
    }

    try {
      const track = await this.spotifyLimiter(() => this.mediaService.getSpotifyTrackDetails(uri));
      if (!track) {
        res.status(404).json({ message: 'Spotify track not found or URI invalid.' });
        return;
      }
      this.cache.set(cacheKey, track);
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

    const cacheKey = `spotify:search:${query}`;
    if (this.cache.has(cacheKey)) {
      const cachedTrack = this.cache.get<SpotifyNormalizedTrack | null>(cacheKey);
      res.json(cachedTrack ? [cachedTrack] : []);
      return;
    }

    try {
      const track = await this.spotifyLimiter(() => this.mediaService.searchSpotifyTracks(query));
      this.cache.set(cacheKey, track);
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

    const cacheKey = `youtube:video:${uri}`;
    const cachedVideo = this.cache.get<YoutubeNormalizedTrack>(cacheKey);
    if (cachedVideo) {
      res.json(cachedVideo);
      return;
    }

    try {
      const video = await this.youtubeLimiter(() => this.mediaService.getYoutubeVideoDetails(uri));
      if (!video) {
        res.status(404).json({ message: 'YouTube video not found or URI invalid.' });
        return;
      }
      this.cache.set(cacheKey, video);
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

    const cacheKey = `youtube:search:${query}`;
    if (this.cache.has(cacheKey)) {
      const cachedVideo = this.cache.get<YoutubeNormalizedTrack | null>(cacheKey);
      res.json(cachedVideo ? [cachedVideo] : []);
      return;
    }

    try {
      const video = await this.youtubeLimiter(() => this.mediaService.searchYoutubeVideos(query));
      this.cache.set(cacheKey, video);
      res.json(video ? [video] : []);
    } catch (error) {
      console.error('Error searching YouTube videos:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to search YouTube videos.' });
    }
  };
}

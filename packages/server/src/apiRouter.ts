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
import pLimit from 'p-limit';
import { CacheWrapper } from './cacheWrapper.js';

export class ApiRouter {
  private readonly router = express.Router();
  private readonly cacheWrapper = new CacheWrapper({ stdTTL: 3600, checkperiod: 600, useClones: false });
  private readonly spotifyLimiter = pLimit(10);
  private readonly youtubeLimiter = pLimit(10);

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

    const cache = this.cacheWrapper.getAccessor<SpotifyNormalizedTrack>('spotify:track');
    const cachedTrack = cache.get(uri);
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
      cache.set(uri, track);
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

    const cache = this.cacheWrapper.getAccessor<SpotifyNormalizedTrack | null>('spotify:search');
    if (cache.has(query)) {
      const cachedTrack = cache.get(query);
      res.json(cachedTrack ? [cachedTrack] : []);
      return;
    }

    try {
      const track = await this.spotifyLimiter(() => this.mediaService.searchSpotifyTracks(query));
      cache.set(query, track);
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

    const cache = this.cacheWrapper.getAccessor<YoutubeNormalizedTrack>('youtube:video');
    const cachedVideo = cache.get(uri);
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
      cache.set(uri, video);
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

    const cache = this.cacheWrapper.getAccessor<YoutubeNormalizedTrack | null>('youtube:search');
    if (cache.has(query)) {
      const cachedVideo = cache.get(query);
      res.json(cachedVideo ? [cachedVideo] : []);
      return;
    }

    try {
      const video = await this.youtubeLimiter(() => this.mediaService.searchYoutubeVideos(query));
      cache.set(query, video);
      res.json(video ? [video] : []);
    } catch (error) {
      console.error('Error searching YouTube videos:', error instanceof Error ? error.message : error);
      res.status(500).json({ message: 'Failed to search YouTube videos.' });
    }
  };
}

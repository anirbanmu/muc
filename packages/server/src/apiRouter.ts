import { Hono, type Context } from 'hono';
import {
  API_ROUTES,
  BackendMediaService,
  UriRequestBody,
  TrackIdentifier,
  SearchResponse,
  MediaService,
} from '@muc/common';
import { getLogger } from './logger.js';

type Variables = {
  requestId: string;
};

export class ApiRouter {
  private readonly router = new Hono<{ Variables: Variables }>();
  private readonly pendingSearches = new Map<string, Promise<SearchResponse>>();

  constructor(private readonly mediaServicePromise: Promise<BackendMediaService>) {
    this.initializeRoutes();
  }

  public getRouter(): Hono<{ Variables: Variables }> {
    return this.router;
  }

  private initializeRoutes(): void {
    this.router.post(`/${API_ROUTES.search}`, this.search);
  }

  private search = async (c: Context<{ Variables: Variables }>) => {
    try {
      const body = (await c.req.json()) as UriRequestBody;
      const { uri } = body;

      if (!uri) {
        return c.json(
          {
            message: 'Request body must contain a "uri" field.',
          },
          400,
        );
      }

      const trimmedUri = uri.trim();
      const requestId = c.get('requestId') as string;

      // Validate URI format before processing
      if (!MediaService.classifyUri(trimmedUri)) {
        return c.json(
          {
            message:
              'Invalid or unsupported URI format. Please provide a valid Spotify, YouTube, Apple Music, or Deezer link.',
          },
          400,
        );
      }

      // Check if there's already a pending search for this URI
      let searchPromise = this.pendingSearches.get(trimmedUri);

      if (!searchPromise) {
        getLogger().app(`  ↳ Starting search [${requestId}]`);
        // Create new search promise and store it
        searchPromise = this.performSearch(trimmedUri).finally(() => {
          getLogger().app(`  ↳ Completed search [${requestId}]`);
          this.pendingSearches.delete(trimmedUri);
        });
        this.pendingSearches.set(trimmedUri, searchPromise);
      } else {
        getLogger().app(`  ↳ Reusing ongoing search [${requestId}]`);
      }

      const result = await searchPromise;
      return c.json(result);
    } catch (error) {
      getLogger().error('Failed to get source track details:', error instanceof Error ? error.message : error);
      return c.json(
        {
          message: 'Failed to retrieve track details from the provided URI.',
        },
        500,
      );
    }
  };

  private async performSearch(uri: string): Promise<SearchResponse> {
    const mediaService = await this.mediaServicePromise;

    const sourceTrack = await mediaService.getTrackDetails(uri);
    const trackIdentifier = TrackIdentifier.fromNormalizedTrack(sourceTrack);

    const results = [sourceTrack];

    try {
      const otherPlatformTracks = await mediaService.searchOtherPlatforms(sourceTrack);
      results.push(...otherPlatformTracks);
    } catch (error) {
      getLogger().error('Some platform searches failed:', error instanceof Error ? error.message : error);
    }

    return {
      results,
      sourceTrack: trackIdentifier.toData(),
    };
  }
}

import { Hono, type Context } from 'hono';
import { API_ROUTES, BackendMediaService, UriRequestBody, TrackIdentifier } from '@muc/common';

export class ApiRouter {
  private readonly router = new Hono();

  constructor(private readonly mediaServicePromise: Promise<BackendMediaService>) {
    this.initializeRoutes();
  }

  public getRouter(): Hono {
    return this.router;
  }

  private initializeRoutes(): void {
    this.router.post(`/${API_ROUTES.search}`, this.search);
  }

  private search = async (c: Context) => {
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

      const mediaService = await this.mediaServicePromise;

      const sourceTrack = await mediaService.getTrackDetails(uri);
      const trackIdentifier = TrackIdentifier.fromNormalizedTrack(sourceTrack);

      const results = [sourceTrack];

      try {
        const otherPlatformTracks = await mediaService.searchOtherPlatforms(sourceTrack);
        results.push(...otherPlatformTracks);
      } catch (error) {
        console.error('Some platform searches failed:', error instanceof Error ? error.message : error);
      }

      return c.json({
        results,
        sourceTrack: trackIdentifier.toData(),
      });
    } catch (error) {
      console.error('Failed to get source track details:', error instanceof Error ? error.message : error);
      return c.json(
        {
          message: 'Failed to retrieve track details from the provided URI.',
        },
        500,
      );
    }
  };
}

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { BackendMediaService } from '@muc/common';

const app = express();
const port = process.env.PORT || 3000;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CLIENT_DIST_PATH =
  process.env.CLIENT_DIST_PATH || path.resolve(__dirname, '../../client/dist');

app.use(helmet());
app.use(compression());
app.use(express.json());

let corsOptions: cors.CorsOptions;
if (process.env.NODE_ENV === 'development') {
  // In development, explicitly allow common localhost origins for client dev server.
  // This covers scenarios where the client app runs on a different port (e.g., Vite dev server).
  corsOptions = {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
    ],
  };
  console.log('CORS (Development) allowing:', corsOptions.origin);
} else {
  // In production, enforce same-origin policy by allowing requests with no Origin header
  // and explicitly denying requests with an Origin header (which would be cross-origin).
  corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (e.g., same-origin requests from the browser).
      if (!origin) {
        callback(null, true);
      } else {
        // Deny cross-origin requests in production.
        callback(new Error('Cross-origin requests are not allowed.'), false);
      }
    },
  };
  console.log('CORS (Production) configured to allow same-origin requests only.');
}
app.use(cors(corsOptions));

app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Enforce JSON content type for POST requests to API endpoints.
app.use('/api/', (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    res.status(415).json({
      message: 'Content-Type must be application/json for POST requests to this endpoint.',
    });
    return;
  }
  next();
});

// Request body interfaces for type safety.
interface UriRequestBody {
  uri: string;
}

interface QueryRequestBody {
  query: string;
}

// Initialize BackendMediaService with API credentials from environment variables.
// This service handles all interactions with external media APIs.
let mediaService: BackendMediaService;
try {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.warn(
      'Spotify API credentials not fully configured. Spotify features might be unavailable.',
    );
  }
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured. YouTube features might be unavailable.');
  }

  mediaService = new BackendMediaService(
    SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET
      ? { clientId: SPOTIFY_CLIENT_ID, clientSecret: SPOTIFY_CLIENT_SECRET }
      : undefined,
    YOUTUBE_API_KEY,
  );
} catch (error) {
  console.error('Failed to initialize BackendMediaService:', error);
  process.exit(1); // Exit if the media service, which is critical, cannot be initialized.
}

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// --- API Routes (Accepting POST requests with JSON bodies) ---

// POST /api/spotify/track - Fetches Spotify track details by URI from request body.
app.post(
  '/api/spotify/track',
  asyncHandler(async (req: Request<any, any, UriRequestBody>, res: Response) => {
    const { uri } = req.body;
    if (!uri) {
      res.status(400).json({ message: 'Request body must contain a "uri" field.' });
      return;
    }
    try {
      const track = await mediaService.getSpotifyTrackDetails(uri);
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
  }),
);

// POST /api/spotify/search - Searches for Spotify tracks by query from request body.
app.post(
  '/api/spotify/search',
  asyncHandler(async (req: Request<any, any, QueryRequestBody>, res: Response) => {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ message: 'Request body must contain a "query" field.' });
      return;
    }
    try {
      const track = await mediaService.searchSpotifyTracks(query);
      // Always return an array; empty if no track, single-element array if found.
      res.json(track ? [track] : []);
    } catch (error) {
      console.error(
        'Error searching Spotify tracks:',
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({ message: 'Failed to search Spotify tracks.' });
    }
  }),
);

// POST /api/youtube/video - Fetches YouTube video details by URI from request body.
app.post(
  '/api/youtube/video',
  asyncHandler(async (req: Request<any, any, UriRequestBody>, res: Response) => {
    const { uri } = req.body;
    if (!uri) {
      res.status(400).json({ message: 'Request body must contain a "uri" field.' });
      return;
    }
    try {
      const video = await mediaService.getYoutubeVideoDetails(uri);
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
  }),
);

// POST /api/youtube/search - Searches for YouTube videos by query from request body.
app.post(
  '/api/youtube/search',
  asyncHandler(async (req: Request<any, any, QueryRequestBody>, res: Response) => {
    const { query } = req.body;
    if (!query) {
      res.status(400).json({ message: 'Request body must contain a "query" field.' });
      return;
    }
    try {
      const video = await mediaService.searchYoutubeVideos(query);
      // Always return an array; empty if no video, single-element array if found.
      res.json(video ? [video] : []);
    } catch (error) {
      console.error(
        'Error searching YouTube videos:',
        error instanceof Error ? error.message : error,
      );
      res.status(500).json({ message: 'Failed to search YouTube videos.' });
    }
  }),
);

app.use(express.static(CLIENT_DIST_PATH));

// For all other GET requests not handled by API or static routes, serve the client's index.html
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(CLIENT_DIST_PATH, 'index.html'));
});

// Centralized error handling middleware.
// Catches errors passed from async handlers or other middleware.
// Parameters are typed with `_` prefix to indicate they are unused in this specific handler, improving readability.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err instanceof Error ? err.message : err);
  res.status(500).json({ message: 'An unexpected internal server error occurred.' });
});

app.listen(port, () => {
  console.log(`⚡️ [Server]: Running on http://localhost:${port}`);
  console.log(`Serving client assets from: ${CLIENT_DIST_PATH}`);
  // Provide clear instructions for setting up API keys if they are missing in development.
  if (
    process.env.NODE_ENV !== 'production' &&
    (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !YOUTUBE_API_KEY)
  ) {
    console.warn('\n--- WARNING: API credentials unconfigured ---');
    console.warn(
      '  Some media service features (Spotify, YouTube) may be unavailable until you configure the following environment variables:',
    );
    console.warn('  SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, YOUTUBE_API_KEY');
    console.warn('  You can set these in a `.env` file in the `packages/server` directory.');
    console.warn('--------------------------------------------\n');
  }
});

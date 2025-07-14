import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { BackendMediaService } from '@muc/common';
import { ApiRouter } from './apiRouter.js';

async function start(): Promise<void> {
  const app = express();
  const port = process.env.PORT || 3000;
  const CORS_ALLOWED_ORIGIN = process.env.CORS_ALLOWED_ORIGIN;

  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const CLIENT_DIST_PATH =
    process.env.CLIENT_DIST_PATH || path.resolve(__dirname, '../../client/dist');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'script-src': ["'self'", 'https://api.deezer.com', 'https://itunes.apple.com'],
        },
      },
    }),
  );
  app.use(compression());
  app.use(express.json());

  // CORS configuration to control which domains can access the API.
  const localHosts = [`localhost:${port}`, `127.0.0.1:${port}`];
  if (process.env.NODE_ENV === 'development') {
    // In development, add the Vite dev server host.
    localHosts.push(`localhost:5173`, `127.0.0.1:5173`);
  }

  // Create a allowlist of full origins, including both http and https protocols for local development.
  const allowedOrigins: string[] = [
    ...localHosts.map((host) => `http://${host}`),
    ...localHosts.map((host) => `https://${host}`),
  ];

  if (process.env.NODE_ENV !== 'development' && CORS_ALLOWED_ORIGIN) {
    // In production, add specific origins from a comma-separated environment variable.
    allowedOrigins.push(...CORS_ALLOWED_ORIGIN.split(',').map((origin) => origin.trim()));
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like server-to-server) or from allowlisted origins.
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('This origin is not allowed by CORS configuration.'));
        }
      },
    }),
  );

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

    mediaService = await BackendMediaService.create(
      SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET
        ? { clientId: SPOTIFY_CLIENT_ID, clientSecret: SPOTIFY_CLIENT_SECRET }
        : undefined,
      YOUTUBE_API_KEY,
    );
  } catch (error) {
    console.error('Failed to initialize BackendMediaService:', error);
    process.exit(1);
  }

  const apiRouter = new ApiRouter(mediaService);
  app.use('/api', apiRouter.getRouter());

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
}

start().catch((error) => {
  console.error('Error starting server:', error instanceof Error ? error.message : error);
  process.exit(1);
});

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import {
  BackendMediaService,
  SpotifyClient,
  YoutubeClient,
  ItunesClient,
  CachedSpotifyClient,
  CachedYoutubeClient,
  CachedItunesClient,
} from '@muc/common';
import { ApiRouter } from './apiRouter.js';
import NodeCache from 'node-cache';
import morgan from 'morgan';
import supportsColor from 'supports-color';

// Global log helpers and color setup
const colorSupported = supportsColor.stdout;
const appPrefix = colorSupported ? '\x1b[32m[APP]\x1b[0m' : '[APP]';
const errorPrefix = colorSupported ? '\x1b[31m[ERR]\x1b[0m' : '[ERR]';
const requestPrefix = colorSupported ? '\x1b[36m[REQ]\x1b[0m ' : '[REQ] ';

function logApp(...args: unknown[]) {
  originalConsoleLog(appPrefix, ...args);
}
function logError(...args: unknown[]) {
  originalConsoleError(errorPrefix, ...args);
}

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

console.log = (...args: unknown[]) => {
  originalConsoleLog(appPrefix, ...args);
};
console.error = (...args: unknown[]) => {
  originalConsoleError(errorPrefix, ...args);
};

async function start(): Promise<void> {
  const app = express();
  const port = process.env.PORT || 3000;

  // Trust proxy headers (needed for HTTPS enforcement behind Fly.io proxy)
  // Set to 1 to trust only the first proxy (Fly.io)
  app.set('trust proxy', 1);

  app.use(morgan(requestPrefix + ':method :url :status :res[content-length] - :response-time ms :user-agent'));

  app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] === 'http') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });

  const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const CLIENT_DIST_PATH = process.env.CLIENT_DIST_PATH || path.resolve(__dirname, '../../client/dist');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'script-src': ["'self'", 'https://api.deezer.com'],
        },
      },
    }),
  );
  app.use(compression());
  app.use(express.json());

  // CORS configuration - only needed in development for Vite dev server
  if (process.env.NODE_ENV === 'development') {
    logApp('Development mode: Enabling CORS for Vite dev server');
    app.use(
      cors({
        origin: [`http://localhost:5173`, `https://localhost:5173`, `http://127.0.0.1:5173`, `https://127.0.0.1:5173`],
      }),
    );
  } else {
    logApp('Production mode: CORS disabled (same-origin deployment)');
  }

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

  const mediaServicePromise = (async (): Promise<BackendMediaService> => {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
      console.warn('Spotify API credentials not fully configured. Spotify features might be unavailable.');
    }
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not configured. YouTube features might be unavailable.');
    }

    const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600, useClones: false });

    let spotifyClient: CachedSpotifyClient | undefined;
    if (SPOTIFY_CLIENT_ID && SPOTIFY_CLIENT_SECRET) {
      const rawSpotifyClient = await SpotifyClient.create({
        clientId: SPOTIFY_CLIENT_ID,
        clientSecret: SPOTIFY_CLIENT_SECRET,
      });
      spotifyClient = new CachedSpotifyClient(rawSpotifyClient, cache);
    }

    let youtubeClient: CachedYoutubeClient | undefined;
    if (YOUTUBE_API_KEY) {
      const rawYoutubeClient = new YoutubeClient(YOUTUBE_API_KEY);
      youtubeClient = new CachedYoutubeClient(rawYoutubeClient, cache);
    }

    // iTunes client with caching (no API key required)
    const rawItunesClient = new ItunesClient();
    const itunesClient = new CachedItunesClient(rawItunesClient, cache);

    return BackendMediaService.createWithClients(undefined, itunesClient, spotifyClient, youtubeClient);
  })();

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const apiRouter = new ApiRouter(mediaServicePromise);
  app.use('/api', apiRouter.getRouter());

  app.use(express.static(CLIENT_DIST_PATH));

  // For all other GET requests not handled by API or static routes, serve the client's index.html
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(CLIENT_DIST_PATH, 'index.html'));
  });

  // Centralized error handling middleware.
  // Catches errors passed from async handlers or other middleware.
  // Parameters are typed with `_` prefix to indicate they are unused in this specific handler, improving readability.
  app.use((err: Error, _req: Request, res: Response) => {
    logError('Unhandled server error:', err instanceof Error ? err.message : err);
    res.status(500).json({ message: 'An unexpected internal server error occurred.' });
  });

  const server = app.listen(port, () => {
    logApp(`Server running on http://localhost:${port}`);
    logApp(`Serving client assets from: ${CLIENT_DIST_PATH}`);
    if (process.env.NODE_ENV !== 'production' && (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !YOUTUBE_API_KEY)) {
      logError('\n--- WARNING: API credentials unconfigured ---');
      logError(
        '  Some media service features (Spotify, YouTube) may be unavailable until you configure the following environment variables:',
      );
      logError('  SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, YOUTUBE_API_KEY');
      logError('  You can set these in a `.env` file in the `packages/server` directory.');
      logError('--------------------------------------------\n');
    }
  });

  // graceful shutdown handling for Docker containers
  const gracefulShutdown = (signal: string) => {
    logApp(`Received ${signal}, shutting down gracefully...`);
    server.close(() => {
      logApp('Server closed. Exiting process.');
      process.exit(0);
    });

    // force close after 10 seconds
    setTimeout(() => {
      logError('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // listen for termination signals
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

start().catch(error => {
  logError('Error starting server:', error instanceof Error ? error.message : error);
  process.exit(1);
});
